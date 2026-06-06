import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";
import { LoginForm } from "./login-form";
import { getUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  if (user) {
    const count = await prisma.pet.count({ where: { userId: user.id } });
    redirect(count === 0 ? "/onboarding" : params.next?.startsWith("/") ? params.next : "/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="mb-10 text-center">
        <BrandWordmark />
        <p className="mt-2 text-[#554244]">Sign in to continue</p>
      </div>
      <LoginForm nextPath={params.next} serverError={params.error} />
      <p className="mt-8 text-sm text-[#554244]">
        No account?{" "}
        <Link className="font-semibold text-[#9c3f53] underline" href="/signup">
          Create one
        </Link>
      </p>
    </main>
  );
}
