import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices as invoicesTable, bookings } from "@/db/schema";
import InvoiceRow from "@/components/InvoiceRow";

export default async function PaymentsPage() {
  const rows = db
    .select({
      id: invoicesTable.id,
      booking_id: invoicesTable.bookingId,
      invoice_no: invoicesTable.invoiceNo,
      total: invoicesTable.total,
      paid: invoicesTable.paid,
      due_date: invoicesTable.dueDate,
      state: invoicesTable.state,
      created_at: invoicesTable.createdAt,
      party_name: bookings.partyName,
    })
    .from(invoicesTable)
    .leftJoin(bookings, eq(invoicesTable.bookingId, bookings.id))
    .orderBy(desc(invoicesTable.createdAt))
    .all();

  const invoices = rows.map((r) => ({ ...r, party_name: r.party_name ?? "—" }));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const collectedThisMonth = invoices
    .filter((i) => new Date(i.created_at) >= monthStart)
    .reduce((s, i) => s + i.paid, 0);
  const outstanding = invoices.filter((i) => i.state !== "settled");
  const outstandingTotal = outstanding.reduce((s, i) => s + (i.total - i.paid), 0);
  const overdue = invoices.filter((i) => i.due_date && new Date(i.due_date) < now && i.state !== "settled");
  const overdueTotal = overdue.reduce((s, i) => s + (i.total - i.paid), 0);
  const avgBooking = invoices.length ? Math.round(invoices.reduce((s, i) => s + i.total, 0) / invoices.length) : 0;

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">Payments & invoices</h1>
        <p className="text-sm text-[#6B7A6F]">Deposits, balances and what is overdue</p>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <StatTile label="Collected this month" value={"$" + collectedThisMonth.toLocaleString()} note={`${invoices.filter((i) => i.state === "settled").length} invoices settled`} highlight />
        <StatTile label="Outstanding" value={"$" + outstandingTotal.toLocaleString()} note={`${outstanding.length} invoices open`} />
        <StatTile label="Overdue" value={"$" + overdueTotal.toLocaleString()} note={overdue.length ? `${overdue.length} past due` : "nothing past due"} />
        <StatTile label="Avg booking" value={"$" + avgBooking.toLocaleString()} note={`${invoices.length} total`} />
      </div>

      <div className="bg-white rounded border border-black/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-[0.14em] uppercase text-[#8A8368] font-mono border-b border-black/10">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Party</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div className={"rounded border p-4 flex flex-col gap-1 " + (highlight ? "bg-[#1E3A2B] text-[#F7F1E3] border-[#1E3A2B]" : "bg-white border-black/10")}>
      <span className={"text-[10px] tracking-[0.16em] uppercase font-mono " + (highlight ? "text-[#8FA88B]" : "text-[#8A8368]")}>{label}</span>
      <span className="font-display font-semibold text-xl">{value}</span>
      <span className={"text-[12px] " + (highlight ? "text-[#C9D6C4]" : "text-[#6B7A6F]")}>{note}</span>
    </div>
  );
}
