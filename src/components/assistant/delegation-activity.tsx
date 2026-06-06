"use client";

import { ArrowRight, Bot, Wrench } from "lucide-react";
import { getAgentLabel } from "@/lib/agents/registry";
import type { DelegationStepDTO } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

function StepStatus({ status }: { status: DelegationStepDTO["status"] }) {
  if (status === "running") {
    return (
      <span
        aria-hidden
        className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"
      />
    );
  }
  if (status === "error") {
    return <span className="size-2 rounded-full bg-amber-500" title="Error" />;
  }
  return <span className="size-2 rounded-full bg-emerald-500" title="Done" />;
}

export function DelegationActivity({
  steps,
  pending,
}: {
  steps: DelegationStepDTO[];
  pending?: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <div className="ml-11 max-w-xl rounded-2xl border border-border/70 bg-muted/30 p-3.5 text-sm shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <Bot className="size-3.5" />
        Agent activity
        {pending ? (
          <span className="font-normal normal-case tracking-normal text-primary">
            · working
          </span>
        ) : null}
      </div>

      <ol className="space-y-2">
        {steps.map((step, index) => {
          const label =
            step.label || getAgentLabel(step.agentId) || step.agentId;
          const isRouteStep = index === 0 && step.reasoning;

          return (
            <li
              className="rounded-xl border border-border/60 bg-card/80 px-3 py-2.5"
              key={`${step.agentId}-${index}`}
            >
              <div className="flex items-start gap-2.5">
                <StepStatus status={step.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-foreground">{label}</span>
                    {index > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowRight className="size-3" />
                        delegated
                      </span>
                    ) : null}
                  </div>

                  {isRouteStep ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.reasoning}
                    </p>
                  ) : null}

                  {step.tools && step.tools.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Wrench className="size-3 text-muted-foreground" />
                      {step.tools.map((tool) => (
                        <code
                          className={cn(
                            "rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground",
                          )}
                          key={tool}
                        >
                          {tool}
                        </code>
                      ))}
                    </div>
                  ) : step.status === "running" ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Running tools…
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
