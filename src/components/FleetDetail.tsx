"use client";

import { useState, useTransition } from "react";
import {
  updateVehicleStatus,
  toggleKitItem,
  updateVehicleField,
  addWorkshopRecord,
} from "@/app/(dashboard)/fleet/actions";

const STATUSES = [
  { id: "available", label: "Available" },
  { id: "on_the_road", label: "On the road" },
  { id: "in_workshop", label: "In workshop" },
  { id: "retired", label: "Retired" },
];

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  daily_rate: number;
  currency: string;
  seats: number;
  gearbox: string;
  year: number | null;
  odometer: number | null;
  next_service: string | null;
  status: string;
  kit: Record<string, boolean>;
  photo_url: string | null;
};

type WorkshopRecord = { id: string; occurred_on: string; note: string };

export default function FleetDetail({
  vehicle,
  records,
}: {
  vehicle: Vehicle;
  records: WorkshopRecord[];
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [fields, setFields] = useState({
    daily_rate: vehicle.daily_rate,
    seats: vehicle.seats,
    gearbox: vehicle.gearbox,
    year: vehicle.year ?? "",
    odometer: vehicle.odometer ?? "",
    next_service: vehicle.next_service ?? "",
  });

  function saveField(field: string, value: string | number) {
    startTransition(() => updateVehicleField(vehicle.id, field, value));
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-display font-semibold text-2xl">{vehicle.name}</h2>
        <span className="font-mono text-sm text-[#6B7A6F]">{vehicle.plate}</span>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        <Field label="Daily rate">
          <div className="flex items-center gap-1">
            <span className="text-[#6B7A6F]">{vehicle.currency}</span>
            <input
              type="number"
              value={fields.daily_rate}
              onChange={(e) => setFields((f) => ({ ...f, daily_rate: Number(e.target.value) }))}
              onBlur={(e) => saveField("daily_rate", Number(e.target.value))}
              className="w-full bg-transparent outline-none font-mono"
            />
          </div>
        </Field>
        <Field label="Seats">
          <input
            type="number"
            value={fields.seats}
            onChange={(e) => setFields((f) => ({ ...f, seats: Number(e.target.value) }))}
            onBlur={(e) => saveField("seats", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
        <Field label="Gearbox">
          <input
            value={fields.gearbox}
            onChange={(e) => setFields((f) => ({ ...f, gearbox: e.target.value }))}
            onBlur={(e) => saveField("gearbox", e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={fields.year}
            onChange={(e) => setFields((f) => ({ ...f, year: e.target.value }))}
            onBlur={(e) => saveField("year", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
        <Field label="Odometer">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={fields.odometer}
              onChange={(e) => setFields((f) => ({ ...f, odometer: e.target.value }))}
              onBlur={(e) => saveField("odometer", Number(e.target.value))}
              className="w-full bg-transparent outline-none font-mono"
            />
            <span className="text-[#6B7A6F] text-xs">km</span>
          </div>
        </Field>
        <Field label="Next service">
          <input
            type="date"
            value={fields.next_service ? String(fields.next_service).slice(0, 10) : ""}
            onChange={(e) => setFields((f) => ({ ...f, next_service: e.target.value }))}
            onBlur={(e) => saveField("next_service", e.target.value)}
            className="w-full bg-transparent outline-none font-mono text-[13px]"
          />
        </Field>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="bg-white rounded border border-black/10 p-4">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Kit on this vehicle</span>
          <div className="flex flex-col gap-1.5 mt-3">
            {Object.entries(vehicle.kit).map(([item, checked]) => (
              <label key={item} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={pending}
                  onChange={() => startTransition(() => toggleKitItem(vehicle.id, vehicle.kit, item))}
                  className="accent-[#1E3A2B]"
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded border border-black/10 p-4">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Status on the site</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => updateVehicleStatus(vehicle.id, s.id))}
                  className={
                    "px-3 py-1.5 rounded-full text-sm border " +
                    (vehicle.status === s.id
                      ? "bg-[#1E3A2B] text-[#F7F1E3] border-[#1E3A2B]"
                      : "border-black/15 hover:bg-black/5")
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-[#6B7A6F] mt-2">
              Hidden from the public availability calendar until the return date.
            </p>
          </div>

          <div className="bg-[#F7F1E3] border border-black/10 rounded p-4 flex-1">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Workshop record</span>
            <div className="flex flex-col gap-2 mt-3 text-sm">
              {records.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <span className="text-[#6B7A6F] font-mono text-[12px] shrink-0 w-16">
                    {new Date(r.occurred_on).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <span>{r.note}</span>
                </div>
              ))}
              {records.length === 0 && <p className="text-[#9C9575] italic">No records yet.</p>}
            </div>
            <form
              className="flex gap-2 mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                startTransition(() => addWorkshopRecord(vehicle.id, note));
                setNote("");
              }}
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a record…"
                className="flex-1 border border-black/15 rounded px-2.5 py-1.5 text-sm bg-white outline-none"
              />
              <button type="submit" className="px-3 py-1.5 rounded bg-[#1E3A2B] text-[#F7F1E3] text-sm font-medium">
                Add
              </button>
            </form>
          </div>
        </div>
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
