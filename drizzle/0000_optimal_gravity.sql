CREATE TABLE `booking_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`ref` text NOT NULL,
	`party_name` text NOT NULL,
	`country` text,
	`source` text,
	`route_id` text,
	`route_interest` text,
	`arrival_date` text,
	`nights` integer,
	`pax` integer DEFAULT 1 NOT NULL,
	`lang` text DEFAULT 'EN' NOT NULL,
	`comfort` text,
	`must_see` text,
	`stage` text DEFAULT 'enquiry' NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT '$' NOT NULL,
	`vehicle_id` text,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_ref_unique` ON `bookings` (`ref`);--> statement-breakpoint
CREATE TABLE `handovers` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text,
	`vehicle_id` text,
	`handover_type` text DEFAULT 'pickup' NOT NULL,
	`scheduled_at` text NOT NULL,
	`location` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`invoice_no` text NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`paid` real DEFAULT 0 NOT NULL,
	`due_date` text,
	`state` text DEFAULT 'awaiting_deposit' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_no_unique` ON `invoices` (`invoice_no`);--> statement-breakpoint
CREATE TABLE `journal_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`blurb` text,
	`body` text,
	`cover_image_url` text,
	`min_read` integer DEFAULT 5 NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_posts_slug_unique` ON `journal_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `lodge_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`lodge_name` text NOT NULL,
	`check_in` text,
	`check_out` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permits` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`permit_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reference` text,
	`permit_date` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quote_line_items` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`label` text NOT NULL,
	`rate` real DEFAULT 0 NOT NULL,
	`qty` text,
	`amount` real DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `road_support_log` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text,
	`note` text NOT NULL,
	`occurred_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `route_itinerary_days` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`duration` text,
	`title` text NOT NULL,
	`body` text,
	`night` text,
	`highlight` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `route_testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`quote` text NOT NULL,
	`author` text NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`days` integer NOT NULL,
	`km` integer NOT NULL,
	`price` real NOT NULL,
	`currency` text DEFAULT '$' NOT NULL,
	`grade` text DEFAULT 'moderate' NOT NULL,
	`region` text,
	`badge` text,
	`blurb` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`chips` text DEFAULT '[]' NOT NULL,
	`overview_lead` text,
	`overview_body` text,
	`best_months` text,
	`included` text DEFAULT '[]' NOT NULL,
	`excluded` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routes_slug_unique` ON `routes` (`slug`);--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'Team' NOT NULL,
	`approved` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `traveller_docs` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`traveller_name` text NOT NULL,
	`doc_type` text DEFAULT 'passport' NOT NULL,
	`doc_number` text,
	`expiry_date` text,
	`file_url` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicle_workshop_records` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`occurred_on` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`plate` text NOT NULL,
	`daily_rate` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT '$' NOT NULL,
	`seats` integer DEFAULT 5 NOT NULL,
	`gearbox` text DEFAULT 'Manual' NOT NULL,
	`year` integer,
	`odometer` integer,
	`next_service` text,
	`status` text DEFAULT 'available' NOT NULL,
	`kit` text DEFAULT '{}' NOT NULL,
	`photo_url` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
