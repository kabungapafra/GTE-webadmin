"use client";

import { useState, useTransition } from "react";
import { addLineItem, removeLineItem, sendQuote, addActivityNote } from "@/app/(dashboard)/enquiries/actions";

type LineItem = { id: string; label: string; rate: number; qty: string | null; amount: number };
type Activity = { id: string; note: string; created_at: string };

export default function QuoteBuilder({
  booking,
  lineItems,
  activity,
}: {
  booking: { id: string; party_name: string; pax: number };
  lineItems: LineItem[];
  activity: Activity[];
}) {
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [rate, setRate] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  const total = lineItems.reduce((s, i) => s + i.amount, 0);
  const perPerson = booking.pax ? Math.round(total / booking.pax) : total;

  function submitLineItem(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !rate) return;
    startTransition(() => addLineItem(booking.id, label, Number(rate), qty));
    setLabel("");
    setRate("");
    setQty("1");
  }

  function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    startTransition(() => addActivityNote(booking.id, note));
    setNote("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#1E3A2B] text-[#F7F1E3] rounded p-4">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8FA88B] font-mono">Quote builder</span>
          <span className="text-sm font-mono text-[#8FA88B]">${perPerson.toLocaleString()} pp</span>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 group">
              <span>{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#8FA88B]">{item.qty}</span>
                <span className="font-mono w-20 text-right">${item.amount.toLocaleString()}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => removeLineItem(item.id))}
                  className="text-[#8FA88B] hover:text-[#F7F1E3] opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {lineItems.length === 0 && <p className="text-[#8FA88B] italic text-[13px]">No line items yet.</p>}
        </div>

        <form onSubmit={submitLineItem} className="flex gap-1.5 mt-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Line item"
            className="flex-1 min-w-0 bg-[#173023] border border-[#33513F] rounded px-2 py-1.5 text-sm outline-none"
          />
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="$"
            type="number"
            className="w-16 bg-[#173023] border border-[#33513F] rounded px-2 py-1.5 text-sm outline-none font-mono"
          />
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="qty"
            className="w-14 bg-[#173023] border border-[#33513F] rounded px-2 py-1.5 text-sm outline-none font-mono"
          />
          <button type="submit" className="px-3 rounded bg-[#33513F] text-sm">
            +
          </button>
        </form>

        <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-[#33513F]">
          <span className="text-sm">Quote total</span>
          <span className="font-display font-semibold text-2xl text-[#C99A34]">${total.toLocaleString()}</span>
        </div>
        <button
          type="button"
          disabled={pending || lineItems.length === 0}
          onClick={() => startTransition(() => sendQuote(booking.id, booking.party_name, total))}
          className="w-full mt-3 py-2.5 rounded bg-[#C99A34] text-[#1E3A2B] font-semibold text-sm disabled:opacity-50"
        >
          Send quote to {booking.party_name.split(" ")[0]}
        </button>
      </div>

      <div className="bg-white border border-black/10 rounded p-4">
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Activity</span>
        <div className="flex flex-col gap-2 mt-3 text-sm">
          {activity.map((a) => (
            <div key={a.id} className="flex gap-3">
              <span className="text-[#8A8368] font-mono text-[11px] shrink-0 w-14">
                {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
              <span>{a.note}</span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-[#9C9575] italic text-[13px]">Nothing logged yet.</p>}
        </div>
        <form onSubmit={submitNote} className="flex gap-2 mt-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log a note…"
            className="flex-1 border border-black/15 rounded px-2.5 py-1.5 text-sm outline-none"
          />
          <button type="submit" className="px-3 py-1.5 rounded bg-[#1E3A2B] text-[#F7F1E3] text-sm font-medium">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
