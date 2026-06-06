"use client";

import { Layers } from "lucide-react";
import { DelegationActivity } from "@/components/assistant/delegation-activity";
import { AssistantMessageContent } from "@/components/assistant/chat-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAgentLabel } from "@/lib/agents/registry";
import type { ChatMessageDTO, DelegationStepDTO } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 shadow-sm ring-1 ring-primary/15">
      <Layers className="size-4 text-primary" />
    </div>
  );
}

function previewText(message: ChatMessageDTO): string {
  const text = message.content.trim();
  if (!text) {
    if (message.data?.imageUrl) return "Meme image";
    if (message.data?.products?.length) return "Product picks";
    if (message.data?.places?.length) return "Nearby places";
    if (message.data?.bookingDraft) return "Booking draft";
    return "Response";
  }
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function MultiAgentResponse({
  messages,
  onBookPlace,
  bookingPlaceId,
}: {
  messages: ChatMessageDTO[];
  onBookPlace?: (placeId: string, placeName: string) => void;
  bookingPlaceId?: string | null;
}) {
  if (messages.length === 0) return null;

  const delegationSteps = messages.reduce<DelegationStepDTO[] | undefined>(
    (found, message) => found ?? message.data?.delegationSteps,
    undefined,
  );

  return (
    <div className="flex max-w-[min(100%,46rem)] flex-col gap-3">
      {delegationSteps && delegationSteps.length > 0 ? (
        <DelegationActivity steps={delegationSteps} />
      ) : null}

      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl rounded-tl-md border border-white/60 bg-white/85 shadow-[0_4px_20px_rgba(29,53,87,0.05)] backdrop-blur-md dark:border-white/10 dark:bg-card/90">
          <div className="border-b border-border/60 px-4 py-2.5">
            <p className="text-xs font-medium text-foreground">
              {messages.length} specialists answered
            </p>
            <p className="text-[11px] text-muted-foreground">
              Switch tabs to read each reply — maps and cards stay in one place.
            </p>
          </div>

          <Tabs className="gap-0" defaultValue={messages[0].id}>
            <div className="border-b border-border/60 px-2 pt-2">
              <TabsList
                className={cn(
                  "h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted/50 p-1",
                  messages.length > 2 && "flex-nowrap",
                )}
              >
                {messages.map((message) => (
                  <TabsTrigger
                    className="max-w-[11rem] shrink-0 truncate px-3 py-1.5 text-xs sm:max-w-none sm:text-sm"
                    key={message.id}
                    title={previewText(message)}
                    value={message.id}
                  >
                    {getAgentLabel(message.agentId) ?? message.agentId}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {messages.map((message) => (
              <TabsContent
                className="max-h-[min(70vh,640px)] overflow-y-auto px-4 py-4"
                key={message.id}
                value={message.id}
              >
                <AssistantMessageContent
                  bookingPlaceId={bookingPlaceId}
                  message={message}
                  onBookPlace={onBookPlace}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
