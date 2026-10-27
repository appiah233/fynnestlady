"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CONCERN_LABELS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Cleansers",
  "Treatments",
  "Moisturisers",
  "Sun Care",
  "Body Care",
];

const SKIN_TYPES = ["all", "dry", "oily", "combination", "sensitive"];

const AVAILABILITY = [
  { value: "in-stock", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export function MobileFilterDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const [formData, setFormData] = useState({
    concern: searchParams.get("concern") ?? "",
    category: searchParams.get("category") ?? "",
    skinType: searchParams.get("skinType") ?? "",
    availability: searchParams.get("availability") ?? "",
    sort: searchParams.get("sort") ?? "featured",
  });

  useEffect(() => {
    setFormData({
      concern: searchParams.get("concern") ?? "",
      category: searchParams.get("category") ?? "",
      skinType: searchParams.get("skinType") ?? "",
      availability: searchParams.get("availability") ?? "",
      sort: searchParams.get("sort") ?? "featured",
    });
  }, [searchParams]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof HTMLDialogElement === "undefined") return;
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent, el: HTMLDialogElement) => {
      const r = el.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = outside(e, dialog);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e, dialog)) dialog.close();
    };
    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const openDrawer = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const closeDrawer = () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
  };

  const activeCount =
    (formData.concern ? 1 : 0) +
    (formData.category ? 1 : 0) +
    (formData.skinType ? 1 : 0) +
    (formData.availability ? 1 : 0);

  const buildUrl = (next: typeof formData) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.concern) params.set("concern", next.concern);
    else params.delete("concern");
    if (next.category) params.set("category", next.category);
    else params.delete("category");
    if (next.skinType) params.set("skinType", next.skinType);
    else params.delete("skinType");
    if (next.availability) params.set("availability", next.availability);
    else params.delete("availability");
    params.set("sort", next.sort);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Filters and sort (${activeCount} active)`}
        className="inline-flex min-h-11 items-center gap-2 text-utility font-bold border border-hairline rounded-sm bg-surface-panel px-4 py-2.5 hover:bg-surface-muted transition-colors"
      >
        <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
        <span>Filter &amp; Sort</span>
        {activeCount > 0 && (
          <span className="ml-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-primary-foreground text-[0.7rem] font-bold leading-none">
            {activeCount}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="ui-drawer"
        {...({ closedby: "any" } as Record<string, string>)}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-panel">
          <h2 id={titleId} className="font-display text-subheading m-0">
            Filter &amp; Sort
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm p-2 hover:bg-surface-muted transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface-panel">
          <div className="space-y-3">
            <p className="text-utility font-bold uppercase tracking-wider text-ink m-0">
              Sort by
            </p>
            <div className="space-y-2">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => {
                      const next = { ...prev, sort: s.value };
                      buildUrl(next);
                      closeDrawer();
                      return next;
                    });
                  }}
                  className={[
                    "w-full min-h-11 flex items-center justify-between px-3.5 py-2.5 rounded-sm border text-left text-body-sm transition-colors",
                    formData.sort === s.value
                      ? "bg-primary-soft border-primary text-primary font-bold"
                      : "border-hairline text-ink hover:bg-surface-muted",
                  ].join(" ")}
                >
                  <span>{s.label}</span>
                  {formData.sort === s.value && (
                    <span className="text-caption font-bold text-primary">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-hairline pt-6">
            <FilterField
              label="Skin concern"
              value={formData.concern}
              options={Object.entries(CONCERN_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, concern: value }))
              }
            />
            <FilterField
              label="Category"
              value={formData.category}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            />
            <FilterField
              label="Skin type"
              value={formData.skinType}
              options={SKIN_TYPES.map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              }))}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, skinType: value }))
              }
            />
            <FilterField
              label="Availability"
              value={formData.availability}
              options={AVAILABILITY}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, availability: value }))
              }
            />
          </div>
        </div>

        <div className="border-t border-hairline p-6 space-y-3 bg-surface-raised">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              buildUrl(formData);
              closeDrawer();
            }}
            className="w-full"
          >
            Apply filters
          </Button>
          <Button
            type="button"
            variant="quiet"
            onClick={() => {
              const cleared = {
                concern: "",
                category: "",
                skinType: "",
                availability: "",
                sort: "featured",
              };
              setFormData(cleared);
              buildUrl(cleared);
              closeDrawer();
            }}
            className="w-full"
          >
            Clear all filters
          </Button>
        </div>
      </dialog>
    </>
  );
}

function FilterField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(Boolean(value));
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="border-b border-hairline pb-3">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="flex min-h-11 w-full items-center justify-between py-2 text-left text-utility font-bold hover:text-primary transition-colors"
      >
        <span>{label}</span>
        <span className="flex items-center gap-2">
          {selectedLabel && (
            <span className="text-primary font-bold text-caption">
              {selectedLabel}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </span>
      </button>
      {expanded && (
        <div className="flex flex-col gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => onChange("")}
            className={`w-full min-h-10 text-left py-2 px-3 rounded-sm text-body-sm transition-colors ${
              value
                ? "hover:bg-surface-muted"
                : "bg-primary-soft text-primary font-bold"
            }`}
          >
            All {label.toLowerCase()}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full min-h-10 text-left py-2 px-3 rounded-sm text-body-sm transition-colors ${
                value === opt.value
                  ? "bg-primary-soft text-primary font-bold"
                  : "hover:bg-surface-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
