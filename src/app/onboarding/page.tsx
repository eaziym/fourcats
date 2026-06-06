import { AuthScreen } from "@/components/auth/auth-screen";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";
import { ensureOnboardingAccess } from "@/lib/auth/server";
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "Add your pet | FourCats",
  description: "Create a profile for your pet to get started.",
};

export default async function OnboardingPage() {
  await ensureOnboardingAccess();

  return (
    <AuthScreen>
      <main className="min-h-screen px-5 pt-12 pb-16 md:px-16">
        <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
          <BrandWordmark />
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Let&apos;s add your pet
          </h1>
          <p className="mt-3 max-w-lg text-lg text-muted-foreground">
            Add the core care details so recommendations can start with your
            pet&apos;s real profile.
          </p>
        </header>
        <OnboardingForm />
      </main>
    </AuthScreen>
  );
}
