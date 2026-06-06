import { Info, Map as MapIcon, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSISTANT_AGENTS, type AssistantAgentId } from "@/lib/agents/registry";
import { mochiPortrait } from "@/lib/pet-data";

const sources = [
  {
    source: "Google Maps API",
    title: "Heartland Paws Reviews",
    detail:
      '"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn\'t irritate her skin at all...."',
    icon: MapIcon,
  },
  {
    source: "Pet Lovers Centre Data",
    title: "Oatmeal Medicated Shampoo",
    detail:
      "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
    icon: ShoppingBag,
  },
];

export function ContextSidebar({
  activeAgentId,
}: {
  activeAgentId: AssistantAgentId;
}) {
  const agent = ASSISTANT_AGENTS.find((a) => a.id === activeAgentId);

  return (
    <aside className="hidden border-l border-border bg-card px-8 py-8 lg:block">
      <h3 className="mb-4 flex items-center gap-3 text-sm font-bold tracking-wide text-muted-foreground">
        <Info className="size-5" />
        {activeAgentId === "meme" ? "Meme agent" : "AI context sources"}
      </h3>
      {agent && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{agent.label}.</span>{" "}
          {agent.description}
        </p>
      )}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent bg-accent/30 p-3">
        <Avatar className="size-9">
          <AvatarImage alt="Mochi" src={mochiPortrait} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold text-accent-foreground">Mochi</p>
          <p className="text-xs text-muted-foreground">
            Shih Tzu • 4yo • Sensitive Skin
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
        <div className="grid gap-4">
          {sources.map(({ source, title, detail, icon: Icon }) => (
            <div
              className="rounded-2xl border border-border bg-muted/30 p-4"
              key={title}
            >
              <p className="mb-4 flex items-center gap-2 text-sm">
                <span className="rounded-md bg-primary/15 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
                {source}
              </p>
              <h4 className="mb-2 text-lg font-semibold">{title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
