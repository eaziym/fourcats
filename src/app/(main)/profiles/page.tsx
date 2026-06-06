import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";
import { PetCareShell } from "@/components/pet-care/shell";
import { Progress } from "@/components/ui/progress";
import { getPetCareContext } from "@/lib/pet-queries";
import { ProfilesPetForm } from "./profiles-pet-form";

function profileStrength(pet: {
  name: string;
  breed: string | null;
  ageYears: string | null;
  weightKg: string | null;
  locationPostalCode: string | null;
  locationLabel: string | null;
  medicalConditions: string[];
  notes: string | null;
}) {
  let n = 0;
  const total = 6;
  if (pet.name.trim()) n++;
  if (pet.breed?.trim()) n++;
  if (pet.ageYears != null) n++;
  if (pet.weightKg != null) n++;
  if (pet.locationPostalCode?.trim() || pet.locationLabel?.trim()) n++;
  if (pet.medicalConditions.length > 0 || pet.notes?.trim()) n++;
  return Math.round((n / total) * 100);
}

export default async function ProfilesPage() {
  const { pet } = await getPetCareContext();
  if (!pet) {
    redirect("/onboarding");
  }
  const strength = profileStrength(pet);

  return (
    <PetCareShell active="profiles">
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-5 shadow-sm backdrop-blur-md md:px-10">
          <div className="flex items-center gap-3">
            <Link aria-label="Back to dashboard" href="/">
              <ArrowLeft className="size-6 text-muted-foreground" />
            </Link>
            <BrandWordmark />
          </div>
          <span className="text-lg text-muted-foreground">Edit profile</span>
        </header>

        <section className="mx-auto max-w-5xl px-5 py-10">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {pet.name}&apos;s profile
            </h2>
            <p className="mt-3 text-xl text-muted-foreground">
              Update vitals and notes — we use this across the dashboard and
              assistant.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <div className="mb-3 flex justify-between text-sm">
                <span className="font-semibold text-primary">Profile data</span>
                <span className="text-muted-foreground">
                  {strength}% complete
                </span>
              </div>
              <Progress
                className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-primary"
                value={strength}
              />
            </div>
          </div>

          <ProfilesPetForm pet={pet} />
        </section>
      </main>
    </PetCareShell>
  );
}
