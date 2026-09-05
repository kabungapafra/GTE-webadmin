import { desc, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { bookings, vehicles, routes, roadSupportLog, staff, handovers } from "@/db/schema";
import SupportLogForm from "@/components/SupportLogForm";

export default async function OnTheRoadPage() {
  const rows = db
    .select({
      id: bookings.id,
      ref: bookings.ref,
      party_name: bookings.partyName,
      arrival_date: bookings.arrivalDate,
      nights: bookings.nights,
      lang: bookings.lang,
      notes: bookings.notes,
      vehicle_name: vehicles.name,
      vehicle_plate: vehicles.plate,
      route_name: routes.name,
    })
    .from(bookings)
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .leftJoin(routes, eq(bookings.routeId, routes.id))
    .where(eq(bookings.stage, "driving"))
    .all();

  const log = db
    .select({
      id: roadSupportLog.id,
      note: roadSupportLog.note,
      occurred_at: roadSupportLog.occurredAt,
      party_name: bookings.partyName,
    })
    .from(roadSupportLog)
    .leftJoin(bookings, eq(roadSupportLog.bookingId, bookings.id))
    .orderBy(desc(roadSupportLog.occurredAt))
    .limit(10)
    .all();

  const crew = db.select({ name: staff.name, role: staff.role }).from(staff).orderBy(asc(staff.name)).all();

  const upcomingHandovers = db
    .select({
      id: handovers.id,
      scheduled_at: handovers.scheduledAt,
      party_name: bookings.partyName,
      vehicle_plate: vehicles.plate,
    })
    .from(handovers)
    .leftJoin(bookings, eq(handovers.bookingId, bookings.id))
    .leftJoin(vehicles, eq(handovers.vehicleId, vehicles.id))
    .where(gte(handovers.scheduledAt, new Date().toISOString()))
    .orderBy(asc(handovers.scheduledAt))
    .limit(5)
    .all();

  const driving = rows.map((r) => {
    const vehicle = r.vehicle_name ? { name: r.vehicle_name, plate: r.vehicle_plate! } : null;
    const dayNumber = r.arrival_date
      ? Math.min(r.nights ?? 1, Math.max(1, Math.ceil((Date.now() - new Date(r.arrival_date).getTime()) / 86_400_000) + 1))
      : 1;
    const progress = r.nights ? Math.min(100, Math.round((dayNumber / r.nights) * 100)) : 0;
    return { ...r, vehicle, dayNumber, progress };
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
              {log.map((entry) => (
                <div key={entry.id}>
                  <div className="flex justify-between text-[11px] text-[#8A8368] font-mono">
                    <span>{entry.party_name ?? "General"}</span>
                    <span>{new Date(entry.occurred_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p>{entry.note}</p>
                </div>
              ))}
              {log.length === 0 && <p className="text-[#9C9575] italic">Nothing logged yet.</p>}
            </div>
            <div className="mt-3 pt-3 border-t border-black/10">
              <SupportLogForm bookingIds={driving.map((b) => ({ id: b.id, label: b.party_name }))} />
            </div>
          </div>

          {!!upcomingHandovers.length && (
            <div className="bg-white border border-black/10 rounded p-4">
              <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Handovers coming up</span>
              <div className="flex flex-col gap-2 mt-3 text-[13px]">
                {upcomingHandovers.map((h) => (
                  <div key={h.id} className="flex justify-between">
                    <span>
                      {h.party_name ?? "—"} · {h.vehicle_plate}
                    </span>
                    <span className="font-mono text-[#8A8368]">
                      {new Date(h.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-black/10 rounded p-4">
            <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Crew</span>
            <div className="flex flex-col gap-2 mt-3 text-[13px]">
              {crew.map((s) => (
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
