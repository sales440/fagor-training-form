ALTER TABLE `training_requests` ADD `googleCalendarEventId` varchar(255);--> statement-breakpoint
ALTER TABLE `training_requests` ADD `calendarStatus` enum('none','pending','confirmed') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `training_requests` ADD `lastCalendarCheck` timestamp;