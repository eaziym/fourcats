import { redirect } from "next/navigation";
import { PetCareShell } from "@/components/pet-care/shell";
import { getDiscoveryData } from "@/lib/discovery-queries";
import { getPetCareContext } from "@/lib/pet-queries";
import { DiscoveryView } from "./discovery-view";

export default async function DiscoveryPage() {
  const { pet } = await getPetCareContext();
  if (!pet) {
    redirect("/onboarding");
  }

  const data = await getDiscoveryData(pet);

  return (
    <PetCareShell active="discovery">
      <DiscoveryView
        data={data}
        pet={{
          name: pet.name,
          species: pet.species,
          medicalConditions: pet.medicalConditions,
        }}
      />
    </PetCareShell>
  );
}
