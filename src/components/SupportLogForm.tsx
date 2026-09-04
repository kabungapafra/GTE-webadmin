"use client";

import { useState, useTransition } from "react";
import { addSupportLogEntry } from "@/app/(dashboard)/on-the-road/actions";

export default function SupportLogForm({ bookingIds }: { bookingIds: { id: string; label: string }[] }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [bookingId, setBookingId] = useState("");

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!note.trim()) return;
        startTransition(() => addSupportLogEntry(bookingId || null, note));
        setNote("");
      }}
    >
      <select
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        className="border border-black/15 rounded px-2 py-1.5 text-sm bg-white"
      >
        <option value="">General note</option>
        {bookingIds.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Log an event…"
          className="flex-1 border border-black/15 rounded px-2.5 py-1.5 text-sm outline-none"
        />
        <button type="submit" disabled={pending} className="px-3 py-1.5 rounded bg-[#1E3A2B] text-[#F7F1E3] text-sm font-medium">
          Log
        </button>
      </div>
    </form>
  );
}
