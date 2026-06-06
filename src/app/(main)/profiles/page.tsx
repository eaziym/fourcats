import { redirect } from "next/navigation";
import { PetCareShell } from "@/components/pet-care/shell";
import { getUserPets } from "@/lib/pet-queries";
import { ProfilesScreen } from "./profiles-screen";

export default async function ProfilesPage() {
  const pets = await getUserPets();
  if (pets.length === 0) {
    redirect("/onboarding");
  }

  return (
    <PetCareShell active="profiles">
      <ProfilesScreen pets={pets} />
    </PetCareShell>
  );
}
