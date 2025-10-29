ALTER TABLE `training_requests` MODIFY COLUMN `status` enum('pending','dates_selected','tentative','confirmed','approved','rejected','completed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `training_requests` ADD `referenceCode` varchar(50);--> statement-breakpoint
ALTER TABLE `training_requests` ADD `assignedTechnician` varchar(255);--> statement-breakpoint
ALTER TABLE `training_requests` ADD `requestedStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `requestedEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `confirmedStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `confirmedEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `googleSheetRow` int;--> statement-breakpoint
ALTER TABLE `training_requests` ADD `googleSheetColumn` varchar(10);--> statement-breakpoint
ALTER TABLE `training_requests` ADD `confirmationEmailSent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `training_requests` ADD CONSTRAINT `training_requests_referenceCode_unique` UNIQUE(`referenceCode`);