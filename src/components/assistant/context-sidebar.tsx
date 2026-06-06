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
import { ASSISTANT_AGENTS, type AssistantAgentId } from "@/lib/agents/registry";
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

export function ContextSidebar({
  activeAgentId,
}: {
  activeAgentId: AssistantAgentId;
}) {
  const { pet } = usePetCare();
  const [collapsed, setCollapsed] = useState(false);
  const agent = ASSISTANT_AGENTS.find((a) => a.id === activeAgentId);
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
            {activeAgentId === "meme" ? "Meme agent" : "AI context sources"}
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

        {agent ? (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{agent.label}.</span>{" "}
            {agent.description}
          </p>
        ) : null}
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
        {activeAgentId === "meme" ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Tips</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Use a clear, well-lit face or body shot of your pet.</li>
              <li>
                Memes are generated with OpenAI image editing (gpt-image-1).
              </li>
              <li>Requires OPENAI_API_KEY on the server.</li>
            </ul>
          </div>
        ) : (
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
        )}

        <div className="pointer-events-none mt-auto flex justify-center pt-8 opacity-[0.12]">
          <Heart aria-hidden className="size-[120px] text-primary" />
        </div>
      </div>
    </CollapsibleAssistantPanel>
  );
}
