import { PawPrint } from "lucide-react";

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {compact ? (
        <PawPrint className="size-7 shrink-0 text-primary" aria-hidden />
      ) : null}
      <span className="font-semibold tracking-tight text-foreground text-3xl md:text-4xl">
        FourCats
        {compact ? (
          <>
            <br />
            <span className="text-muted-foreground text-lg font-normal">
              Pet care
            </span>
          </>
        ) : (
          <span className="text-muted-foreground font-normal"> · Pet care</span>
        )}
      </span>
    </div>
  );
}
