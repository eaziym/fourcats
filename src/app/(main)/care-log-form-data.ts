export type DailyCareMood = "happy" | "ok" | "off";

export type DailyCareLogInput = {
  petId: string;
  fed: boolean;
  mood: DailyCareMood;
  weightKg: number | null;
  notes: string | null;
};

function getTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseFed(value: string) {
  if (value === "yes") return true;
  if (value === "no") return false;
  throw new Error("Choose whether your pet was fed.");
}

function parseMood(value: string): DailyCareMood {
  if (value === "happy" || value === "ok" || value === "off") return value;
  throw new Error("Choose a mood.");
}

function parseWeightKg(value: string) {
  if (value === "") return null;

  const weightKg = Number(value);
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 200) {
    throw new Error("Weight must be between 0.1 and 200 kg.");
  }

  return Math.round(weightKg * 100) / 100;
}

export function parseDailyCareLogFormData(
  formData: FormData,
): DailyCareLogInput {
  const petId = getTrimmed(formData, "petId");
  if (!petId) {
    throw new Error("No pet profile found.");
  }

  const notes = getTrimmed(formData, "notes");

  return {
    petId,
    fed: parseFed(getTrimmed(formData, "fed")),
    mood: parseMood(getTrimmed(formData, "mood")),
    weightKg: parseWeightKg(getTrimmed(formData, "weightKg")),
    notes: notes === "" ? null : notes,
  };
}
