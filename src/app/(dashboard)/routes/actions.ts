"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { routes, routeItineraryDays, routeTestimonials } from "@/db/schema";

const FIELD_MAP = {
  name: "name",
  slug: "slug",
  region: "region",
  badge: "badge",
  grade: "grade",
  colour: "colour",
  tarmac: "tarmac",
  days: "days",
  km: "km",
  price: "price",
  currency: "currency",
  blurb: "blurb",
  overview_lead: "overviewLead",
  overview_body: "overviewBody",
  best_months: "bestMonths",
  image: "image",
  image_focus: "imageFocus",
  photo: "photo",
} as const;

export async function updateRouteField(routeId: string, field: string, value: string | number) {
  const column = FIELD_MAP[field as keyof typeof FIELD_MAP];
  if (!column) throw new Error(`Unknown route field: ${field}`);
  db.update(routes).set({ [column]: value }).where(eq(routes.id, routeId)).run();
  revalidatePath("/routes");
}

const ARRAY_FIELD_MAP = {
  tags: "tags",
  chips: "chips",
  included: "included",
  excluded: "excluded",
} as const;

export async function updateRouteArrayField(routeId: string, field: string, items: string[]) {
  const column = ARRAY_FIELD_MAP[field as keyof typeof ARRAY_FIELD_MAP];
  if (!column) throw new Error(`Unknown route array field: ${field}`);
  db.update(routes).set({ [column]: items }).where(eq(routes.id, routeId)).run();
  revalidatePath("/routes");
}

export async function createRoute() {
  const id = randomUUID();
  const slug = `new-route-${id.slice(0, 8)}`;
  db.insert(routes).values({
    id,
    slug,
    name: "New route",
    days: 1,
    km: 0,
    price: 0,
  }).run();
  revalidatePath("/routes");
  return id;
}

export async function deleteRoute(routeId: string) {
  db.delete(routeItineraryDays).where(eq(routeItineraryDays.routeId, routeId)).run();
  db.delete(routeTestimonials).where(eq(routeTestimonials.routeId, routeId)).run();
  db.delete(routes).where(eq(routes.id, routeId)).run();
  revalidatePath("/routes");
}

export async function addItineraryDay(routeId: string, dayNumber: number) {
  db.insert(routeItineraryDays).values({
    routeId,
    dayNumber,
    title: "New day",
  }).run();
  revalidatePath("/routes");
}

const DAY_FIELD_MAP = {
  day_number: "dayNumber",
  duration: "duration",
  title: "title",
  body: "body",
  night: "night",
} as const;

export async function updateItineraryDay(dayId: string, field: string, value: string | number) {
  const column = DAY_FIELD_MAP[field as keyof typeof DAY_FIELD_MAP];
  if (!column) throw new Error(`Unknown itinerary day field: ${field}`);
  db.update(routeItineraryDays).set({ [column]: value }).where(eq(routeItineraryDays.id, dayId)).run();
  revalidatePath("/routes");
}

export async function toggleItineraryDayHighlight(dayId: string, highlight: boolean) {
  db.update(routeItineraryDays).set({ highlight }).where(eq(routeItineraryDays.id, dayId)).run();
  revalidatePath("/routes");
}

export async function deleteItineraryDay(dayId: string) {
  db.delete(routeItineraryDays).where(eq(routeItineraryDays.id, dayId)).run();
  revalidatePath("/routes");
}

export async function addTestimonial(routeId: string) {
  db.insert(routeTestimonials).values({
    routeId,
    quote: "New testimonial",
    author: "Traveller name",
  }).run();
  revalidatePath("/routes");
}

export async function updateTestimonial(testimonialId: string, field: "quote" | "author", value: string) {
  db.update(routeTestimonials).set({ [field]: value }).where(eq(routeTestimonials.id, testimonialId)).run();
  revalidatePath("/routes");
}

export async function deleteTestimonial(testimonialId: string) {
  db.delete(routeTestimonials).where(eq(routeTestimonials.id, testimonialId)).run();
  revalidatePath("/routes");
}
