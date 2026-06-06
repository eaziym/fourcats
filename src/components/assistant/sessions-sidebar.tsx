"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";
import type { ChatSessionSummary } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

export function SessionsSidebar({
  sessions,
  activeId,
  onNew,
  onSelect,
  onDelete,
  creating,
}: {
  sessions: ChatSessionSummary[];
  activeId: string | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  creating: boolean;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <div className="p-3">
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          disabled={creating}
          onClick={onNew}
          type="button"
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          History
        </p>
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            No conversations yet. Start a new chat.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {sessions.map((s) => (
              <li key={s.id}>
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-lg pr-1 transition-colors",
                    s.id === activeId ? "bg-primary/12" : "hover:bg-muted",
                  )}
                >
                  <button
                    className={cn(
                      "min-w-0 flex-1 truncate px-2.5 py-2 text-left text-sm",
                      s.id === activeId
                        ? "font-semibold text-primary"
                        : "text-foreground",
                    )}
                    onClick={() => onSelect(s.id)}
                    title={s.title}
                    type="button"
                  >
                    {s.title}
                  </button>
                  <button
                    aria-label="Delete chat"
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    onClick={() => onDelete(s.id)}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
