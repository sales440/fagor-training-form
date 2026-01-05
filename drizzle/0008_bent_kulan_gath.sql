ALTER TABLE `training_requests` ADD `reminderSent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `reminderSentAt` timestamp;