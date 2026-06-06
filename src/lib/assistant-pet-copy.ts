import type { PetDTO } from "@/lib/pet-queries";

export function buildAssistantWelcome(pet: PetDTO | null): string {
  if (!pet) {
    return "Hi there! I'm ready to help with grooming, health, or lifestyle questions for your pet in Singapore.";
  }
  const kind =
    pet.breed?.trim() ||
    (pet.species.toLowerCase() === "dog"
      ? "dog"
      : pet.species.toLowerCase() === "cat"
        ? "cat"
        : pet.species);
  return `Hi there! How is ${pet.name} doing today? I'm ready to help with any grooming, health, or lifestyle questions you have for your ${kind}.`;
}

export function buildContextPetSubtitle(pet: PetDTO): string {
  const breed = pet.breed?.trim();
  const species =
    pet.species.toLowerCase() === "dog"
      ? "Dog"
      : pet.species.toLowerCase() === "cat"
        ? "Cat"
        : pet.species;
  const age =
    pet.ageYears != null ? `${Number(pet.ageYears)} yrs` : "Age not set";
  const med =
    pet.medicalConditions.length > 0
      ? pet.medicalConditions.slice(0, 2).join(", ")
      : "No conditions on file";
  return `${breed || species} • ${age} • ${med}`;
}
