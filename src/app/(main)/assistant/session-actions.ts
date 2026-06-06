"use server";

import type { Prisma } from "@generated/prisma/client";
import { getUser } from "@/lib/auth/server";
import type {
  ChatMessageData,
  ChatMessageDTO,
  ChatSessionSummary,
} from "@/lib/chat/types";
import { prisma } from "@/lib/db";
import { enrichPlaceCards } from "@/lib/pet-data/enrich-places";

function titleFromText(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "New chat";
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean;
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const user = await getUser();
  if (!user) return [];
  const rows = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createChatSession(): Promise<ChatSessionSummary | null> {
  const user = await getUser();
  if (!user) return null;
  const row = await prisma.chatSession.create({
    data: { userId: user.id },
    select: { id: true, title: true, updatedAt: true },
  });
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function loadChatSession(
  sessionId: string,
): Promise<ChatMessageDTO[] | null> {
  const user = await getUser();
  if (!user) return null;
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    select: { id: true },
  });
  if (!session) return null;

  const rows = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const messages = await Promise.all(
    rows.map(async (r) => {
      const raw = (r.data as ChatMessageData | null) ?? null;
      const data =
        raw?.places && raw.places.length > 0
          ? { ...raw, places: await enrichPlaceCards(raw.places) }
          : raw;
      return {
        id: r.id,
        role: r.role === "user" ? ("user" as const) : ("assistant" as const),
        agentId: r.agentId,
        content: r.content,
        data,
        createdAt: r.createdAt.toISOString(),
      };
    }),
  );
  return messages;
}

type IncomingMessage = {
  role: "user" | "assistant";
  agentId: string;
  content: string;
  data?: ChatMessageData | null;
};

/** Persist a batch of messages (user + agent replies) and bump the session. */
export async function appendChatMessages(
  sessionId: string,
  messages: IncomingMessage[],
): Promise<ChatMessageDTO[] | null> {
  const user = await getUser();
  if (!user) return null;
  if (messages.length === 0) return [];

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    select: { id: true, title: true },
  });
  if (!session) return null;

  const created = await prisma.$transaction(
    messages.map((m) =>
      prisma.chatMessage.create({
        data: {
          sessionId,
          role: m.role,
          agentId: m.agentId,
          content: m.content,
          data: (m.data ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      }),
    ),
  );

  // Auto-title from the first user message if still default.
  const firstUser = messages.find((m) => m.role === "user");
  const shouldTitle = session.title === "New chat" && firstUser?.content;
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      updatedAt: new Date(),
      ...(shouldTitle ? { title: titleFromText(firstUser.content) } : {}),
    },
  });

  return created.map((r) => ({
    id: r.id,
    role: r.role === "user" ? "user" : "assistant",
    agentId: r.agentId,
    content: r.content,
    data: (r.data as ChatMessageData | null) ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function renameChatSession(
  sessionId: string,
  title: string,
): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const clean = title.trim().slice(0, 80) || "New chat";
  const res = await prisma.chatSession.updateMany({
    where: { id: sessionId, userId: user.id },
    data: { title: clean },
  });
  return res.count > 0;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const res = await prisma.chatSession.deleteMany({
    where: { id: sessionId, userId: user.id },
  });
  return res.count > 0;
}
