import {
  Bot,
  Bone,
  Check,
  ClipboardCheck,
  Cross,
  LayoutDashboard,
  Map as MapIcon,
  PawPrint,
  Scissors,
  ShoppingBag,
  UserRound,
} from "lucide-react";

export const petPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5Bw9pyLW7L7GdkWQZioIUXJaW4jweQZOeH11m-8TXbxwv3Vhbv6fw50Aj_V7cwu0oWDmCr4DaKFE5U5U1vNo_v6ty2AJ90ORQFdPEJHXUzPlC_aSeODoWlo2U0qemWtYaKFueZHPBA0WabMXFpKDkRJCED-e9VA9wACWeMhcXVkTXuW7R94mc6HubYx2wmTYF8my7HRZG13bss2rO3GZQ7fi_1BKSdybcbm-gNaZerZKQUDqMRsC3sjGWG6X8KxmAACjpgOMkWhhX";

export const mochiPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjyf1cAFJJy7tu7uEbnFYn-aJr0KkIlGrAbTDzJgFkZMV1C8rEnwJY_TLRiaNW-GreL4R-GtItkX6uQgi7k6z_-dwZetX2KWotALR4p9Y4COvbcu8sD4HqCthDyxd8RJs4WNVD_3l1MEt-UmaWcxaZAQXKXEdRsQq52A3OMtMu_EIkwoaRp47MHUag7ssY93pe3t5GmKKSm5xxIQvfEfev1-yVwZRfx_3JJTWpWkCW7nOpX0YIiWUga5x2lhJLMFKsyGPtNC3wWSh0";

export const beaglePortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCv94TFws-tNGWP412mfGDKxzJ2Z4XByL8qakxZsbZ7ckBtXI3brbpNhp5Qu2BI3ADK4E8nhzFQG4G3AaFFpFxoCUfLmTNNETF2Jr-84LyG9d2O_9JwIM3yMg5lR6n5JAPXmpTNomZGI9a1EF0TdpACAflvKptgWs9JzLI04LY4q39Wb61r3GFrwmrzBQyRakJTmDB21y-yN-JL7tSLC3GIOTgANmiVgT-VVv04qrnxSnFrEs-rTDAoncMHvq1YY9rr3-f0g0loxibP";

export const groomerInterior =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAlLKuZPIhuJM2C0jxueuLSLdneouU7Gor2PjNGg7b7Lh4fJk1AX3pPpY7vuWuq7nD75zK-0Fy5H2ihq-V6fBAfd1_W0E6p22O1LZiJWj9yh7kT6p0dUtzqhy94LYEAlVeO-w0wz2M0pQjcZP8aV2xb-u3FGxj9cFyaDnk6Vxw_Vd_fqIvR2Zdhwx08TEqev5O5Sxb1oYIX-rca5KIz8YF46RLMJ8OgQ63XsCfQ4aM6YjQRm8VOiVYG2c_mepLMwCA-Lv-Bp4xFMHU";

export const uploadDog =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBDns6lVMF2hdG1OHEC4sXq75t76bgKwMKft85OPru7uDfoEIVcvDoS7Lily-SUAdRiZV0vDKpQ8qR2B5YLIUmvEbDXFM9kcQG0wFU3OeYnOwZJ0FA_XuL0FvOlK_mc92ElLXZy5FPFbxaMVLB03RT0yvI4zVUslho91BHnWzCceCD8xwELNwBGRj9I_JW2eFBDg3iW7tnhsYkh1shIt-fpzVuYQ9q8RbRj0SPz_SsroX3s9v6LTx0cWG_n3_84LBY3WNJ_2iJQyBSs";

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

export const careLogItems = [
  {
    title: "Morning Feeding",
    subtitle: "1/2 cup hypoallergenic kibble",
    time: "08:00 AM",
    icon: Check,
    tone: "bg-[#d5e3ff] text-[#2c4366]",
    done: true,
  },
  {
    title: "Heartworm Medication",
    subtitle: "Monthly chewable",
    time: "",
    icon: ClipboardCheck,
    tone: "bg-[#ff8da1] text-[#782338]",
    done: false,
  },
  {
    title: "Evening Walk",
    subtitle: "East Coast Park",
    time: "06:30 PM",
    icon: UserRound,
    tone: "bg-[#f8f9fa] text-[#554244] border border-[#dac0c3]",
    done: false,
  },
];

export const discoveryFilters = [
  { label: "Groomers", icon: Scissors, active: true },
  { label: "Vets", icon: Cross, active: false },
  { label: "Pet-Friendly Cafes", icon: Bone, active: false },
  { label: "Supplies", icon: ShoppingBag, active: false },
];
