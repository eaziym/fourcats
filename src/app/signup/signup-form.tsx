"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { SignUpFormData } from "@/schemas/auth.schemas";
import { signUpSchema } from "@/schemas/auth.schemas";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const form = new FormData(e.currentTarget);
    const raw: SignUpFormData = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
      terms: form.get("terms") === "on",
    };
    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error: signError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
        },
      },
    });
    setPending(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    if (data.session) {
      setInfo("Account created. Redirecting…");
      window.location.href = "/onboarding";
      return;
    }

    setInfo(
      "Check your email for a confirmation link. After confirming, sign in here.",
    );
  }

  return (
    <SpotlightCard className="w-full max-w-md border-[#dac0c3]/60">
      <CardContent className="p-8">
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                autoComplete="given-name"
                className="h-11 rounded-xl border-[#dac0c3]/70"
                id="firstName"
                name="firstName"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                autoComplete="family-name"
                className="h-11 rounded-xl border-[#dac0c3]/70"
                id="lastName"
                name="lastName"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              className="h-11 rounded-xl border-[#dac0c3]/70"
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
              autoComplete="new-password"
              className="h-11 rounded-xl border-[#dac0c3]/70"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              autoComplete="new-password"
              className="h-11 rounded-xl border-[#dac0c3]/70"
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              className="mt-1 size-4 shrink-0 rounded border border-[#dac0c3] accent-[#9c3f53]"
              id="terms"
              name="terms"
              required
              type="checkbox"
              value="on"
            />
            <Label className="font-normal leading-snug" htmlFor="terms">
              I agree to the terms and conditions
            </Label>
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="text-sm font-medium text-[#2c4366]" role="status">
              {info}
            </p>
          ) : null}
          <Button
            className="h-12 rounded-full bg-gradient-to-r from-[#ff8da1] to-[#9c3f53] font-bold"
            disabled={pending}
            type="submit"
          >
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
