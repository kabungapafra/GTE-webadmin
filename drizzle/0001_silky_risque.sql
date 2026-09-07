CREATE TABLE `company_info` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`whatsapp` text NOT NULL,
	`email` text NOT NULL,
	`instagram_url` text,
	`facebook_url` text,
	`x_url` text,
	`youtube_url` text,
	`founder_name` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
