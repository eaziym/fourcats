import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Filter,
  PawPrint,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { uploadDog } from "@/lib/pet-data";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { BrandWordmark } from "@/components/pet-care/brand-wordmark";

export default function ProfilesPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-[#f8f9fa] px-5 shadow-sm md:px-16">
        <div className="flex items-center gap-3">
          <Link aria-label="Back to dashboard" href="/">
            <ArrowLeft className="size-6 text-[#554244]" />
          </Link>
          <BrandWordmark />
        </div>
        <span className="text-lg text-[#554244]">Setup</span>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 pt-24">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-brand)] text-4xl font-bold md:text-5xl">
            Let's meet your furry friend
          </h2>
          <p className="mt-3 text-xl text-[#554244]">
            Tell us a bit about them so we can tailor the best care in
            Singapore.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-bold text-[#9c3f53]">Basic Info</span>
              <span>Vitals</span>
              <span>Health</span>
              <span>Location</span>
            </div>
            <Progress
              className="h-2 bg-[#e1e3e4] [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#ff8da1] [&_[data-slot=progress-indicator]]:to-[#9c3f53]"
              value={25}
            />
          </div>
        </div>

        <SpotlightCard>
          <CardContent className="p-6 md:p-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="grid gap-7">
                <button
                  className="relative flex h-60 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#dac0c3] bg-[#f3f4f5]"
                  type="button"
                >
                  <img
                    alt="Upload pet"
                    className="absolute inset-0 size-full object-cover opacity-35"
                    src={uploadDog}
                  />
                  <div className="relative flex flex-col items-center">
                    <span className="mb-3 rounded-full bg-white p-4 text-[#9c3f53] shadow-sm">
                      <Camera className="size-7" />
                    </span>
                    <span className="font-semibold">Upload Photo</span>
                    <span className="text-sm text-[#554244]">
                      Show off that cute face
                    </span>
                  </div>
                </button>
                <div className="grid gap-2">
                  <Label className="font-semibold" htmlFor="pet-name">
                    Pet's Name
                  </Label>
                  <Input
                    id="pet-name"
                    className="h-16 rounded-xl border-[#dac0c3]/70 bg-[#f8f9fa] text-lg"
                    placeholder="e.g., Milo"
                  />
                </div>
              </div>

              <div className="grid content-start gap-7">
                <div>
                  <p className="mb-2 font-semibold">Species</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className="rounded-2xl border-2 border-[#9c3f53] bg-[#ffd9dd]/70 p-8 text-center font-bold"
                      type="button"
                    >
                      <PawPrint className="mx-auto mb-3 size-9 fill-current" />
                      Dog
                    </button>
                    <button
                      className="rounded-2xl bg-[#f3f4f5] p-8 text-center font-bold"
                      type="button"
                    >
                      <PawPrint className="mx-auto mb-3 size-9" />
                      Cat
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 font-semibold">
                  <span>Breed</span>
                  <div className="flex h-16 items-center justify-between rounded-xl border border-[#dac0c3]/70 bg-[#f8f9fa] px-5 text-lg text-[#191c1d]">
                    Select breed...
                    <Filter className="size-5 text-[#554244]" />
                  </div>
                  <span className="text-sm font-normal text-[#554244]">
                    Selecting "Singapore Special" helps us tailor local HDB
                    guidelines.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-end border-t border-[#dac0c3]/40 pt-8">
              <Button className="h-14 rounded-full bg-gradient-to-r from-[#ff8da1] to-[#9c3f53] px-10 text-xl font-bold shadow-md">
                Next: Vitals
                <ArrowRight className="size-6" />
              </Button>
            </div>
          </CardContent>
        </SpotlightCard>
      </section>
    </main>
  );
}
