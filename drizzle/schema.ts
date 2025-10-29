import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Training request submissions table
 */
export const trainingRequests = mysqlTable("training_requests", {
  id: int("id").autoincrement().primaryKey(),
  
  // Company Information
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }).notNull(),
  address: text("address").notNull(), // Combined full address for backward compatibility
  address1: varchar("address1", { length: 255 }),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  machineBrand: varchar("machineBrand", { length: 255 }),
  machineModel: varchar("machineModel", { length: 255 }),
  
  // OEM Information (Optional)
  oemName: varchar("oemName", { length: 255 }),
  oemAddress: text("oemAddress"),
  oemContact: varchar("oemContact", { length: 255 }),
  oemEmail: varchar("oemEmail", { length: 320 }),
  oemPhone: varchar("oemPhone", { length: 50 }),
  
  // Training Details
  controllerModel: varchar("controllerModel", { length: 255 }),
  machineType: varchar("machineType", { length: 100 }),
  programmingType: varchar("programmingType", { length: 100 }),
  trainingDays: int("trainingDays"),
  trainees: int("trainees"),
  knowledgeLevel: varchar("knowledgeLevel", { length: 100 }),
  
  // Signature and Acceptance
  applicantName: varchar("applicantName", { length: 255 }),
  applicationDate: timestamp("applicationDate"),
  signatureData: text("signatureData"), // Base64 encoded signature
  termsAccepted: boolean("termsAccepted").default(false).notNull(),
  
  // Quotation Details
  trainingPrice: int("trainingPrice"),
  travelTime: int("travelTime"),
  travelTimeHours: int("travelTimeHours"),
  travelExpenses: int("travelExpenses"),
  hotelCost: int("hotelCost"),
  foodCost: int("foodCost"),
  carRentalCost: int("carRentalCost"),
  flightCost: int("flightCost"),
  totalPrice: int("totalPrice"),
  nearestAirport: varchar("nearestAirport", { length: 100 }),
  
  // Metadata
  language: varchar("language", { length: 10 }).default("en"),
  
  // Calendar and Scheduling
  referenceCode: varchar("referenceCode", { length: 50 }).unique(), // 290903-4020-XXXX
  assignedTechnician: varchar("assignedTechnician", { length: 255 }),
  requestedStartDate: timestamp("requestedStartDate"),
  requestedEndDate: timestamp("requestedEndDate"),
  confirmedStartDate: timestamp("confirmedStartDate"),
  confirmedEndDate: timestamp("confirmedEndDate"),
  googleSheetRow: int("googleSheetRow"),
  googleSheetColumn: varchar("googleSheetColumn", { length: 10 }),
  confirmationEmailSent: boolean("confirmationEmailSent").default(false),
  
  // Google Calendar Integration
  googleCalendarEventId: varchar("googleCalendarEventId", { length: 255 }), // Event ID in Google Calendar
  calendarStatus: mysqlEnum("calendarStatus", ["none", "pending", "confirmed"]).default("none"), // none = no event, pending = yellow, confirmed = green
  lastCalendarCheck: timestamp("lastCalendarCheck"), // Last time we checked calendar status
  
  status: mysqlEnum("status", ["pending", "dates_selected", "tentative", "confirmed", "approved", "rejected", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingRequest = typeof trainingRequests.$inferSelect;
export type InsertTrainingRequest = typeof trainingRequests.$inferInsert;


/**
 * Notification email addresses configuration table
 */
export const notificationEmails = mysqlTable("notification_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationEmail = typeof notificationEmails.$inferSelect;
export type InsertNotificationEmail = typeof notificationEmails.$inferInsert;

