import { readFileSync } from "fs";
import { db } from "./index";
import {
  users,
  staff,
  vehicles,
  vehicleWorkshopRecords,
  routes,
  bookings,
  bookingActivity,
  quoteLineItems,
  invoices,
  roadSupportLog,
} from "./schema";

const dumpPath = process.argv[2];
if (!dumpPath) {
  console.error("Usage: tsx src/db/seed.ts <path-to-dump.json>");
  process.exit(1);
}

const dump = JSON.parse(readFileSync(dumpPath, "utf-8"));

db.insert(users)
  .values({ id: dump.user.id, email: dump.user.email, passwordHash: dump.user.encrypted_password })
  .run();

db.insert(staff)
  .values({ id: dump.user.id, name: dump.user.name, role: dump.user.role, approved: dump.user.approved })
  .run();

for (const v of dump.vehicles) {
  db.insert(vehicles)
    .values({
      id: v.id,
      name: v.name,
      plate: v.plate,
      dailyRate: v.daily_rate,
      currency: v.currency,
      seats: v.seats,
      gearbox: v.gearbox,
      year: v.year,
      odometer: v.odometer,
      nextService: v.next_service,
      status: v.status,
      kit: v.kit,
      photoUrl: v.photo_url,
    })
    .run();
}

for (const r of dump.vehicle_workshop_records) {
  db.insert(vehicleWorkshopRecords)
    .values({ id: r.id, vehicleId: r.vehicle_id, occurredOn: r.occurred_on, note: r.note })
    .run();
}

for (const r of dump.routes) {
  db.insert(routes)
    .values({
      id: r.id,
      slug: r.slug,
      name: r.name,
      days: r.days,
      km: r.km,
      price: r.price,
      currency: r.currency,
      grade: r.grade,
      region: r.region,
      badge: r.badge,
      blurb: r.blurb,
      tags: r.tags,
      chips: r.chips,
      overviewLead: r.overview_lead,
      overviewBody: r.overview_body,
      bestMonths: r.best_months,
      included: r.included,
      excluded: r.excluded,
    })
    .run();
}

for (const b of dump.bookings) {
  db.insert(bookings)
    .values({
      id: b.id,
      ref: b.ref,
      partyName: b.party_name,
      country: b.country,
      source: b.source,
      routeId: b.route_id,
      routeInterest: b.route_interest,
      arrivalDate: b.arrival_date,
      nights: b.nights,
      pax: b.pax,
      lang: b.lang,
      comfort: b.comfort,
      mustSee: b.must_see,
      stage: b.stage,
      value: b.value,
      currency: b.currency,
      vehicleId: b.vehicle_id,
      notes: b.notes,
    })
    .run();
}

for (const a of dump.booking_activity) {
  db.insert(bookingActivity).values({ id: a.id, bookingId: a.booking_id, note: a.note }).run();
}

for (const q of dump.quote_line_items) {
  db.insert(quoteLineItems)
    .values({ id: q.id, bookingId: q.booking_id, label: q.label, rate: q.rate, qty: q.qty, amount: q.amount, sortOrder: q.sort_order })
    .run();
}

for (const i of dump.invoices) {
  db.insert(invoices)
    .values({ id: i.id, bookingId: i.booking_id, invoiceNo: i.invoice_no, total: i.total, paid: i.paid, dueDate: i.due_date, state: i.state })
    .run();
}

for (const l of dump.road_support_log) {
  db.insert(roadSupportLog).values({ id: l.id, bookingId: l.booking_id, note: l.note, occurredAt: l.occurred_at }).run();
}

console.log("Seed complete.");
