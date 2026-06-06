import type { PetDTO } from "@/lib/pet-queries";

/** Pet-aware prompts for the sidebar suggestion box. */
export function buildSuggestedQuestions(pet: PetDTO | null): string[] {
  const name = pet?.name ?? "my pet";
  const species = pet?.species?.toLowerCase() ?? "pet";

  const questions = [
    `What food is best for ${name}?`,
    `Find groomers near me for ${name}`,
    `Which vet should I visit for ${name}?`,
    `What should I know about caring for a ${species} in Singapore?`,
    `Suggest affordable food options for ${name}`,
    `How often should ${name} get groomed?`,
    `What vaccines does ${name} need in Singapore?`,
    `Help me plan ${name}'s weekly care routine`,
  ];

  if (pet?.medicalConditions.length) {
    questions.push(`Food options for ${name} with ${pet.medicalConditions[0]}`);
  }
  if (pet?.dietaryRestrictions.length) {
    questions.push(
      `Find ${pet.dietaryRestrictions.join(", ")} food for ${name}`,
    );
  }

  return questions;
}
