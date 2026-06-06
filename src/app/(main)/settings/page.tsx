import { PetCareShell } from "@/components/pet-care/shell";
import { getPetCareContext } from "@/lib/pet-queries";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const ctx = await getPetCareContext();

  return (
    <PetCareShell active="settings">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-8 md:px-10">
        <div className="mb-8">
          <h1 className="font-llp-display text-2xl font-bold text-foreground">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage your profile and monthly pet-care budgets. These preferences
            are shared with the AI assistant to tailor recommendations.
          </p>
        </div>
        <SettingsForm
          fallbackDisplayName={ctx.userDisplayName}
          settings={ctx.settings}
        />
      </div>
    </PetCareShell>
  );
}
