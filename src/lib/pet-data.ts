import {
  Bone,
  Bot,
  Cross,
  LayoutDashboard,
  Map as MapIcon,
  PawPrint,
  Scissors,
  ShoppingBag,
} from "lucide-react";

export const petPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5Bw9pyLW7L7GdkWQZioIUXJaW4jweQZOeH11m-8TXbxwv3Vhbv6fw50Aj_V7cwu0oWDmCr4DaKFE5U5U1vNo_v6ty2AJ90ORQFdPEJHXUzPlC_aSeODoWlo2U0qemWtYaKFueZHPBA0WabMXFpKDkRJCED-e9VA9wACWeMhcXVkTXuW7R94mc6HubYx2wmTYF8my7HRZG13bss2rO3GZQ7fi_1BKSdybcbm-gNaZerZKQUDqMRsC3sjGWG6X8KxmAACjpgOMkWhhX";

export const mochiPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjyf1cAFJJy7tu7uEbnFYn-aJr0KkIlGrAbTDzJgFkZMV1C8rEnwJY_TLRiaNW-GreL4R-GtItkX6uQgi7k6z_-dwZetX2KWotALR4p9Y4COvbcu8sD4HqCthDyxd8RJs4WNVD_3l1MEt-UmaWcxaZAQXKXEdRsQq52A3OMtMu_EIkwoaRp47MHUag7ssY93pe3t5GmKKSm5xxIQvfEfev1-yVwZRfx_3JJTWpWkCW7nOpX0YIiWUga5x2lhJLMFKsyGPtNC3wWSh0";

/** Stock art when the profile has no photo URL in the database yet. */
export function petPlaceholderImage(species: string): string {
  return species.toLowerCase() === "cat" ? petPortrait : mochiPortrait;
}

/** Resolved pet avatar: uploaded photo when present, species stock art otherwise. */
export function petAvatarSrc(pet: {
  photoUrl: string | null;
  species: string;
}): string {
  return pet.photoUrl ?? petPlaceholderImage(pet.species);
}

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "assistant", label: "AI Assistant", icon: Bot, href: "/assistant" },
  {
    id: "discovery",
    label: "Local Discovery",
    icon: MapIcon,
    href: "/discovery",
  },
  { id: "profiles", label: "Pet Profiles", icon: PawPrint, href: "/profiles" },
] as const;

export type Section = (typeof navItems)[number]["id"];

export const discoveryFilters = [
  { label: "Groomers", icon: Scissors, active: true },
  { label: "Vets", icon: Cross, active: false },
  { label: "Pet-Friendly Cafes", icon: Bone, active: false },
  { label: "Supplies", icon: ShoppingBag, active: false },
];
