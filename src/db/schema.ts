import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => text("created_at").notNull().default(sql`(current_timestamp)`);

export type BookingStage = "enquiry" | "quoted" | "confirmed" | "driving" | "done";

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Team"),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const vehicles = sqliteTable("vehicles", {
  id: id(),
  name: text("name").notNull(),
  plate: text("plate").notNull(),
  dailyRate: real("daily_rate").notNull().default(0),
  currency: text("currency").notNull().default("$"),
  seats: integer("seats").notNull().default(5),
  gearbox: text("gearbox").notNull().default("Manual"),
  year: integer("year"),
  odometer: integer("odometer"),
  nextService: text("next_service"),
  status: text("status").notNull().default("available"),
  kit: text("kit", { mode: "json" }).notNull().default({}),
  photoUrl: text("photo_url"),
  createdAt: createdAt(),
  updatedAt: createdAt(),
});

export const vehicleWorkshopRecords = sqliteTable("vehicle_workshop_records", {
  id: id(),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  occurredOn: text("occurred_on").notNull(),
  note: text("note").notNull(),
  createdAt: createdAt(),
});

export const routes = sqliteTable("routes", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  days: integer("days").notNull(),
  km: integer("km").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("$"),
  grade: text("grade").notNull().default("moderate"),
  region: text("region"),
  badge: text("badge"),
  blurb: text("blurb"),
  tags: text("tags", { mode: "json" }).notNull().default([]),
  chips: text("chips", { mode: "json" }).notNull().default([]),
  overviewLead: text("overview_lead"),
  overviewBody: text("overview_body"),
  bestMonths: text("best_months"),
  included: text("included", { mode: "json" }).notNull().default([]),
  excluded: text("excluded", { mode: "json" }).notNull().default([]),
  createdAt: createdAt(),
  updatedAt: createdAt(),
});

export const routeItineraryDays = sqliteTable("route_itinerary_days", {
  id: id(),
  routeId: text("route_id").notNull().references(() => routes.id),
  dayNumber: integer("day_number").notNull(),
  duration: text("duration"),
  title: text("title").notNull(),
  body: text("body"),
  night: text("night"),
  highlight: integer("highlight", { mode: "boolean" }).notNull().default(false),
});

export const routeTestimonials = sqliteTable("route_testimonials", {
  id: id(),
  routeId: text("route_id").notNull().references(() => routes.id),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
});

export const journalPosts = sqliteTable("journal_posts", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  blurb: text("blurb"),
  body: text("body"),
  coverImageUrl: text("cover_image_url"),
  minRead: integer("min_read").notNull().default(5),
  publishedAt: text("published_at"),
  createdAt: createdAt(),
  updatedAt: createdAt(),
});

export const bookings = sqliteTable("bookings", {
  id: id(),
  ref: text("ref").notNull().unique(),
  partyName: text("party_name").notNull(),
  country: text("country"),
  source: text("source"),
  routeId: text("route_id").references(() => routes.id),
  routeInterest: text("route_interest"),
  arrivalDate: text("arrival_date"),
  nights: integer("nights"),
  pax: integer("pax").notNull().default(1),
  lang: text("lang").notNull().default("EN"),
  comfort: text("comfort"),
  mustSee: text("must_see"),
  stage: text("stage").notNull().default("enquiry").$type<BookingStage>(),
  value: real("value").notNull().default(0),
  currency: text("currency").notNull().default("$"),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: createdAt(),
});

export const bookingActivity = sqliteTable("booking_activity", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  note: text("note").notNull(),
  createdAt: createdAt(),
});

export const quoteLineItems = sqliteTable("quote_line_items", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  label: text("label").notNull(),
  rate: real("rate").notNull().default(0),
  qty: text("qty"),
  amount: real("amount").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const invoices = sqliteTable("invoices", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  invoiceNo: text("invoice_no").notNull().unique(),
  total: real("total").notNull().default(0),
  paid: real("paid").notNull().default(0),
  dueDate: text("due_date"),
  state: text("state").notNull().default("awaiting_deposit"),
  createdAt: createdAt(),
});

export const permits = sqliteTable("permits", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  permitType: text("permit_type").notNull(),
  status: text("status").notNull().default("pending"),
  reference: text("reference"),
  permitDate: text("permit_date"),
  createdAt: createdAt(),
});

export const lodgeBookings = sqliteTable("lodge_bookings", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  lodgeName: text("lodge_name").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  status: text("status").notNull().default("pending"),
  createdAt: createdAt(),
});

export const travellerDocs = sqliteTable("traveller_docs", {
  id: id(),
  bookingId: text("booking_id").notNull().references(() => bookings.id),
  travellerName: text("traveller_name").notNull(),
  docType: text("doc_type").notNull().default("passport"),
  docNumber: text("doc_number"),
  expiryDate: text("expiry_date"),
  fileUrl: text("file_url"),
  createdAt: createdAt(),
});

export const roadSupportLog = sqliteTable("road_support_log", {
  id: id(),
  bookingId: text("booking_id").references(() => bookings.id),
  note: text("note").notNull(),
  occurredAt: text("occurred_at").notNull().default(sql`(current_timestamp)`),
});

export const handovers = sqliteTable("handovers", {
  id: id(),
  bookingId: text("booking_id").references(() => bookings.id),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  handoverType: text("handover_type").notNull().default("pickup"),
  scheduledAt: text("scheduled_at").notNull(),
  location: text("location"),
  createdAt: createdAt(),
});
