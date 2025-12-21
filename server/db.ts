import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, trainingRequests, InsertTrainingRequest, TrainingRequest } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Create connection pool with SSL configuration for production
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Training request helpers
export async function createTrainingRequest(request: InsertTrainingRequest): Promise<TrainingRequest> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(trainingRequests).values(request);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(trainingRequests).where(eq(trainingRequests.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getAllTrainingRequests(): Promise<TrainingRequest[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(trainingRequests);
}

export async function getTrainingRequestById(id: number): Promise<TrainingRequest | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(trainingRequests).where(eq(trainingRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


// Notification email helpers
import { notificationEmails, InsertNotificationEmail, NotificationEmail } from "../drizzle/schema";

export async function getActiveNotificationEmails(): Promise<NotificationEmail[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db.select().from(notificationEmails);
  // Filter for active emails
  return results.filter(email => email.isActive);
}

export async function addNotificationEmail(email: string): Promise<NotificationEmail> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(notificationEmails).values({ email, isActive: true });
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(notificationEmails).where(eq(notificationEmails.id, insertedId)).limit(1);
  return inserted[0];
}

export async function removeNotificationEmail(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(notificationEmails).where(eq(notificationEmails.id, id));
}

export async function getAllNotificationEmails(): Promise<NotificationEmail[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(notificationEmails);
}

// Calendar and scheduling helpers
export async function generateReferenceCode(): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const prefix = '290903-4020';
  
  // Get count of existing requests to determine next number
  const allRequests = await db.select({ id: trainingRequests.id }).from(trainingRequests);
  const nextNumber = allRequests.length + 1;
  
  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
}

export async function getTrainingRequestByReferenceCode(referenceCode: string): Promise<TrainingRequest | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(trainingRequests).where(eq(trainingRequests.referenceCode, referenceCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

