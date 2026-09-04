"use client";

import { useTransition } from "react";
import { moveBookingStage, type Stage } from "@/app/(dashboard)/pipeline/actions";

const STAGES: { id: Stage; label: string }[] = [
  { id: "enquiry", label: "Enquiry" },
  { id: "quoted", label: "Quoted" },
  { id: "confirmed", label: "Confirmed" },
  { id: "driving", label: "Driving" },
  { id: "done", label: "Done" },
];

export default function BookingCard({
  booking,
}: {
  booking: {
    id: string;
    ref: string;
    party_name: string;
    stage: Stage;
    value: number;
    currency: string;
    lang: string;
    pax: number;
    notes: string | null;
    arrival_date: string | null;
    nights: number | null;
    route_name: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const idx = STAGES.findIndex((s) => s.id === booking.stage);
  const next = STAGES[idx + 1];
  const prev = STAGES[idx - 1];

  const dateRange = booking.arrival_date
    ? new Date(booking.arrival_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;

  return (
    <div
      className={
        "bg-white rounded border border-black/10 p-3 flex flex-col gap-1.5 text-sm " +
        (pending ? "opacity-50" : "")
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display font-semibold text-[14px] leading-tight">{booking.party_name}</span>
        <span className="font-mono text-[10px] text-[#8A8368] shrink-0">{booking.ref}</span>
      </div>
      {booking.route_name && <div className="text-[12px] text-[#6B7A6F]">{booking.route_name}</div>}
      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
        {dateRange && (
          <span className="px-1.5 py-0.5 rounded bg-black/[.05] border border-black/10">{dateRange}</span>
        )}
        <span className="px-1.5 py-0.5 rounded bg-black/[.05] border border-black/10">{booking.pax}p</span>
        <span className="px-1.5 py-0.5 rounded bg-black/[.05] border border-black/10">{booking.lang}</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-semibold text-[13px]">
          {booking.currency}
          {booking.value.toLocaleString()}
        </span>
        <div className="flex gap-1">
          {prev && (
            <button
              type="button"
              disabled={pending}
              title={"Move back to " + prev.label}
              onClick={() => startTransition(() => moveBookingStage(booking.id, prev.id))}
              className="w-6 h-6 rounded-full border border-black/15 text-[11px] hover:bg-black/5"
            >
              ←
            </button>
          )}
          {next && (
            <button
              type="button"
              disabled={pending}
              title={"Move to " + next.label}
              onClick={() => startTransition(() => moveBookingStage(booking.id, next.id))}
              className="w-6 h-6 rounded-full border border-black/15 text-[11px] hover:bg-black/5"
            >
              →
            </button>
          )}
        </div>
      </div>
      {booking.notes && <div className="text-[11px] text-[#B23B2E] pt-0.5">{booking.notes}</div>}
    </div>
  );
}
