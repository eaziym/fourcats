"use client";

import {
  Heart,
  Map as MapIcon,
  PanelRightClose,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CollapsibleAssistantPanel } from "@/components/assistant/collapsible-assistant-panel";
import { usePetCare } from "@/components/pet-care/pet-care-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AGENT_TOOLS,
  ASSISTANT_AGENTS,
  HIDDEN_AGENT_LABELS,
} from "@/lib/agents/registry";
import { buildContextPetSubtitle } from "@/lib/assistant-pet-copy";
import { petPlaceholderImage } from "@/lib/pet-data";

const STORAGE_KEY = "llp-assistant-context-collapsed";

const sources = [
  {
    source: "Google Maps API",
    title: "Heartland Paws Reviews",
    detail:
      '"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn\'t irritate her skin at all...."',
    icon: MapIcon,
    iconWrap: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    source: "Pet Lovers Centre Data",
    title: "Oatmeal Medicated Shampoo",
    detail:
      "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
    icon: ShoppingBag,
    iconWrap: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
] as const;

function AgentCatalogCard({
  id,
  label,
  description,
  tools,
}: {
  id: string;
  label: string;
  description: string;
  tools: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {tools.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {tools.map((tool) => (
            <code
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
              key={`${id}-${tool}`}
            >
              {tool}
            </code>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ContextSidebar() {
  const { pet } = usePetCare();
  const [collapsed, setCollapsed] = useState(false);
  const petName = pet?.name ?? "Your pet";
  const petAvatar = pet ? petPlaceholderImage(pet.species) : undefined;
  const petSubtitle = pet
    ? buildContextPetSubtitle(pet)
    : "Add details in Pet Profiles";

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
      breakpointClass="lg:flex"
      className="bg-card"
      collapsed={collapsed}
      collapsedLabel="Context"
      expandTooltip="Show AI context sources"
      expandedInnerWidthClass="w-[320px]"
      expandedWidthClass="w-[320px]"
      onToggle={toggleCollapsed}
      side="right"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            AI context & agents
          </span>
          <button
            aria-label="Collapse AI context sources"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={toggleCollapsed}
            title="Hide AI context sources"
            type="button"
          >
            <PanelRightClose className="size-4" />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          One pet assistant handles your messages and delegates to specialists
          when needed. You&apos;ll see which agent and tools were used in the
          chat.
        </p>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50/60 p-3 dark:border-amber-700/40 dark:bg-amber-950/30">
          <Avatar className="size-9 border border-border">
            <AvatarImage alt={petName} src={petAvatar} />
            <AvatarFallback>{petName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              {petName}
            </p>
            <p className="text-xs leading-snug text-muted-foreground">
              {petSubtitle}
            </p>
          </div>
        </div>

        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Available agents
        </div>
        <div className="mb-6 grid gap-2.5">
          {ASSISTANT_AGENTS.map((agent) => (
            <AgentCatalogCard
              description={agent.description}
              id={agent.id}
              key={agent.id}
              label={agent.label}
              tools={AGENT_TOOLS[agent.id] ?? []}
            />
          ))}
          <AgentCatalogCard
            description="Prepares booking drafts when you ask to schedule at a groomer or vet."
            id="booking"
            label={HIDDEN_AGENT_LABELS.booking ?? "Booking assistant"}
            tools={AGENT_TOOLS.booking ?? []}
          />
        </div>

        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Sample sources
        </div>
        <div className="grid gap-3">
          {sources.map(({ source, title, detail, icon: Icon, iconWrap }) => (
            <div
              className="rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              key={title}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded ${iconWrap}`}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {source}
                </span>
              </div>
              <h4 className="mb-1 text-sm font-semibold leading-tight text-foreground">
                {title}
              </h4>
              <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>

        <div className="pointer-events-none mt-auto flex justify-center pt-8 opacity-[0.12]">
          <Heart aria-hidden className="size-[120px] text-primary" />
        </div>
      </div>
    </CollapsibleAssistantPanel>
  );
}
