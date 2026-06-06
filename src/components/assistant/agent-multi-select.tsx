"use client";

import { Check } from "lucide-react";
import { ASSISTANT_AGENTS, type AssistantAgentId } from "@/lib/agents/registry";
import { cn } from "@/lib/utils";

export function AgentMultiSelect({
  selected,
  onToggle,
}: {
  selected: AssistantAgentId[];
  onToggle: (id: AssistantAgentId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Agents:</span>
      {ASSISTANT_AGENTS.map((a) => {
        const active = selected.includes(a.id);
        return (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/12 text-primary"
                : "border-border bg-card/70 text-muted-foreground hover:bg-muted",
            )}
            key={a.id}
            onClick={() => onToggle(a.id)}
            title={a.description}
            type="button"
          >
            {active ? <Check className="size-3.5" /> : null}
            {a.label}
          </button>
        );
      })}
      {selected.length > 1 ? (
        <span className="text-xs text-muted-foreground">
          · delegating to {selected.length} agents
        </span>
      ) : null}
    </div>
  );
}
