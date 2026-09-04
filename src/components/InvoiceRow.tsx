"use client";

import { useState, useTransition } from "react";
import { recordPayment, sendReminder } from "@/app/(dashboard)/payments/actions";

const STATE_LABEL: Record<string, string> = {
  awaiting_deposit: "Awaiting deposit",
  deposit_paid: "Deposit paid",
  settled: "Settled",
  overdue: "Overdue",
};
const STATE_COLOR: Record<string, string> = {
  awaiting_deposit: "bg-[#F3E3C0] text-[#8A6A22]",
  deposit_paid: "bg-[#E7EFE1] text-[#3D6B33]",
  settled: "bg-black/[.05] text-[#6B7A6F]",
  overdue: "bg-[#F6DCD8] text-[#A13A2E]",
};

export default function InvoiceRow({
  invoice,
}: {
  invoice: {
    id: string;
    invoice_no: string;
    total: number;
    paid: number;
    due_date: string | null;
    state: string;
    booking_id: string;
    party_name: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [paidInput, setPaidInput] = useState(String(invoice.paid));

  return (
    <tr className="border-b border-black/5">
      <td className="px-4 py-3 font-mono text-[13px]">{invoice.invoice_no}</td>
      <td className="px-4 py-3">
        {invoice.party_name} <span className="text-[#8A8368] text-[12px]">({invoice.invoice_no.replace("INV-", "GTE-")})</span>
      </td>
      <td className="px-4 py-3 text-right font-mono">${invoice.total.toLocaleString()}</td>
      <td className="px-4 py-3 text-right font-mono">
        {editing ? (
          <input
            autoFocus
            value={paidInput}
            onChange={(e) => setPaidInput(e.target.value)}
            onBlur={() => {
              setEditing(false);
              const n = Number(paidInput);
              if (!Number.isNaN(n) && n !== invoice.paid) startTransition(() => recordPayment(invoice.id, n, invoice.total));
            }}
            className="w-24 border border-black/20 rounded px-1.5 py-0.5 text-right font-mono text-sm"
          />
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="hover:underline">
            ${invoice.paid.toLocaleString()}
          </button>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-[13px]">
        {invoice.due_date ? (
          <>
            ${(invoice.total - invoice.paid).toLocaleString()} ·{" "}
            {new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={"px-2 py-1 rounded-full text-[12px] font-medium " + STATE_COLOR[invoice.state]}>
            {STATE_LABEL[invoice.state]}
          </span>
          {invoice.state !== "settled" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => sendReminder(invoice.booking_id, invoice.party_name))}
              className="px-2.5 py-1 rounded-full border border-black/15 text-[12px] hover:bg-black/5"
            >
              Remind
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
