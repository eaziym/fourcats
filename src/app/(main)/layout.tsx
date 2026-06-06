import { PetCareProvider } from "@/components/pet-care/pet-care-provider";
import { ensureAppAccess } from "@/lib/auth/server";
import { getPetCareContext } from "@/lib/pet-queries";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAppAccess();
  const petContext = await getPetCareContext();
  return <PetCareProvider value={petContext}>{children}</PetCareProvider>;
}
