import type { Metadata } from "next";
import { LandingPage } from "./landing-page";

export const metadata: Metadata = {
  title: "Little Lovely Pets — AI pet care for Singapore",
  description:
    "Lovely, hassle-free pet care for Singapore. Track daily routines, discover trusted local services, and get AI tips for dogs, cats and small pets.",
};

export default function Page() {
  return <LandingPage />;
}
