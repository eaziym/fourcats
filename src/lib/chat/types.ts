import type { BookingDraft } from "@/lib/booking/types";
import type { FoodProduct, ServicePlaceCard } from "@/lib/pet-data/format";

/** Rich payload attached to an assistant message (rendered as cards/images). */
export type ChatMessageData = {
  products?: FoodProduct[];
  places?: ServicePlaceCard[];
  bookingDraft?: BookingDraft;
  imageUrl?: string;
  isError?: boolean;
};

export type ChatMessageDTO = {
  id: string;
  /** "user" | "assistant" */
  role: "user" | "assistant";
  /** "user" for user messages; otherwise the agent id that produced it. */
  agentId: string;
  content: string;
  data?: ChatMessageData | null;
  createdAt: string;
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  updatedAt: string;
};
