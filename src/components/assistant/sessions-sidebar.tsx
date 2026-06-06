"use client";

import { MessageSquarePlus, PanelLeftClose, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CollapsibleAssistantPanel } from "@/components/assistant/collapsible-assistant-panel";
import type { ChatSessionSummary } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "llp-assistant-sessions-collapsed";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <CollapsibleAssistantPanel
      breakpointClass="md:flex"
      className="bg-card/40"
      collapsed={collapsed}
      collapsedLabel="History"
      expandTooltip="Show chat history"
      expandedInnerWidthClass="w-60"
      expandedWidthClass="w-60"
      onToggle={toggleCollapsed}
      side="left"
    >
      <div className="flex items-center justify-between gap-2 p-3 pb-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          History
        </p>
        <button
          aria-label="Collapse history"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={toggleCollapsed}
          title="Hide history"
          type="button"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>
      <div className="p-3 pt-2">
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
    </CollapsibleAssistantPanel>
  );
}
