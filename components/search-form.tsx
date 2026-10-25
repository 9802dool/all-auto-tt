"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/field";
import { conditions, regions } from "@/lib/config";
import { years } from "@/lib/format";

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
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const models = useMemo(
    () => catalog.models.filter((item) => !make || item.make === make),
    [catalog.models, make],
  );
  const [yearOptions, setYearOptions] = useState<number[]>(() => {
    const list: number[] = [];
    // Fixed span so prerender does not read the clock. The effect below replaces it.
    for (let year = 2027; year >= 1998; year -= 1) list.push(year);
    return list;
  });
  useEffect(() => {
    setYearOptions(years());
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    for (const element of event.currentTarget.elements) {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        if (!element.value) element.disabled = true;
      }
    }
  }

  return (
    <form action="/browse" method="get" onSubmit={onSubmit} className="grid gap-3">
      {variant === "filters" ? (
        <label className="grid gap-1 text-sm font-medium">
          Search
          <input className={controlClass} name="q" defaultValue={initial?.q} placeholder="Title or engine code" />
        </label>
      ) : null}
      <div className={variant === "hero" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-5" : "grid gap-3 sm:grid-cols-2"}>
        <label className="grid gap-1 text-sm font-medium">
          Make
          <select
            className={controlClass}
            name="make"
            value={make}
            onChange={(event) => {
              setMake(event.target.value);
              setModel("");
            }}
          >
            <option value="">Any make</option>
            {catalog.makes.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Model
          <select className={controlClass} name="model" value={model} onChange={(event) => setModel(event.target.value)}>
            <option value="">Any model</option>
            {models.map((item) => (
              <option key={`${item.make}-${item.name}`}>{item.name}</option>
            ))}
          </select>
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
