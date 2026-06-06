"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { SignInFormData } from "@/schemas/auth.schemas";
import { signInSchema } from "@/schemas/auth.schemas";

export function LoginForm({
  nextPath,
  serverError,
}: {
  nextPath?: string;
  serverError?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    serverError === "session"
      ? "Email link expired or invalid. Try signing in again."
      : serverError
        ? "Something went wrong. Try again."
        : null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const raw: SignInFormData = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setPending(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    const next =
      nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.push(next);
    router.refresh();
  }

  return (
    <SpotlightCard className="w-full max-w-md border-[#dac0c3]/60">
      <CardContent className="p-8">
        <form className="grid gap-6" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              className="h-12 rounded-xl border-[#dac0c3]/70"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="current-password"
              className="h-12 rounded-xl border-[#dac0c3]/70"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="h-12 rounded-full bg-gradient-to-r from-[#ff8da1] to-[#9c3f53] font-bold"
            disabled={pending}
            type="submit"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
