ALTER TABLE `training_requests` MODIFY COLUMN `status` enum('pending','awaiting_client_confirmation','approved','rejected','completed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `training_requests` ADD `preferredDates` text;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `approvedDates` text;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `rejectionReason` text;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `technicianNotes` text;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `clientConfirmed` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `clientConfirmationToken` varchar(64);--> statement-breakpoint
ALTER TABLE `training_requests` ADD `tokenExpiresAt` timestamp;