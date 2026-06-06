"use client";

import { ImagePlus, MapPin, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ChatMessageView,
  PendingMessage,
} from "@/components/assistant/chat-message";
import { ContextSidebar } from "@/components/assistant/context-sidebar";
import { SessionsSidebar } from "@/components/assistant/sessions-sidebar";
import { usePetCare } from "@/components/pet-care/pet-care-provider";
import { PetCareShell } from "@/components/pet-care/shell";
import { getAgentLabel } from "@/lib/agents/registry";
import type { BookingDraft } from "@/lib/booking/types";
import type {
  ChatMessageData,
  ChatMessageDTO,
  ChatSessionSummary,
  DelegationStepDTO,
} from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import {
  appendChatMessages,
  createChatSession,
  deleteChatSession,
  listChatSessions,
  loadChatSession,
} from "./session-actions";

function extractRecentPlaces(
  msgs: ChatMessageDTO[],
): { id: string; name: string }[] {
  const byId = new Map<string, string>();
  for (const m of msgs) {
    for (const p of m.data?.places ?? []) {
      byId.set(p.id, p.name);
    }
  }
  return [...byId.entries()].map(([id, name]) => ({ id, name }));
}

async function runBookingAgent(args: {
  message: string;
  servicePlaceId?: string;
  requestedService?: string;
  recentPlaces: { id: string; name: string }[];
}): Promise<{ content: string; data?: ChatMessageData | null }> {
  try {
    const res = await fetch("/api/agents/booking", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = (await res.json()) as {
      assistantText?: string;
      bookingDraft?: BookingDraft;
      toolError?: string;
      error?: string;
    };
    if (!res.ok)
      throw new Error(data.error || `Request failed (${res.status})`);
    return {
      content:
        data.assistantText ||
        data.toolError ||
        "Tell me which groomer or vet you'd like to book.",
      data: data.bookingDraft ? { bookingDraft: data.bookingDraft } : null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    return { content: `Sorry — ${msg}`, data: { isError: true } };
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function AssistantPage() {
  const { pet } = usePetCare();

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [creating, setCreating] = useState(false);

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [pendingSteps, setPendingSteps] = useState<DelegationStepDTO[] | null>(
    null,
  );
  const [bookingPending, setBookingPending] = useState(false);
  const [bookingPlaceId, setBookingPlaceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim();
    if (!q) return;
    setInput(q);
    window.history.replaceState(null, "", "/assistant");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await listChatSessions();
      if (!active) return;
      setSessions(list);
      if (list.length > 0) {
        setLoadingSession(true);
        setSessionId(list[0].id);
        const msgs = await loadChatSession(list[0].id);
        if (active) {
          setMessages(msgs ?? []);
          setLoadingSession(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scrollKey = `${messages.length}-${pendingSteps?.length ?? 0}-${bookingPending}-${sessionId}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when transcript changes
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollKey]);

  async function openSession(id: string) {
    if (id === sessionId || busy) return;
    setLoadingSession(true);
    setSessionId(id);
    setError(null);
    const msgs = await loadChatSession(id);
    setMessages(msgs ?? []);
    setLoadingSession(false);
  }

  async function handleNewChat() {
    if (busy) return;
    setCreating(true);
    const s = await createChatSession();
    setCreating(false);
    if (!s) {
      setError("Couldn't start a new chat. Please sign in again.");
      return;
    }
    setSessions((prev) => [s, ...prev]);
    setSessionId(s.id);
    setMessages([]);
    setError(null);
  }

  async function handleDeleteSession(id: string) {
    const ok = await deleteChatSession(id);
    if (!ok) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (id === sessionId) {
      setSessionId(null);
      setMessages([]);
    }
  }

  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setError("Location isn't available in this browser.");
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError(
          "Couldn't get your location — I'll use your pet's saved area instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function appendAssistantMessage(
    sid: string,
    msg: ChatMessageDTO,
  ): Promise<void> {
    setMessages((prev) => [...prev, msg]);
    try {
      await appendChatMessages(sid, [
        {
          role: msg.role,
          agentId: msg.agentId,
          content: msg.content,
          data: msg.data,
        },
      ]);
      const list = await listChatSessions();
      setSessions(list);
    } catch {
      /* best-effort */
    }
  }

  async function invokeBookingAgent(
    sid: string,
    opts: {
      message: string;
      servicePlaceId?: string;
      requestedService?: string;
      recentPlaces: { id: string; name: string }[];
    },
  ): Promise<void> {
    setBookingPending(true);
    const result = await runBookingAgent(opts);
    const assistantMsg: ChatMessageDTO = {
      id: `a-booking-${Date.now()}`,
      role: "assistant",
      agentId: "booking",
      content: result.content,
      data: {
        ...result.data,
        delegationSteps: [
          {
            agentId: "general",
            label: getAgentLabel("general") ?? "Pet assistant",
            status: "done",
            reasoning: "Booking request detected — delegating to booking.",
          },
          {
            agentId: "booking",
            label: getAgentLabel("booking") ?? "Booking assistant",
            status: "done",
            tools: ["create_booking_draft"],
          },
        ],
      },
      createdAt: new Date().toISOString(),
    };
    setBookingPending(false);
    await appendAssistantMessage(sid, assistantMsg);
  }

  async function handleBookPlace(placeId: string, placeName: string) {
    if (busy || bookingPending) return;
    setBookingPlaceId(placeId);
    setError(null);

    let sid = sessionId;
    if (!sid) {
      const s = await createChatSession();
      if (!s) {
        setError("Couldn't start a chat. Please sign in again.");
        setBookingPlaceId(null);
        return;
      }
      setSessions((prev) => [s, ...prev]);
      setSessionId(s.id);
      sid = s.id;
    }

    const userText = `Book an appointment at ${placeName}.`;
    const userMsg: ChatMessageDTO = {
      id: `u-book-${Date.now()}`,
      role: "user",
      agentId: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    try {
      await appendChatMessages(sid, [
        { role: "user", agentId: "user", content: userText },
      ]);
    } catch {
      /* best-effort */
    }

    const recentPlaces = extractRecentPlaces(messages);
    const serviceKind = messages.some(
      (m) =>
        m.agentId === "vet" && m.data?.places?.some((p) => p.id === placeId),
    )
      ? "Vet consultation"
      : "Grooming appointment";

    await invokeBookingAgent(sid, {
      message: userText,
      servicePlaceId: placeId,
      requestedService: serviceKind,
      recentPlaces,
    });
    setBookingPlaceId(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const text = input.trim();
    const attached = file;
    if (!text && !attached) return;

    setError(null);

    let sid = sessionId;
    if (!sid) {
      const s = await createChatSession();
      if (!s) {
        setError("Couldn't start a chat. Please sign in again.");
        return;
      }
      setSessions((prev) => [s, ...prev]);
      setSessionId(s.id);
      sid = s.id;
    }

    let previewDataUrl: string | undefined;
    if (attached) {
      try {
        previewDataUrl = await readAsDataUrl(attached);
      } catch {
        previewDataUrl = undefined;
      }
    }

    const now = Date.now();
    const userMsg: ChatMessageDTO = {
      id: `u-${now}`,
      role: "user",
      agentId: "user",
      content: text,
      data: previewDataUrl ? { imageUrl: previewDataUrl } : null,
      createdAt: new Date(now).toISOString(),
    };

    const history = messages
      .filter((m) => m.content.trim())
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const recentPlaces = extractRecentPlaces([...messages, userMsg]);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setBusy(true);
    setPendingSteps([
      {
        agentId: "general",
        label: getAgentLabel("general") ?? "Pet assistant",
        status: "running",
        reasoning: "Analyzing your request…",
      },
    ]);

    try {
      const fd = new FormData();
      fd.set("message", text);
      fd.set("history", JSON.stringify(history));
      fd.set("recentPlaces", JSON.stringify(recentPlaces));
      if (attached) fd.set("image", attached);
      if (coords) {
        fd.set("lat", String(coords.lat));
        fd.set("lng", String(coords.lng));
      }

      const res = await fetch("/api/agents/orchestrate", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        steps?: DelegationStepDTO[];
        messages?: {
          agentId: string;
          content: string;
          data?: ChatMessageData | null;
        }[];
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const assistantMsgs: ChatMessageDTO[] = (data.messages ?? []).map(
        (m, i) => ({
          id: `a-${m.agentId}-${Date.now()}-${i}`,
          role: "assistant" as const,
          agentId: m.agentId,
          content: m.content,
          data: m.data ?? null,
          createdAt: new Date().toISOString(),
        }),
      );

      setPendingSteps(null);
      setMessages((prev) => [...prev, ...assistantMsgs]);

      await appendChatMessages(sid, [
        {
          role: "user",
          agentId: "user",
          content: text,
          data: userMsg.data,
        },
        ...assistantMsgs.map((m) => ({
          role: m.role,
          agentId: m.agentId,
          content: m.content,
          data: m.data,
        })),
      ]);
      const list = await listChatSessions();
      setSessions(list);
    } catch (err) {
      setPendingSteps(null);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const isEmpty = messages.length === 0 && !pendingSteps && !bookingPending;

  return (
    <PetCareShell active="assistant" lockViewport>
      <main className="flex min-h-0 flex-1 overflow-hidden bg-background">
        <SessionsSidebar
          activeId={sessionId}
          creating={creating}
          onDelete={handleDeleteSession}
          onNew={handleNewChat}
          onSelect={openSession}
          sessions={sessions}
        />

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[34px_34px]">
          <div
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-8 pb-4 md:px-10"
            ref={scrollRef}
          >
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
              {loadingSession ? (
                <p className="m-auto text-sm text-muted-foreground">
                  Loading conversation…
                </p>
              ) : isEmpty ? (
                <div className="m-auto max-w-md text-center">
                  <h2 className="font-llp-display text-2xl font-bold text-foreground">
                    {pet
                      ? `How can I help ${pet.name} today?`
                      : "How can I help?"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask anything about care, food, grooming, vets, or memes —
                    the pet assistant will delegate to the right specialist
                    automatically.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <ChatMessageView
                      bookingPlaceId={bookingPlaceId}
                      key={m.id}
                      message={m}
                      onBookPlace={handleBookPlace}
                    />
                  ))}
                  {pendingSteps ? (
                    <PendingMessage
                      agentLabel={getAgentLabel("general")}
                      delegationSteps={pendingSteps}
                    />
                  ) : null}
                  {bookingPending ? (
                    <PendingMessage agentLabel={getAgentLabel("booking")} />
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border/60 bg-background/80 backdrop-blur-md">
            <form
              className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 md:px-6"
              onSubmit={handleSend}
            >
              {error ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {error}
                </p>
              ) : null}

              {file ? (
                <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                  <ImagePlus className="size-4 text-primary" />
                  <span className="max-w-[16rem] truncate">{file.name}</span>
                  <button
                    aria-label="Remove photo"
                    className="rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}

              {coords ? (
                <div className="flex items-center gap-2 self-start rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm text-primary">
                  <MapPin className="size-4 shrink-0" />
                  <span>Using your current location</span>
                  <button
                    aria-label="Clear location"
                    className="rounded-full p-0.5 text-primary/70 hover:text-destructive"
                    onClick={() => setCoords(null)}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}

              <div className="flex items-end gap-2 rounded-3xl border border-border bg-card/90 p-2 shadow-[var(--llp-sh-1)] backdrop-blur-md">
                <label
                  className={cn(
                    "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted",
                    file && "border-primary text-primary",
                  )}
                  title="Attach a pet photo"
                >
                  <ImagePlus className="size-5" />
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    ref={fileInputRef}
                    type="file"
                  />
                </label>

                <button
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                    coords && "border-primary text-primary",
                  )}
                  disabled={locating}
                  onClick={handleUseLocation}
                  title="Use your current location"
                  type="button"
                >
                  {locating ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <MapPin className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {coords ? "Location set" : "Use location"}
                  </span>
                </button>

                <textarea
                  className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend(e);
                    }
                  }}
                  placeholder={
                    pet
                      ? `Ask about ${pet.name}'s care, food, grooming, or health…`
                      : "Ask about your pet's care…"
                  }
                  rows={1}
                  value={input}
                />

                <button
                  aria-label="Send"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  disabled={busy || (!input.trim() && !file)}
                  type="submit"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </form>
          </div>
        </section>

        <ContextSidebar />
      </main>
    </PetCareShell>
  );
}
