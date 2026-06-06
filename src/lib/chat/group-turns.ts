import type { ChatMessageDTO } from "@/lib/chat/types";

/** One user message plus any assistant replies that follow it. */
export type ChatTurn = {
  user: ChatMessageDTO | null;
  assistants: ChatMessageDTO[];
};

/** Group a flat transcript into conversation turns for rendering. */
export function groupChatTurns(messages: ChatMessageDTO[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  let i = 0;

  while (i < messages.length) {
    const message = messages[i];
    if (message.role === "user") {
      const user = message;
      i += 1;
      const assistants: ChatMessageDTO[] = [];
      while (i < messages.length && messages[i].role === "assistant") {
        assistants.push(messages[i]);
        i += 1;
      }
      turns.push({ user, assistants });
      continue;
    }

    turns.push({ user: null, assistants: [message] });
    i += 1;
  }

  return turns;
}
