"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/field";
import { conditions, otherMakeValue, regions } from "@/lib/config";
import { years } from "@/lib/format";
import { resolveMakeChoice } from "@/lib/search";

type Catalog = {
  categories: { name: string }[];
  makes: { name: string }[];
  models: { make: string; name: string }[];
};

type Initial = {
  make?: string;
  model?: string;
  year?: string;
  category?: string;
  condition?: string;
  location?: string;
  min?: string;
  max?: string;
  q?: string;
  sort?: string;
};

export function SearchForm({
  catalog,
  initial,
  variant,
}: {
  catalog: Catalog;
  initial?: Initial;
  variant: "hero" | "filters";
}) {
  const makeId = useId();
  const customMakeId = useId();
  const knownMakes = useMemo(() => catalog.makes.map((item) => item.name), [catalog.makes]);
  const startingMake = useMemo(
    () => resolveMakeChoice(initial?.make, knownMakes, ""),
    [initial?.make, knownMakes],
  );
  const [makeChoice, setMakeChoice] = useState(startingMake.choice);
  const [customMake, setCustomMake] = useState(startingMake.custom);
  const [model, setModel] = useState(initial?.model ?? "");
  const isOther = makeChoice === otherMakeValue;
  const models = useMemo(() => {
    if (isOther || !makeChoice) return isOther ? [] : catalog.models;
    return catalog.models.filter((item) => item.make === makeChoice);
  }, [catalog.models, isOther, makeChoice]);
  const yearOptions = useMemo(() => years(), []);

  function onMakeChange(value: string) {
    setMakeChoice(value);
    setModel("");
    if (value !== otherMakeValue) setCustomMake("");
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    for (const element of event.currentTarget.elements) {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        if (!element.value.trim()) element.disabled = true;
      }
    }
  }

  return (
    <form action="/browse" method="get" onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-1 text-sm font-medium">
        <label htmlFor={`${makeId}-keywords`}>Keywords</label>
        <input
          id={`${makeId}-keywords`}
          className={controlClass}
          name="q"
          defaultValue={initial?.q}
          placeholder="e.g. BMW alternator"
          autoComplete="off"
          enterKeyHint="search"
        />
        <p className="text-xs font-normal text-muted-foreground">
          Each word matches the title, description, make, model, category, or engine code. Dropdowns are optional.
        </p>
      </div>
      <div className={variant === "hero" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-5" : "grid gap-3 sm:grid-cols-2"}>
        <div className="grid gap-1 text-sm font-medium">
          <label htmlFor={makeId}>Make</label>
          <select
            id={makeId}
            className={controlClass}
            name={isOther ? undefined : "make"}
            value={makeChoice}
            onChange={(event) => onMakeChange(event.target.value)}
          >
            <option value="">Any make</option>
            {catalog.makes.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
            <option value={otherMakeValue}>Other make</option>
          </select>
          {isOther ? (
            <>
              <label htmlFor={customMakeId} className="mt-2">
                Type the make
              </label>
              <input
                id={customMakeId}
                className={controlClass}
                name="make"
                value={customMake}
                maxLength={40}
                onChange={(event) => setCustomMake(event.target.value)}
                placeholder="BMW, Mercedes, or any make not in the list"
                autoComplete="off"
              />
            </>
          ) : null}
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Model
          {isOther ? (
            <input
              className={controlClass}
              name="model"
              value={model}
              maxLength={40}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Any model"
              autoComplete="off"
            />
          ) : (
            <select className={controlClass} name="model" value={model} onChange={(event) => setModel(event.target.value)}>
              <option value="">Any model</option>
              {model && !models.some((item) => item.name === model) ? <option value={model}>{model}</option> : null}
              {models.map((item) => (
                <option key={`${item.make}-${item.name}`} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Year
          <select className={controlClass} name="year" defaultValue={initial?.year ?? ""}>
            <option value="">Any year</option>
            {yearOptions.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Part
          <select className={controlClass} name="category" defaultValue={initial?.category ?? ""}>
            <option value="">Any category</option>
            {catalog.categories.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        {variant === "hero" ? (
          <Button type="submit" variant="accent" size="xl" className="self-end font-display tracking-wide uppercase">
            Find Parts
          </Button>
        ) : null}
      </div>
      {variant === "filters" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-sm font-medium">
            Condition
            <select className={controlClass} name="condition" defaultValue={initial?.condition ?? ""}>
              <option value="">Any condition</option>
              {conditions.map((condition) => (
                <option key={condition}>{condition}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Location
            <select className={controlClass} name="location" defaultValue={initial?.location ?? ""}>
              <option value="">All Trinidad & Tobago</option>
              {regions.map((region) => (
                <option key={region.name}>{region.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Min TTD
            <input className={controlClass} name="min" inputMode="numeric" defaultValue={initial?.min} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Max TTD
            <input className={controlClass} name="max" inputMode="numeric" defaultValue={initial?.max} />
          </label>
          <label className="grid gap-1 text-sm font-medium sm:col-span-2">
            Sort
            <select className={controlClass} name="sort" defaultValue={initial?.sort ?? "recommended"}>
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
          <Button type="submit" size="lg" className="self-end sm:col-span-2">
            Update results
          </Button>
        </div>
      ) : null}
    </form>
  );
}
