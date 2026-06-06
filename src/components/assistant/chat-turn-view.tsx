"use client";

import {
  ChatMessageView,
  UserMessageView,
} from "@/components/assistant/chat-message";
import { MultiAgentResponse } from "@/components/assistant/multi-agent-response";
import type { ChatTurn } from "@/lib/chat/group-turns";

export function ChatTurnView({
  turn,
  onBookPlace,
  bookingPlaceId,
}: {
  turn: ChatTurn;
  onBookPlace?: (placeId: string, placeName: string) => void;
  bookingPlaceId?: string | null;
}) {
  const { user, assistants } = turn;

  return (
    <div className="flex flex-col gap-4">
      {user ? <UserMessageView message={user} /> : null}

      {assistants.length > 1 ? (
        <MultiAgentResponse
          bookingPlaceId={bookingPlaceId}
          messages={assistants}
          onBookPlace={onBookPlace}
        />
      ) : assistants.length === 1 ? (
        <ChatMessageView
          bookingPlaceId={bookingPlaceId}
          message={assistants[0]}
          onBookPlace={onBookPlace}
        />
      ) : null}
    </div>
  );
}
