import { createClient } from "@/lib/supabase/server";
import BookingCard from "@/components/BookingCard";
import type { Stage } from "./actions";

const COLUMNS: { id: Stage; label: string }[] = [
  { id: "enquiry", label: "Enquiry" },
  { id: "quoted", label: "Quoted" },
  { id: "confirmed", label: "Confirmed" },
  { id: "driving", label: "Driving" },
  { id: "done", label: "Done" },
];

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, ref, party_name, stage, value, currency, lang, pax, notes, arrival_date, nights, routes(name)")
    .order("created_at", { ascending: false });

  const rows = (bookings ?? []).map((b) => ({
    ...b,
    route_name: (b.routes as unknown as { name: string } | null)?.name ?? null,
  }));

  const live = rows.filter((b) => b.stage !== "done");
  const openValue = rows.filter((b) => b.stage === "enquiry" || b.stage === "quoted").reduce((s, b) => s + b.value, 0);
  const confirmedRows = rows.filter((b) => b.stage === "confirmed" || b.stage === "driving" || b.stage === "done");
  const confirmedValue = confirmedRows.reduce((s, b) => s + b.value, 0);
  const winRate = rows.length ? Math.round((confirmedRows.length / rows.length) * 100) : 0;
  const nightsRows = rows.filter((b) => b.nights);
  const avgTrip = nightsRows.length
    ? Math.round(nightsRows.reduce((s, b) => s + (b.nights ?? 0), 0) / nightsRows.length)
    : 0;
  const totalInPlay = live.reduce((s, b) => s + b.value, 0);

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl">Bookings pipeline</h1>
          <p className="text-sm text-[#6B7A6F]">
            {live.length} live bookings · {rows[0]?.currency ?? "$"}
            {totalInPlay.toLocaleString()} in play
          </p>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <StatTile label="Open value" value={"$" + openValue.toLocaleString()} note={`${rows.filter((b) => b.stage === "enquiry" || b.stage === "quoted").length} quotes out`} />
        <StatTile label="Confirmed value" value={"$" + confirmedValue.toLocaleString()} note={`${confirmedRows.length} bookings`} />
        <StatTile label="Win rate" value={winRate + "%"} note={`${confirmedRows.length} of ${rows.length} total`} />
        <StatTile label="Avg trip" value={avgTrip + " nights"} note="across all bookings" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(230px, 1fr))`, overflowX: "auto" }}>
        {COLUMNS.map((col) => {
          const items = rows.filter((b) => b.stage === col.id);
          const value = items.reduce((s, b) => s + b.value, 0);
          return (
            <div key={col.id} className="flex flex-col gap-2 min-w-[230px]">
              <div className="flex items-baseline justify-between px-0.5">
                <span className="font-semibold text-[13px]">{col.label}</span>
                <span className="text-[11px] text-[#6B7A6F] font-mono">{items.length}</span>
              </div>
              {value > 0 && <span className="text-[12px] text-[#6B7A6F] px-0.5 -mt-1">${value.toLocaleString()}</span>}
              <div className="flex flex-col gap-2">
                {items.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
                {items.length === 0 && (
                  <div className="text-[12px] text-[#9C9575] italic px-1 py-3 text-center border border-dashed border-black/10 rounded">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-white rounded border border-black/10 p-4 flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">{label}</span>
      <span className="font-display font-semibold text-xl">{value}</span>
      <span className="text-[12px] text-[#6B7A6F]">{note}</span>
    </div>
  );
}
