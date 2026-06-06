"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({
  onSignOut,
  className,
}: {
  onSignOut?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    onSignOut?.();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setPending(false);
  }

  return (
    <button
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-3 py-2 text-left text-[#554244] hover:bg-[#e7e8e9] disabled:opacity-50",
        className,
      )}
      disabled={pending}
      onClick={handleSignOut}
      type="button"
    >
      <LogOut className="size-5 shrink-0" />
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
