import { createClient } from "@/lib/supabase/server";
import SupportLogForm from "@/components/SupportLogForm";

export default async function OnTheRoadPage() {
  const supabase = await createClient();

  const [{ data: rows }, { data: log }, { data: staff }, { data: handovers }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, ref, party_name, arrival_date, nights, lang, notes, vehicles(name, plate), routes(name)")
      .eq("stage", "driving"),
    supabase.from("road_support_log").select("*, bookings(party_name)").order("occurred_at", { ascending: false }).limit(10),
    supabase.from("staff").select("name, role").order("name"),
    supabase.from("handovers").select("*, bookings(party_name), vehicles(name, plate)").gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(5),
  ]);

  const driving = (rows ?? []).map((r) => {
    const vehicle = r.vehicles as unknown as { name: string; plate: string } | null;
    const route = r.routes as unknown as { name: string } | null;
    const dayNumber = r.arrival_date
      ? Math.min(r.nights ?? 1, Math.max(1, Math.ceil((Date.now() - new Date(r.arrival_date).getTime()) / 86_400_000) + 1))
      : 1;
    const progress = r.nights ? Math.min(100, Math.round((dayNumber / r.nights) * 100)) : 0;
    return { ...r, vehicle, route_name: route?.name ?? null, dayNumber, progress };
  });

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">On the road</h1>
        <p className="text-sm text-[#6B7A6F]">{driving.length} parties driving</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 flex flex-col gap-3">
          {driving.map((b) => (
            <div
              key={b.id}
              className={"bg-white rounded border-l-4 border border-black/10 p-4 flex items-center gap-4 " + (b.notes ? "border-l-[#B23B2E]" : "border-l-[#3D6B33]")}
            >
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold">{b.party_name}</div>
                <div className="text-[12px] text-[#6B7A6F]">
                  {b.route_name ?? "—"} · {b.lang}
                </div>
                <div className="text-[12px] font-mono text-[#8A8368] mt-0.5">
                  {b.vehicle ? `${b.vehicle.plate} · ${b.vehicle.name}` : "No vehicle assigned"}
                </div>
              </div>
              <div className="w-40 shrink-0">
                <div className="text-[11px] font-mono text-[#8A8368] mb-1">
                  Day {b.dayNumber} of {b.nights ?? "?"}
                </div>
                <div className="h-1.5 rounded-full bg-black/[.08] overflow-hidden">
                  <div className="h-full bg-[#3D6B33]" style={{ width: b.progress + "%" }} />
                </div>
              </div>
              <div className="shrink-0">
                {b.notes ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#F6DCD8] text-[#A13A2E] text-[12px] font-medium">{b.notes}</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#E7EFE1] text-[#3D6B33] text-[12px] font-medium">On track</span>
                )}
              </div>
            </div>
          ))}
          {driving.length === 0 && (
            <div className="bg-white border border-dashed border-black/15 rounded p-10 text-center text-[#9C9575]">
              Nobody driving right now.
            </div>
          )}
        </div>

        <div className="w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-black/10 rounded p-4">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Support log</span>
            <div className="flex flex-col gap-2.5 mt-3 text-[13px] max-h-64 overflow-y-auto">
              {(log ?? []).map((entry) => (
                <div key={entry.id}>
                  <div className="flex justify-between text-[11px] text-[#8A8368] font-mono">
                    <span>{(entry.bookings as unknown as { party_name: string } | null)?.party_name ?? "General"}</span>
                    <span>{new Date(entry.occurred_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p>{entry.note}</p>
                </div>
              ))}
              {(log ?? []).length === 0 && <p className="text-[#9C9575] italic">Nothing logged yet.</p>}
            </div>
            <div className="mt-3 pt-3 border-t border-black/10">
              <SupportLogForm bookingIds={driving.map((b) => ({ id: b.id, label: b.party_name }))} />
            </div>
          </div>

          {!!handovers?.length && (
            <div className="bg-white border border-black/10 rounded p-4">
              <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Handovers coming up</span>
              <div className="flex flex-col gap-2 mt-3 text-[13px]">
                {handovers.map((h) => {
                  const veh = h.vehicles as unknown as { name: string; plate: string } | null;
                  const party = (h.bookings as unknown as { party_name: string } | null)?.party_name ?? "—";
                  return (
                    <div key={h.id} className="flex justify-between">
                      <span>
                        {party} · {veh?.plate}
                      </span>
                      <span className="font-mono text-[#8A8368]">
                        {new Date(h.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-black/10 rounded p-4">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Crew</span>
            <div className="flex flex-col gap-2 mt-3 text-[13px]">
              {(staff ?? []).map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-[#8A8368]">{s.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
