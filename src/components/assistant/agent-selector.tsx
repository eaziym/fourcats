"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ASSISTANT_AGENTS, type AssistantAgentId } from "@/lib/agents/registry";

export function AgentSelector({
  agentId,
  onAgentChange,
}: {
  agentId: AssistantAgentId;
  onAgentChange: (id: AssistantAgentId) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = ASSISTANT_AGENTS.find((a) => a.id === agentId);

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card"
      >
        Agent: {current?.label ?? agentId}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-border bg-popover p-1 shadow-lg sm:left-1/2 sm:-translate-x-1/2">
          {ASSISTANT_AGENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                onAgentChange(a.id);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                a.id === agentId
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="block font-medium text-foreground">
                {a.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {a.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
