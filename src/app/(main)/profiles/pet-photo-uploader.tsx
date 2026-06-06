"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Mascot, type MascotSpecies } from "@/components/pet-care/mascot";
import { type UploadPhotoState, uploadPetPhoto } from "./actions";

function toMascotSpecies(species: string): MascotSpecies {
  const s = species.toLowerCase();
  if (s === "dog" || s === "cat" || s === "rabbit") return s;
  if (s === "small_pet") return "rabbit";
  return "brand";
}

export function PetPhotoUploader({
  petId,
  species,
  photoUrl,
  name,
}: {
  petId: string;
  species: string;
  photoUrl: string | null;
  name: string;
}) {
  const [state, formAction, pending] = useActionState<
    UploadPhotoState,
    FormData
  >(uploadPetPhoto, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview ?? photoUrl;

  return (
    <form
      action={formAction}
      className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4"
      ref={formRef}
    >
      <input name="petId" type="hidden" value={petId} />
      <div
        className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-card"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 18%, var(--primary-container), color-mix(in srgb, var(--primary-container) 60%, #fff))",
        }}
      >
        {shown ? (
          // biome-ignore lint/performance/noImgElement: local preview / Supabase URL
          <img alt={name} className="size-full object-cover" src={shown} />
        ) : (
          <Mascot blink={false} size={72} species={toMascotSpecies(species)} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Pet photo</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          JPG, PNG, WEBP or GIF · up to 5 MB
        </p>
        {state?.error ? (
          <p className="mt-1 text-xs text-destructive">{state.error}</p>
        ) : null}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--llp-sh-1)] transition-colors hover:bg-muted">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {pending ? "Uploading…" : shown ? "Change photo" : "Upload photo"}
          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            disabled={pending}
            name="photo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPreview(URL.createObjectURL(file));
              formRef.current?.requestSubmit();
            }}
            type="file"
          />
        </label>
      </div>
    </form>
  );
}
