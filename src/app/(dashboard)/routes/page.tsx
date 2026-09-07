import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { routes, routeItineraryDays, routeTestimonials } from "@/db/schema";
import RouteDetail from "@/components/RouteDetail";
import NewRouteButton from "@/components/NewRouteButton";

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r } = await searchParams;
  const allRoutes = db.select().from(routes).orderBy(asc(routes.name)).all();
  const selected = allRoutes.find((route) => route.id === r) ?? allRoutes[0];

  const days = selected
    ? db.select().from(routeItineraryDays).where(eq(routeItineraryDays.routeId, selected.id)).orderBy(asc(routeItineraryDays.dayNumber)).all()
    : [];
  const testimonials = selected
    ? db.select().from(routeTestimonials).where(eq(routeTestimonials.routeId, selected.id)).all()
    : [];

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl">Routes & pricing</h1>
          <p className="text-sm text-[#6B7A6F]">Edit the route itineraries and prices shown on the public site.</p>
        </div>
        <NewRouteButton />
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-[260px] shrink-0 flex flex-col gap-1 overflow-y-auto">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono px-1 mb-1">
            All routes
          </span>
          {allRoutes.map((route) => (
            <Link
              key={route.id}
              href={`/routes?r=${route.id}`}
              className={
                "rounded border px-3 py-2.5 flex flex-col gap-0.5 " +
                (selected?.id === route.id ? "bg-white border-[#1E3A2B]" : "bg-white/60 border-black/10 hover:bg-white")
              }
            >
              <span className="text-sm font-medium">{route.name}</span>
              <span className="text-[12px] text-[#6B7A6F]">
                {route.currency}
                {route.price} · {route.days}d
              </span>
            </Link>
          ))}
          {allRoutes.length === 0 && <p className="text-[#9C9575] italic text-sm px-1">No routes yet.</p>}
        </div>

        {selected && <RouteDetail route={selected} days={days} testimonials={testimonials} />}
      </div>
    </div>
  );
}
