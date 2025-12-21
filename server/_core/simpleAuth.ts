import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const ADMIN_PIN_BASE = 4020;

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  name: string;
}

/**
 * Validate dynamic admin PIN (4020 + day + minutes)
 */
export function validateAdminPin(pin: string): boolean {
  const now = new Date();
  const day = now.getDate();
  const minutes = now.getMinutes();
  const correctPin = ADMIN_PIN_BASE + day + minutes;
  
  return parseInt(pin) === correctPin;
}

/**
 * Generate JWT token for admin
 */
export function generateAdminToken(): string {
  const admin: AdminUser = {
    id: 'admin-1',
    email: process.env.OWNER_EMAIL || 'admin@fagor-automation.com',
    role: 'admin',
    name: process.env.OWNER_NAME || 'Fagor Admin',
  };

  return jwt.sign(admin, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token and extract user
 */
export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to extract user from cookie
 */
export function getUserFromRequest(req: Request): AdminUser | null {
  const token = req.cookies?.['fagor_admin_token'];
  if (!token) return null;
  
  return verifyToken(token);
}

/**
 * Set admin cookie
 */
export function setAdminCookie(res: Response, token: string) {
  res.cookie('fagor_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear admin cookie
 */
export function clearAdminCookie(res: Response) {
  res.clearCookie('fagor_admin_token');
}
