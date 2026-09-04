import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { data: vehicles } = await supabase.from("vehicles").select("*").order("name");

  const selected = vehicles?.find((veh) => veh.id === v) ?? vehicles?.[0];

  const { data: records } = selected
    ? await supabase
        .from("vehicle_workshop_records")
        .select("id, occurred_on, note")
        .eq("vehicle_id", selected.id)
        .order("occurred_on", { ascending: false })
    : { data: [] };

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
          {(vehicles ?? []).map((veh) => (
            <Link
              key={veh.id}
              href={`/fleet?v=${veh.id}`}
              className={
                "rounded border px-3 py-2.5 flex flex-col gap-0.5 " +
                (selected?.id === veh.id ? "bg-white border-[#1E3A2B]" : "bg-white/60 border-black/10 hover:bg-white")
              }
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + STATUS_DOT[veh.status]} />
                {veh.name}
              </span>
              <span className="text-[12px] text-[#6B7A6F] pl-3.5">
                {veh.plate} · {veh.currency}
                {veh.daily_rate}/day
              </span>
              <span className="text-[11px] pl-3.5" style={{ color: veh.status === "in_workshop" ? "#B23B2E" : "#6B7A6F" }}>
                {STATUS_LABEL[veh.status]}
              </span>
            </Link>
          ))}
        </div>

        {selected && <FleetDetail vehicle={selected} records={records ?? []} />}
      </div>
    </div>
  );
}
