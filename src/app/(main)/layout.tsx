import { ensureAppAccess } from "@/lib/auth/server";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAppAccess();
  return children;
}
