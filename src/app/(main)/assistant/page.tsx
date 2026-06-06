"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AgentSelector } from "@/components/assistant/agent-selector";
import { ChatBubble, LoadingBubble } from "@/components/assistant/chat-bubble";
import { ChatInput, MemeChatInput } from "@/components/assistant/chat-input";
import { ContextSidebar } from "@/components/assistant/context-sidebar";
import { PetCareShell } from "@/components/pet-care/shell";
import type { AssistantAgentId } from "@/lib/agents/registry";

const WELCOME_TEXT =
  "Hi there! How is Mochi doing today? I'm ready to help with any grooming, health, or lifestyle questions you have for your Shih Tzu.";

const MEME_WELCOME =
  "I'm the Meme agent. Upload a photo of your pet, add an optional caption or vibe, and I'll generate a meme image using OpenAI image editing.";

type MemeMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};

export default function AssistantPage() {
  const [agentId, setAgentId] = useState<AssistantAgentId>("general");
  const [input, setInput] = useState("");
  const [memeMessages, setMemeMessages] = useState<MemeMessage[]>([]);
  const [memeInput, setMemeInput] = useState("");
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [memeBusy, setMemeBusy] = useState(false);
  const [memeError, setMemeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_TEXT,
        parts: [{ type: "text" as const, text: WELCOME_TEXT }],
      },
    ],
  });

  const busy = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastScrollKey =
    agentId === "general"
      ? messages.at(-1)?.id
      : (memeMessages.at(-1)?.id ?? memeBusy);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lastScrollKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    sendMessage({ text });
  }

  async function handleMemeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (memeBusy) return;
    if (!memeFile) {
      setMemeError("Please choose a pet photo (PNG, JPEG, or WebP).");
      return;
    }
    setMemeError(null);
    setMemeBusy(true);

    const text =
      memeInput.trim() || "Create a funny, shareable meme featuring my pet.";
    const previewDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(reader.error ?? new Error("Failed to read image"));
      reader.readAsDataURL(memeFile);
    });
    setMemeMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text, imageUrl: previewDataUrl },
    ]);

    try {
      const fd = new FormData();
      fd.set("image", memeFile);
      fd.set("message", text);
      const res = await fetch("/api/agents/meme", { method: "POST", body: fd });
      const data = (await res.json()) as {
        assistantText?: string;
        memeImageDataUrl?: string;
        toolError?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      setMemeMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text:
            data.assistantText ||
            (data.memeImageDataUrl
              ? "Here is your meme."
              : data.toolError || "No image returned."),
          imageUrl: data.memeImageDataUrl,
        },
      ]);
      setMemeInput("");
      setMemeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMemeError(msg);
      setMemeMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: `Sorry — ${msg}` },
      ]);
    } finally {
      setMemeBusy(false);
    }
  }

  return (
    <PetCareShell active="assistant">
      <main className="grid min-h-screen bg-background md:ml-64 lg:grid-cols-[1fr_320px]">
        <section className="relative flex h-screen flex-col overflow-hidden bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[34px_34px]">
          <div className="mx-auto mt-4 flex w-full max-w-4xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-center">
            <AgentSelector agentId={agentId} onAgentChange={setAgentId} />
          </div>

          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-8 pb-4 md:px-10"
          >
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground">
                  Today
                </span>
              </div>

              {agentId === "general" ? (
                <GeneralChat
                  messages={messages}
                  busy={busy}
                  error={error}
                />
              ) : (
                <MemeChat
                  messages={memeMessages}
                  busy={memeBusy}
                  error={memeError}
                />
              )}
            </div>
          </div>

          {agentId === "general" ? (
            <ChatInput
              input={input}
              busy={busy}
              onInputChange={setInput}
              onSubmit={handleSubmit}
            />
          ) : (
            <MemeChatInput
              input={memeInput}
              busy={memeBusy}
              file={memeFile}
              fileInputRef={fileInputRef}
              onInputChange={setMemeInput}
              onFileChange={setMemeFile}
              onSubmit={handleMemeSubmit}
            />
          )}
        </section>

        <ContextSidebar activeAgentId={agentId} />
      </main>
    </PetCareShell>
  );
}

function GeneralChat({
  messages,
  busy,
  error,
}: {
  messages: { id: string; role: string; content: string; parts?: { type: string; text: string }[] }[];
  busy: boolean;
  error: Error | undefined;
}) {
  return (
    <div className="flex flex-col gap-6">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          speaker={msg.role}
          content={
            msg.parts
              ?.filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("") || msg.content
          }
        />
      ))}
      {busy && messages.at(-1)?.role !== "assistant" && <LoadingBubble />}
      {error && (
        <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm text-destructive">
          {error.message || "Something went wrong. Please try again."}
        </div>
      )}
    </div>
  );
}

function MemeChat({
  messages,
  busy,
  error,
}: {
  messages: MemeMessage[];
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ChatBubble speaker="assistant" content={MEME_WELCOME} />
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          speaker={msg.role}
          content={msg.text}
          imageUrl={msg.imageUrl}
        />
      ))}
      {busy && <LoadingBubble />}
      {error && !busy && (
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </div>
      )}
    </div>
  );
}
