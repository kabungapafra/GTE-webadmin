import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { routes, routeItineraryDays, routeTestimonials } from "@/db/schema";
import { isAuthorizedPublicRequest, absolutizeUploadUrl } from "@/lib/publicApiAuth";

export async function GET(request: Request) {
  if (!isAuthorizedPublicRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allRoutes = db.select().from(routes).all();

  const shaped = allRoutes.map((route) => {
    const days = db
      .select()
      .from(routeItineraryDays)
      .where(eq(routeItineraryDays.routeId, route.id))
      .orderBy(asc(routeItineraryDays.dayNumber))
      .all();
    const testimonials = db
      .select({ quote: routeTestimonials.quote, author: routeTestimonials.author })
      .from(routeTestimonials)
      .where(eq(routeTestimonials.routeId, route.id))
      .all();

    return {
      // The website keys featured-route lists and the standalone route-map.html
      // iframe by this id — using the slug here keeps it stable and human-set,
      // rather than the DB's internal random UUID primary key.
      id: route.slug,
      slug: route.slug,
      name: route.name,
      days: route.days,
      km: route.km,
      price: route.price,
      currency: route.currency,
      colour: route.colour ?? "#5A6B47",
      grade: route.grade,
      tarmac: route.tarmac ?? 0,
      badge: route.badge ?? "",
      tags: route.tags,
      photo: route.photo ?? "",
      image: absolutizeUploadUrl(route.image),
      imageFocus: route.imageFocus ?? undefined,
      blurb: route.blurb ?? "",
      chips: route.chips,
      region: route.region ?? "",
      overviewLead: route.overviewLead ?? "",
      overviewBody: route.overviewBody ?? "",
      itinerary: days.map((day) => ({
        day: day.dayNumber,
        duration: day.duration ?? "",
        title: day.title,
        text: day.body ?? "",
        night: day.night ?? undefined,
        highlight: day.highlight || undefined,
      })),
      included: route.included,
      excluded: route.excluded,
      bestMonths: route.bestMonths ?? "",
      testimonials,
    };
  });

  return NextResponse.json(shaped);
}
