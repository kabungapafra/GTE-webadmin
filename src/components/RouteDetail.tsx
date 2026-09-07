"use client";

import { useState, useTransition } from "react";
import {
  updateRouteField,
  updateRouteArrayField,
  deleteRoute,
  addItineraryDay,
  updateItineraryDay,
  toggleItineraryDayHighlight,
  deleteItineraryDay,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/app/(dashboard)/routes/actions";
import { useRouter } from "next/navigation";

const GRADES = ["easy", "moderate", "remote"];

type Route = {
  id: string;
  slug: string;
  name: string;
  days: number;
  km: number;
  price: number;
  currency: string;
  grade: string;
  region: string | null;
  badge: string | null;
  blurb: string | null;
  tags: unknown;
  chips: unknown;
  overviewLead: string | null;
  overviewBody: string | null;
  bestMonths: string | null;
  included: unknown;
  excluded: unknown;
  colour: string | null;
  tarmac: number | null;
  image: string | null;
  imageFocus: string | null;
  photo: string | null;
};

type ItineraryDay = {
  id: string;
  dayNumber: number;
  duration: string | null;
  title: string;
  body: string | null;
  night: string | null;
  highlight: boolean;
};

type Testimonial = { id: string; quote: string; author: string };

const asStringArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export default function RouteDetail({
  route,
  days,
  testimonials,
}: {
  route: Route;
  days: ItineraryDay[];
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const [scalar, setScalar] = useState({
    name: route.name,
    slug: route.slug,
    region: route.region ?? "",
    badge: route.badge ?? "",
    grade: route.grade,
    colour: route.colour ?? "#5A6B47",
    tarmac: route.tarmac ?? 0,
    days: route.days,
    km: route.km,
    price: route.price,
    currency: route.currency,
    blurb: route.blurb ?? "",
    overview_lead: route.overviewLead ?? "",
    overview_body: route.overviewBody ?? "",
    best_months: route.bestMonths ?? "",
    image_focus: route.imageFocus ?? "",
    photo: route.photo ?? "",
  });
  const [arrays, setArrays] = useState({
    tags: asStringArray(route.tags).join("\n"),
    chips: asStringArray(route.chips).join("\n"),
    included: asStringArray(route.included).join("\n"),
    excluded: asStringArray(route.excluded).join("\n"),
  });

  function save(field: string, value: string | number) {
    startTransition(() => updateRouteField(route.id, field, value));
  }
  function saveArray(field: string, text: string) {
    const items = text.split("\n").map((s) => s.trim()).filter(Boolean);
    startTransition(() => updateRouteArrayField(route.id, field, items));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      startTransition(() => updateRouteField(route.id, "image", url));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3">
          <input
            value={scalar.name}
            onChange={(e) => setScalar((s) => ({ ...s, name: e.target.value }))}
            onBlur={(e) => save("name", e.target.value)}
            className="font-display font-semibold text-2xl bg-transparent outline-none border-b border-transparent focus:border-black/20"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${route.name}"? This also removes its itinerary and testimonials.`)) {
              startTransition(async () => {
                await deleteRoute(route.id);
                router.push("/routes");
              });
            }
          }}
          className="text-[12px] text-[#B23B2E] hover:underline"
        >
          Delete route
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        <Field label="Slug">
          <input
            value={scalar.slug}
            onChange={(e) => setScalar((s) => ({ ...s, slug: e.target.value }))}
            onBlur={(e) => save("slug", e.target.value)}
            className="w-full bg-transparent outline-none font-mono text-[13px]"
          />
        </Field>
        <Field label="Region">
          <input
            value={scalar.region}
            onChange={(e) => setScalar((s) => ({ ...s, region: e.target.value }))}
            onBlur={(e) => save("region", e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </Field>
        <Field label="Badge">
          <input
            value={scalar.badge}
            onChange={(e) => setScalar((s) => ({ ...s, badge: e.target.value }))}
            onBlur={(e) => save("badge", e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </Field>
        <Field label="Grade">
          <select
            value={scalar.grade}
            onChange={(e) => {
              setScalar((s) => ({ ...s, grade: e.target.value }));
              save("grade", e.target.value);
            }}
            className="w-full bg-transparent outline-none"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Colour">
          <input
            type="color"
            value={scalar.colour}
            onChange={(e) => {
              setScalar((s) => ({ ...s, colour: e.target.value }));
              save("colour", e.target.value);
            }}
            className="w-full bg-transparent outline-none h-6"
          />
        </Field>
        <Field label="Tarmac %">
          <input
            type="number"
            value={scalar.tarmac}
            onChange={(e) => setScalar((s) => ({ ...s, tarmac: Number(e.target.value) }))}
            onBlur={(e) => save("tarmac", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
        <Field label="Days">
          <input
            type="number"
            value={scalar.days}
            onChange={(e) => setScalar((s) => ({ ...s, days: Number(e.target.value) }))}
            onBlur={(e) => save("days", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
        <Field label="Km">
          <input
            type="number"
            value={scalar.km}
            onChange={(e) => setScalar((s) => ({ ...s, km: Number(e.target.value) }))}
            onBlur={(e) => save("km", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
        <Field label="Price">
          <div className="flex items-center gap-1">
            <select
              value={scalar.currency}
              onChange={(e) => {
                setScalar((s) => ({ ...s, currency: e.target.value }));
                save("currency", e.target.value);
              }}
              className="bg-transparent outline-none"
            >
              <option value="$">$</option>
              <option value="€">€</option>
            </select>
            <input
              type="number"
              value={scalar.price}
              onChange={(e) => setScalar((s) => ({ ...s, price: Number(e.target.value) }))}
              onBlur={(e) => save("price", Number(e.target.value))}
              className="w-full bg-transparent outline-none font-mono"
            />
          </div>
        </Field>
      </div>

      <div className="bg-white rounded border border-black/10 p-4 flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Hero image</span>
        <div className="flex items-center gap-4">
          {route.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={route.image} alt="" className="w-32 h-20 object-cover rounded border border-black/10" />
          )}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
              className="text-[13px]"
            />
            {uploading && <span className="text-[12px] text-[#6B7A6F]">Uploading…</span>}
          </div>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Image focus (CSS position-x, e.g. 20%)">
            <input
              value={scalar.image_focus}
              onChange={(e) => setScalar((s) => ({ ...s, image_focus: e.target.value }))}
              onBlur={(e) => save("image_focus", e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </Field>
          <Field label="Fallback caption (shown only if no image)">
            <input
              value={scalar.photo}
              onChange={(e) => setScalar((s) => ({ ...s, photo: e.target.value }))}
              onBlur={(e) => save("photo", e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <TextField label="Blurb" value={scalar.blurb} onChange={(v) => setScalar((s) => ({ ...s, blurb: v }))} onSave={(v) => save("blurb", v)} />
        <TextField label="Best months" value={scalar.best_months} onChange={(v) => setScalar((s) => ({ ...s, best_months: v }))} onSave={(v) => save("best_months", v)} />
        <TextField label="Overview lead" value={scalar.overview_lead} onChange={(v) => setScalar((s) => ({ ...s, overview_lead: v }))} onSave={(v) => save("overview_lead", v)} />
        <TextField label="Overview body" value={scalar.overview_body} onChange={(v) => setScalar((s) => ({ ...s, overview_body: v }))} onSave={(v) => save("overview_body", v)} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <ArrayField label="Tags" value={arrays.tags} onChange={(v) => setArrays((s) => ({ ...s, tags: v }))} onSave={(v) => saveArray("tags", v)} />
        <ArrayField label="Chips" value={arrays.chips} onChange={(v) => setArrays((s) => ({ ...s, chips: v }))} onSave={(v) => saveArray("chips", v)} />
        <ArrayField label="Included" value={arrays.included} onChange={(v) => setArrays((s) => ({ ...s, included: v }))} onSave={(v) => saveArray("included", v)} />
        <ArrayField label="Excluded" value={arrays.excluded} onChange={(v) => setArrays((s) => ({ ...s, excluded: v }))} onSave={(v) => saveArray("excluded", v)} />
      </div>

      <div className="bg-white rounded border border-black/10 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Itinerary</span>
          <button
            type="button"
            onClick={() => startTransition(() => addItineraryDay(route.id, days.length + 1))}
            className="text-[12px] font-medium text-[#1E3A2B] hover:underline"
          >
            + Add day
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {days.map((day) => (
            <ItineraryDayRow key={day.id} day={day} />
          ))}
          {days.length === 0 && <p className="text-[#9C9575] italic text-sm">No itinerary days yet.</p>}
        </div>
      </div>

      <div className="bg-white rounded border border-black/10 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Testimonials</span>
          <button
            type="button"
            onClick={() => startTransition(() => addTestimonial(route.id))}
            className="text-[12px] font-medium text-[#1E3A2B] hover:underline"
          >
            + Add testimonial
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {testimonials.map((t) => (
            <TestimonialRow key={t.id} testimonial={t} />
          ))}
          {testimonials.length === 0 && <p className="text-[#9C9575] italic text-sm">No testimonials yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ItineraryDayRow({ day }: { day: ItineraryDay }) {
  const [fields, setFields] = useState({
    day_number: day.dayNumber,
    duration: day.duration ?? "",
    title: day.title,
    body: day.body ?? "",
    night: day.night ?? "",
  });
  const [, startTransition] = useTransition();

  function save(field: string, value: string | number) {
    startTransition(() => updateItineraryDay(day.id, field, value));
  }

  return (
    <div className="border border-black/10 rounded p-3 flex flex-col gap-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: "60px 100px 1fr 140px auto" }}>
        <input
          type="number"
          value={fields.day_number}
          onChange={(e) => setFields((f) => ({ ...f, day_number: Number(e.target.value) }))}
          onBlur={(e) => save("day_number", Number(e.target.value))}
          className="bg-transparent outline-none font-mono text-sm border-b border-black/10"
        />
        <input
          value={fields.duration}
          onChange={(e) => setFields((f) => ({ ...f, duration: e.target.value }))}
          onBlur={(e) => save("duration", e.target.value)}
          placeholder="duration"
          className="bg-transparent outline-none text-sm border-b border-black/10"
        />
        <input
          value={fields.title}
          onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
          onBlur={(e) => save("title", e.target.value)}
          placeholder="title"
          className="bg-transparent outline-none text-sm font-medium border-b border-black/10"
        />
        <input
          value={fields.night}
          onChange={(e) => setFields((f) => ({ ...f, night: e.target.value }))}
          onBlur={(e) => save("night", e.target.value)}
          placeholder="night stop"
          className="bg-transparent outline-none text-sm border-b border-black/10"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={day.highlight}
              onChange={() => startTransition(() => toggleItineraryDayHighlight(day.id, !day.highlight))}
              className="accent-[#1E3A2B]"
            />
            highlight
          </label>
          <button
            type="button"
            onClick={() => startTransition(() => deleteItineraryDay(day.id))}
            className="text-[11px] text-[#B23B2E] hover:underline"
          >
            delete
          </button>
        </div>
      </div>
      <textarea
        value={fields.body}
        onChange={(e) => setFields((f) => ({ ...f, body: e.target.value }))}
        onBlur={(e) => save("body", e.target.value)}
        placeholder="day description"
        rows={2}
        className="bg-transparent outline-none text-sm resize-y"
      />
    </div>
  );
}

function TestimonialRow({ testimonial }: { testimonial: Testimonial }) {
  const [fields, setFields] = useState({ quote: testimonial.quote, author: testimonial.author });
  const [, startTransition] = useTransition();

  function save(field: "quote" | "author", value: string) {
    startTransition(() => updateTestimonial(testimonial.id, field, value));
  }

  return (
    <div className="border border-black/10 rounded p-3 flex flex-col gap-2">
      <textarea
        value={fields.quote}
        onChange={(e) => setFields((f) => ({ ...f, quote: e.target.value }))}
        onBlur={(e) => save("quote", e.target.value)}
        rows={2}
        className="bg-transparent outline-none text-sm resize-y"
      />
      <div className="flex items-center justify-between gap-2">
        <input
          value={fields.author}
          onChange={(e) => setFields((f) => ({ ...f, author: e.target.value }))}
          onBlur={(e) => save("author", e.target.value)}
          className="bg-transparent outline-none text-[13px] font-mono flex-1"
        />
        <button
          type="button"
          onClick={() => startTransition(() => deleteTestimonial(testimonial.id))}
          className="text-[11px] text-[#B23B2E] hover:underline shrink-0"
        >
          delete
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded border border-black/10 px-3 py-2.5">
      <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange, onSave }: { label: string; value: string; onChange: (v: string) => void; onSave: (v: string) => void }) {
  return (
    <div className="bg-white rounded border border-black/10 px-3 py-2.5">
      <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onSave(e.target.value)}
        rows={3}
        className="w-full bg-transparent outline-none text-sm resize-y"
      />
    </div>
  );
}

function ArrayField({ label, value, onChange, onSave }: { label: string; value: string; onChange: (v: string) => void; onSave: (v: string) => void }) {
  return (
    <div className="bg-white rounded border border-black/10 px-3 py-2.5">
      <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">{label} (one per line)</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onSave(e.target.value)}
        rows={4}
        className="w-full bg-transparent outline-none text-[13px] resize-y"
      />
    </div>
  );
}
