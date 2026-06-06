import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";
import { SignupForm } from "./signup-form";
import { getUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  if (user) {
    const count = await prisma.pet.count({ where: { userId: user.id } });
    redirect(
      count === 0
        ? "/onboarding"
        : params.next?.startsWith("/")
          ? params.next
          : "/",
    );
  }

  return (
    <AuthScreen>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <BrandWordmark />
          <p className="mt-3 text-muted-foreground">
            Create an account with your email
          </p>
        </div>
        <SignupForm />
        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </main>
    </AuthScreen>
  );
}
