import { ensureOnboardingAccess } from "@/lib/auth/server";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "Add your pet | Little Lovely Pets",
  description: "Create a profile for your pet to get started.",
};

export default async function OnboardingPage() {
  await ensureOnboardingAccess();

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-5 pb-16 pt-10 md:px-16">
      <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
        <BrandWordmark />
        <h1 className="mt-6 font-[family-name:var(--font-brand)] text-3xl font-bold text-[#191c1d] md:text-4xl">
          Let&apos;s add your pet
        </h1>
        <p className="mt-3 max-w-lg text-lg text-[#554244]">
          You need at least one pet profile to use the app. You can add more
          details later from Pet Profiles.
        </p>
      </header>
      <OnboardingForm />
    </main>
  );
}
