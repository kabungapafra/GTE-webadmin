import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import QuoteBuilder from "@/components/QuoteBuilder";

function ageLabel(createdAt: string) {
  const hours = Math.max(1, Math.round((Date.now() - new Date(createdAt).getTime()) / 3_600_000));
  if (hours < 24) return hours + "h";
  return Math.round(hours / 24) + "d";
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ b?: string; stage?: string }>;
}) {
  const { b, stage } = await searchParams;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("bookings")
    .select("id, ref, party_name, country, source, arrival_date, pax, value, currency, created_at, stage, comfort, must_see, notes, routes(name)")
    .in("stage", ["enquiry", "quoted", "confirmed"])
    .order("created_at", { ascending: false });

  const bookings = (rows ?? []).map((r) => ({ ...r, route_name: (r.routes as unknown as { name: string } | null)?.name ?? null }));
  const filtered = stage ? bookings.filter((r) => r.stage === stage) : bookings;
  const selected = bookings.find((r) => r.id === b) ?? filtered[0];

  const counts = {
    all: bookings.length,
    enquiry: bookings.filter((r) => r.stage === "enquiry").length,
    quoted: bookings.filter((r) => r.stage === "quoted").length,
    confirmed: bookings.filter((r) => r.stage === "confirmed").length,
  };

  const [{ data: lineItems }, { data: activity }] = selected
    ? await Promise.all([
        supabase.from("quote_line_items").select("*").eq("booking_id", selected.id).order("sort_order"),
        supabase.from("booking_activity").select("*").eq("booking_id", selected.id).order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const tabs = [
    { id: "", label: "All", count: counts.all },
    { id: "enquiry", label: "Enquiry", count: counts.enquiry },
    { id: "quoted", label: "Quoted", count: counts.quoted },
    { id: "confirmed", label: "Confirmed", count: counts.confirmed },
  ];

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div>
        <h1 className="font-display font-semibold text-2xl">Enquiries & quotes</h1>
        <p className="text-sm text-[#6B7A6F]">{counts.all} open</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/enquiries${t.id ? `?stage=${t.id}` : ""}`}
            className={
              "px-3 py-1.5 rounded-full text-sm border " +
              ((stage ?? "") === t.id ? "bg-[#1E3A2B] text-[#F7F1E3] border-[#1E3A2B]" : "border-black/15 hover:bg-black/5")
            }
          >
            {t.label} {t.count}
          </Link>
        ))}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-white rounded border border-black/10 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.14em] uppercase text-[#8A8368] font-mono border-b border-black/10">
                <th className="px-4 py-3 font-medium">Traveller</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Pax</th>
                <th className="px-4 py-3 font-medium">Route interest</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
                <th className="px-4 py-3 font-medium text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={
                    "border-b border-black/5 cursor-pointer " + (selected?.id === r.id ? "bg-[#F7F1E3]" : "hover:bg-black/[.02]")
                  }
                >
                  <td className="px-4 py-3">
                    <Link href={`/enquiries?b=${r.id}${stage ? `&stage=${stage}` : ""}`} className="block">
                      <div className="font-medium">{r.party_name}</div>
                      <div className="text-[12px] text-[#6B7A6F]">
                        {r.country} · {r.source}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px]">
                    {r.arrival_date ? new Date(r.arrival_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3">{r.pax}</td>
                  <td className="px-4 py-3">{r.route_name ?? r.notes ?? "Undecided"}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {r.currency}
                    {r.value.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#B8862F]">{ageLabel(r.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#9C9575] italic">
                    Nothing here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white border border-black/10 rounded p-4">
              <div className="text-[11px] font-mono text-[#8A8368]">{selected.ref}</div>
              <h2 className="font-display font-semibold text-xl">{selected.party_name}</h2>
              <p className="text-[13px] text-[#6B7A6F] mb-3">{selected.country}</p>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="bg-[#F7F1E3] rounded px-2.5 py-2">
                  <div className="text-[9px] uppercase text-[#8A8368] font-mono">Arrival</div>
                  {selected.arrival_date ? new Date(selected.arrival_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                </div>
                <div className="bg-[#F7F1E3] rounded px-2.5 py-2">
                  <div className="text-[9px] uppercase text-[#8A8368] font-mono">Pax</div>
                  {selected.pax}
                </div>
                {selected.comfort && (
                  <div className="bg-[#F7F1E3] rounded px-2.5 py-2 col-span-2">
                    <div className="text-[9px] uppercase text-[#8A8368] font-mono">Comfort</div>
                    {selected.comfort}
                  </div>
                )}
                {selected.must_see && (
                  <div className="bg-[#F7F1E3] rounded px-2.5 py-2 col-span-2">
                    <div className="text-[9px] uppercase text-[#8A8368] font-mono">Must see</div>
                    {selected.must_see}
                  </div>
                )}
              </div>
              {selected.notes && <p className="text-[13px] text-[#6B7A6F] italic mt-3">&quot;{selected.notes}&quot;</p>}
            </div>

            <QuoteBuilder booking={selected} lineItems={lineItems ?? []} activity={activity ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
