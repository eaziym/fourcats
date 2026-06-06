import { Bot, UserRound } from "lucide-react";
import Image from "next/image";

function BotAvatar() {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Bot className="size-5" />
    </div>
  );
}

export function ChatBubble({
  speaker,
  content,
  imageUrl,
}: {
  speaker: string;
  content: string;
  imageUrl?: string;
}) {
  if (speaker === "assistant") {
    return (
      <div className="flex items-start gap-4">
        <BotAvatar />
        <div className="max-w-2xl space-y-4 whitespace-pre-wrap rounded-2xl bg-card/90 p-6 text-lg leading-8 shadow-sm backdrop-blur">
          {content}
          {imageUrl ? (
            <Image
              alt="Generated meme"
              src={imageUrl}
              width={512}
              height={512}
              unoptimized
              className="max-h-[min(70vh,520px)] w-full max-w-md rounded-xl border border-border object-contain"
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-auto flex max-w-3xl flex-row-reverse items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <UserRound className="size-5" />
      </div>
      <div className="space-y-3 rounded-2xl bg-primary/15 p-6 text-lg leading-8 text-foreground shadow-sm">
        {imageUrl ? (
          <Image
            alt="Your pet"
            src={imageUrl}
            width={400}
            height={400}
            unoptimized
            className="max-h-64 w-full max-w-xs rounded-lg border border-border object-contain"
          />
        ) : null}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export function LoadingBubble() {
  return (
    <div className="flex items-start gap-4">
      <BotAvatar />
      <div className="rounded-2xl bg-card/90 px-6 py-4 shadow-sm backdrop-blur">
        <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  );
}
