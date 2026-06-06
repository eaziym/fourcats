"use client";

import { Heart, Info, Map as MapIcon, ShoppingBag } from "lucide-react";
import { usePetCare } from "@/components/pet-care/pet-care-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSISTANT_AGENTS, type AssistantAgentId } from "@/lib/agents/registry";
import { buildContextPetSubtitle } from "@/lib/assistant-pet-copy";
import { petPlaceholderImage } from "@/lib/pet-data";

const sources = [
  {
    source: "Google Maps API",
    title: "Heartland Paws Reviews",
    detail:
      '"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn\'t irritate her skin at all...."',
    icon: MapIcon,
    iconWrap: "bg-[#E8F0FE] text-[#1A73E8]",
  },
  {
    source: "Pet Lovers Centre Data",
    title: "Oatmeal Medicated Shampoo",
    detail:
      "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
    icon: ShoppingBag,
    iconWrap: "bg-[#FCE8E6] text-[#D93025]",
  },
] as const;

export function ContextSidebar({
  activeAgentId,
}: {
  activeAgentId: AssistantAgentId;
}) {
  const { pet } = usePetCare();
  const agent = ASSISTANT_AGENTS.find((a) => a.id === activeAgentId);
  const petName = pet?.name ?? "Your pet";
  const petAvatar = pet ? petPlaceholderImage(pet.species) : undefined;
  const petSubtitle = pet
    ? buildContextPetSubtitle(pet)
    : "Add details in Pet Profiles";

  return (
    <aside className="hidden min-h-0 w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[#dac0c3]/30 bg-[var(--llp-surface)] shadow-[-4px_0_20px_rgba(29,53,87,0.02)] lg:flex">
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Info className="size-5 shrink-0" />
          {activeAgentId === "meme" ? "Meme agent" : "AI context sources"}
        </h3>
        {agent ? (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{agent.label}.</span>{" "}
            {agent.description}
          </p>
        ) : null}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#ffd167] bg-gradient-to-r from-[#ffdf9b]/50 to-white p-3 dark:from-[#ffdf9b]/20 dark:to-card">
          <Avatar className="size-9 border border-[#dac0c3]/30">
            <AvatarImage alt={petName} src={petAvatar} />
            <AvatarFallback>{petName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#785a00] dark:text-secondary-foreground">
              {petName}
            </p>
            <p className="text-xs leading-snug text-[#554244] dark:text-muted-foreground">
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
          <div className="grid flex-1 gap-3">
            {sources.map(({ source, title, detail, icon: Icon, iconWrap }) => (
              <div
                className="rounded-xl border border-[#dac0c3]/40 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
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
          <Heart className="size-[120px] text-primary" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
