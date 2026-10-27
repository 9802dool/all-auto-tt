"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { savePartAction } from "@/app/actions/dealer";
import type { FormState } from "@/app/actions/types";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { otherMakeValue } from "@/lib/config";
import { resolveMakeChoice } from "@/lib/search";
import type { Part } from "@/lib/types";

const empty: FormState = {};

type Catalog = {
  categories: { name: string }[];
  makes: { name: string }[];
  models: { make: string; name: string }[];
};

export function PartForm({
  part,
  catalog,
  regions,
  conditions,
  transmissions,
  years,
  location,
}: {
  part?: Part | null;
  catalog: Catalog;
  regions: readonly string[];
  conditions: readonly string[];
  transmissions: readonly string[];
  years: number[];
  location: string;
}) {
  const [state, action] = useActionState(savePartAction, empty);
  const knownMakes = catalog.makes.map((item) => item.name);
  const startingMake = resolveMakeChoice(part?.make, knownMakes, knownMakes[0] ?? otherMakeValue);
  const [makeChoice, setMakeChoice] = useState(startingMake.choice);
  const [customMake, setCustomMake] = useState(startingMake.custom);
  const isOther = makeChoice === otherMakeValue;
  const [kept, setKept] = useState(part?.photos ?? []);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const models = useMemo(
    () => (isOther ? [] : catalog.models.filter((model) => model.make === makeChoice).map((model) => model.name)),
    [catalog.models, isOther, makeChoice],
  );

  async function onPhotos(list: FileList | null) {
    if (!list?.length || !fileRef.current) return;
    const next: File[] = [];
    const shots: { name: string; url: string }[] = [];
    for (const file of Array.from(list).slice(0, 8)) {
      const compressed = await compressPhoto(file);
      next.push(compressed);
      shots.push({ name: compressed.name, url: URL.createObjectURL(compressed) });
    }
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    fileRef.current.files = transfer.files;
    setPreviews(shots);
  }

  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {part ? <input type="hidden" name="id" value={part.id} /> : null}
      {kept.map((photo) => (
        <input key={photo} type="hidden" name="existing_photo" value={photo} />
      ))}
      <Field label="Title" hint="Include the year, make and part. Example: 2014 Toyota Axio gearbox.">
        <input className={controlClass} name="title" required minLength={4} defaultValue={part?.title ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select className={controlClass} name="category" required defaultValue={part?.category ?? catalog.categories[0]?.name}>
            {catalog.categories.map((category) => (
              <option key={category.name}>{category.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Condition">
          <select className={controlClass} name="condition" defaultValue={part?.condition ?? conditions[0]}>
            {conditions.map((condition) => (
              <option key={condition}>{condition}</option>
            ))}
          </select>
        </Field>
        <Field label="Make">
          <select
            className={controlClass}
            name={isOther ? undefined : "make"}
            required
            value={makeChoice}
            onChange={(event) => setMakeChoice(event.target.value)}
          >
            {catalog.makes.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
            <option value={otherMakeValue}>Other make</option>
          </select>
        </Field>
        {isOther ? (
          <Field label="Type the make" hint="For BMW, Mercedes, and any make that is not in the list." className="sm:col-span-2">
            <input
              className={controlClass}
              name="make"
              required
              minLength={2}
              maxLength={40}
              value={customMake}
              onChange={(event) => setCustomMake(event.target.value)}
              placeholder="BMW"
              autoComplete="off"
            />
          </Field>
        ) : null}
        <Field label="Model">
          <input className={controlClass} name="model" list="model-list" defaultValue={part?.model ?? ""} placeholder="Axio" />
          <datalist id="model-list">
            {models.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </Field>
        <Field label="Year from">
          <select className={controlClass} name="year_from" defaultValue={part?.year_from ?? ""}>
            <option value="">Any</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </Field>
        <Field label="Year to">
          <select className={controlClass} name="year_to" defaultValue={part?.year_to ?? ""}>
            <option value="">Same / open</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </Field>
        <Field label="Engine code">
          <input className={controlClass} name="engine_code" defaultValue={part?.engine_code ?? ""} placeholder="1NZ-FE" />
        </Field>
        <Field label="Transmission">
          <select className={controlClass} name="transmission_type" defaultValue={part?.transmission_type ?? "Automatic"}>
            {transmissions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (TT$)">
          <input className={controlClass} name="price_ttd" inputMode="numeric" required defaultValue={part?.price_ttd ?? ""} />
        </Field>
        <Field label="Location">
          <select className={controlClass} name="location" required defaultValue={part?.location ?? location}>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="negotiable" defaultChecked={part?.negotiable ?? false} className="size-4" />
        Price is negotiable
      </label>
      <Field label="Status">
        <select className={controlClass} name="status" defaultValue={part?.status ?? "available"}>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </Field>
      <Field label="Description">
        <textarea className={`${controlClass} h-32 py-2`} name="description" defaultValue={part?.description ?? ""} />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Photos</legend>
        <p className="text-xs text-muted-foreground">Up to 8. Phone photos are compressed in the browser, then resized again on the server.</p>
        <div className="flex flex-wrap gap-2">
          {kept.map((photo) => (
            <figure key={photo} className="relative">
              <img src={photo} alt="Part photo" className="size-20 rounded-lg object-cover" />
              <button
                type="button"
                className="absolute -top-2 -right-2 rounded-full bg-charcoal px-2 text-xs text-white"
                onClick={() => setKept((current) => current.filter((item) => item !== photo))}
              >
                Remove
              </button>
            </figure>
          ))}
          {previews.map((photo) => (
            <img key={photo.url} src={photo.url} alt="Part photo preview" className="size-20 rounded-lg object-cover" />
          ))}
        </div>
        <input
          ref={fileRef}
          className="sr-only"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(event) => void onPhotos(event.target.files)}
        />
        <button
          type="button"
          className="h-11 rounded-xl border border-dashed border-orange px-4 text-sm font-semibold"
          onClick={() => fileRef.current?.click()}
        >
          Add photos from camera or gallery
        </button>
      </fieldset>
      <SubmitButton size="lg" pendingLabel="Saving the part…">
        {part ? "Save listing" : "Publish listing"}
      </SubmitButton>
    </form>
  );
}

async function compressPhoto(file: File) {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.75));
    bitmap.close();
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
