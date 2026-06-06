import { PawPrint } from "lucide-react";

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {compact ? (
        <PawPrint className="size-7 fill-current text-[#9c3f53]" />
      ) : null}
      <span className="font-[family-name:var(--font-brand)] text-3xl font-bold leading-tight text-[#9c3f53] md:text-4xl">
        Little Lovely{compact ? <br /> : " "}Pets
      </span>
    </div>
  );
}
