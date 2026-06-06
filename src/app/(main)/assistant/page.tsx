"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AgentSelector } from "@/components/assistant/agent-selector";
import { ChatBubble, LoadingBubble } from "@/components/assistant/chat-bubble";
import { ChatInput, MemeChatInput } from "@/components/assistant/chat-input";
import { ContextSidebar } from "@/components/assistant/context-sidebar";
import { usePetCare } from "@/components/pet-care/pet-care-provider";
import { PetCareShell } from "@/components/pet-care/shell";
import type { AssistantAgentId } from "@/lib/agents/registry";
import { buildAssistantWelcome } from "@/lib/assistant-pet-copy";

const MEME_WELCOME =
  "I'm the Meme agent. Upload a photo of your pet, add an optional caption or vibe, and I'll generate a meme image using OpenAI image editing.";

type MemeMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};

export default function AssistantPage() {
  const { pet } = usePetCare();
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

  const welcomeText = useMemo(() => buildAssistantWelcome(pet), [pet]);
  const initialMessages = useMemo(
    () => [
      {
        id: "welcome",
        role: "assistant" as const,
        content: welcomeText,
        parts: [{ type: "text" as const, text: welcomeText }],
      },
    ],
    [welcomeText],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
  });

  const busy = status === "streaming" || status === "submitted";
  const chatPlaceholderPet = pet?.name ?? "your pet";
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
      if (!res.ok)
        throw new Error(data.error || `Request failed (${res.status})`);

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
      <main className="grid min-h-0 flex-1 bg-background lg:grid-cols-[1fr_320px]">
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(#dac0c3_1px,transparent_1px)] [background-size:34px_34px]">
          <div className="mx-auto mt-4 flex w-full max-w-4xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-center">
            <AgentSelector agentId={agentId} onAgentChange={setAgentId} />
          </div>

          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-8 pb-4 md:px-10"
          >
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 flex justify-center">
                <span className="rounded-full bg-muted/90 px-4 py-1.5 text-xs font-medium text-muted-foreground opacity-90">
                  Today
                </span>
              </div>

              {agentId === "general" ? (
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
                  {busy && messages.at(-1)?.role !== "assistant" && (
                    <LoadingBubble />
                  )}
                  {error ? (
                    <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm text-destructive">
                      {error.message ||
                        "Something went wrong. Please try again."}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <ChatBubble speaker="assistant" content={MEME_WELCOME} />
                  {memeMessages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      speaker={msg.role}
                      content={msg.text}
                      imageUrl={msg.imageUrl}
                    />
                  ))}
                  {memeBusy ? <LoadingBubble /> : null}
                  {memeError && !memeBusy ? (
                    <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {memeError}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {agentId === "general" ? (
            <ChatInput
              input={input}
              busy={busy}
              petName={chatPlaceholderPet}
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
