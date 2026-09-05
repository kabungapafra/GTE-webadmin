import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles, vehicleWorkshopRecords } from "@/db/schema";
import FleetDetail from "@/components/FleetDetail";

const STATUS_DOT: Record<string, string> = {
  available: "bg-[#5FA86B]",
  on_the_road: "bg-[#8A8368]",
  in_workshop: "bg-[#B23B2E]",
  retired: "bg-[#9C9575]",
};
const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  on_the_road: "On the road",
  in_workshop: "In workshop",
  retired: "Retired",
};

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const allVehicles = db.select().from(vehicles).orderBy(vehicles.name).all();
  const veh = allVehicles.map((row) => ({
    id: row.id,
    name: row.name,
    plate: row.plate,
    daily_rate: row.dailyRate,
    currency: row.currency,
    seats: row.seats,
    gearbox: row.gearbox,
    year: row.year,
    odometer: row.odometer,
    next_service: row.nextService,
    status: row.status,
    kit: row.kit as Record<string, boolean>,
    photo_url: row.photoUrl,
  }));

  const selected = veh.find((v2) => v2.id === v) ?? veh[0];

  const records = selected
    ? db
        .select({ id: vehicleWorkshopRecords.id, occurred_on: vehicleWorkshopRecords.occurredOn, note: vehicleWorkshopRecords.note })
        .from(vehicleWorkshopRecords)
        .where(eq(vehicleWorkshopRecords.vehicleId, selected.id))
        .orderBy(desc(vehicleWorkshopRecords.occurredOn))
        .all()
    : [];

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div>
        <h1 className="font-display font-semibold text-2xl">Fleet data</h1>
        <p className="text-sm text-[#6B7A6F]">Rates, specs, kit lists and workshop records</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-[260px] shrink-0 flex flex-col gap-1 overflow-y-auto">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono px-1 mb-1">
            Our vehicles
          </span>
          {veh.map((v2) => (
            <Link
              key={v2.id}
              href={`/fleet?v=${v2.id}`}
              className={
                "rounded border px-3 py-2.5 flex flex-col gap-0.5 " +
                (selected?.id === v2.id ? "bg-white border-[#1E3A2B]" : "bg-white/60 border-black/10 hover:bg-white")
              }
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + STATUS_DOT[v2.status]} />
                {v2.name}
              </span>
              <span className="text-[12px] text-[#6B7A6F] pl-3.5">
                {v2.plate} · {v2.currency}
                {v2.daily_rate}/day
              </span>
              <span className="text-[11px] pl-3.5" style={{ color: v2.status === "in_workshop" ? "#B23B2E" : "#6B7A6F" }}>
                {STATUS_LABEL[v2.status]}
              </span>
            </Link>
          ))}
        </div>

        {selected && <FleetDetail vehicle={selected} records={records} />}
      </div>
    </div>
  );
}
