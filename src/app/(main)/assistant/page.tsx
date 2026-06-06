"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Bot,
  ChevronDown,
  Info,
  Loader2,
  Map as MapIcon,
  SendHorizontal,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PetCareShell } from "@/components/pet-care/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mochiPortrait } from "@/lib/pet-data";

const availableModels = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

const WELCOME_TEXT =
  "Hi there! How is Mochi doing today? I'm ready to help with any grooming, health, or lifestyle questions you have for your Shih Tzu.";

export default function AssistantPage() {
  const [modelId, setModelId] = useState("openai/gpt-4o-mini");
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { modelId },
      }),
    [modelId],
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

  const lastMsg = messages.at(-1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lastMsg]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <PetCareShell active="assistant">
      <main className="grid min-h-screen bg-[#f8f9fa] md:ml-64 lg:grid-cols-[1fr_320px]">
        <section className="relative flex h-screen flex-col overflow-hidden bg-[radial-gradient(#dac0c3_1px,transparent_1px)] [background-size:34px_34px]">
          <ModelSelector modelId={modelId} onModelChange={setModelId} />

          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-8 pb-4 md:px-10"
          >
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-[#edeeef] px-5 py-2 text-sm text-[#554244]">
                  Today
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    role={msg.role}
                    content={
                      msg.parts
                        ?.filter((p) => p.type === "text")
                        .map((p) => p.text)
                        .join("") || msg.content
                    }
                  />
                ))}

                {busy && messages.at(-1)?.role !== "assistant" && (
                  <div className="flex items-start gap-4">
                    <BotAvatar />
                    <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-[0_4px_20px_rgba(29,53,87,0.05)] backdrop-blur">
                      <Loader2 className="size-5 animate-spin text-[#9c3f53]" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                    {error.message || "Something went wrong. Please try again."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ChatInput
            input={input}
            busy={busy}
            onInputChange={setInput}
            onSubmit={handleSubmit}
          />
        </section>

        <ContextSidebar />
      </main>
    </PetCareShell>
  );
}

function ModelSelector({
  modelId,
  onModelChange,
}: {
  modelId: string;
  onModelChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = availableModels.find((m) => m.id === modelId);

  return (
    <div className="relative mx-auto mt-4 w-fit">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-[#dac0c3]/70 bg-white/80 px-4 py-1.5 text-sm text-[#554244] shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        {current?.label ?? modelId}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-1 w-48 -translate-x-1/2 rounded-xl border border-[#dac0c3]/60 bg-white p-1 shadow-lg">
          {availableModels.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onModelChange(m.id);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                m.id === modelId
                  ? "bg-[#ff8da1]/20 font-medium text-[#782338]"
                  : "text-[#554244] hover:bg-[#f3f4f5]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff8da1] text-[#782338]">
      <Bot className="size-5" />
    </div>
  );
}

function ChatBubble({ role, content }: { role: string; content: string }) {
  if (role === "assistant") {
    return (
      <div className="flex items-start gap-4">
        <BotAvatar />
        <div className="max-w-2xl whitespace-pre-wrap rounded-2xl bg-white/90 p-6 text-lg leading-8 shadow-[0_4px_20px_rgba(29,53,87,0.05)] backdrop-blur">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-auto flex max-w-3xl items-center gap-4">
      <div className="whitespace-pre-wrap rounded-2xl bg-gradient-to-br from-[#ffd9dd] to-[#ff8da1] p-6 text-lg leading-8 text-[#782338] shadow-sm">
        {content}
      </div>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffd167] text-[#765900]">
        <UserRound className="size-5" />
      </div>
    </div>
  );
}

function ChatInput({
  input,
  busy,
  onInputChange,
  onSubmit,
}: {
  input: string;
  busy: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="border-t border-[#dac0c3]/30 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] p-5 md:px-10">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-4xl items-center gap-4 rounded-full border border-[#dac0c3]/70 bg-white px-5 py-3 shadow-[0_12px_28px_rgba(29,53,87,0.14)]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about Mochi's health, diet, or local services..."
          className="flex-1 bg-transparent text-[#191c1d] placeholder:text-[#887274] focus:outline-none"
          disabled={busy}
        />
        <Button
          type="submit"
          className="size-11 rounded-full bg-[#9c3f53] disabled:opacity-50"
          size="icon"
          disabled={busy || !input.trim()}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizontal className="size-5" />
          )}
        </Button>
      </form>
    </div>
  );
}

function ContextSidebar() {
  const sources = [
    {
      source: "Google Maps API",
      title: "Heartland Paws Reviews",
      detail:
        '"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn\'t irritate her skin at all...."',
      icon: MapIcon,
    },
    {
      source: "Pet Lovers Centre Data",
      title: "Oatmeal Medicated Shampoo",
      detail:
        "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
      icon: ShoppingBag,
    },
  ];

  return (
    <aside className="hidden border-l border-[#dac0c3]/40 bg-white px-8 py-8 lg:block">
      <h3 className="mb-4 flex items-center gap-3 text-sm font-bold tracking-wide text-[#554244]">
        <Info className="size-5" />
        AI CONTEXT SOURCES
      </h3>
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#ffd167] bg-gradient-to-r from-[#ffdf9b]/50 to-white p-3">
        <Avatar className="size-9">
          <AvatarImage alt="Mochi" src={mochiPortrait} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold text-[#785a00]">Mochi</p>
          <p className="text-xs text-[#554244]">
            Shih Tzu • 4yo • Sensitive Skin
          </p>
        </div>
      </div>
      <div className="grid gap-4">
        {sources.map(({ source, title, detail, icon: Icon }) => (
          <div
            className="rounded-2xl border border-[#dac0c3]/70 bg-[#f8f9fa] p-4"
            key={title}
          >
            <p className="mb-4 flex items-center gap-2 text-sm">
              <span className="rounded-md bg-[#d5e3ff] p-2 text-[#2c4366]">
                <Icon className="size-4" />
              </span>
              {source}
            </p>
            <h4 className="mb-2 text-xl">{title}</h4>
            <p className="text-sm leading-6 text-[#554244]">{detail}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
