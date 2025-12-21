import { Router } from 'express';
import { validateAdminPin, generateAdminToken, setAdminCookie, clearAdminCookie, getUserFromRequest } from './simpleAuth';

export const adminRouter = Router();

/**
 * POST /api/admin/login
 * Validate PIN and set admin cookie
 */
adminRouter.post('/login', (req, res) => {
  const { pin } = req.body;

  if (!pin || !validateAdminPin(pin)) {
    return res.status(401).json({ success: false, error: 'Invalid PIN' });
  }

  const token = generateAdminToken();
  setAdminCookie(res, token);

  return res.json({ success: true });
});

/**
 * POST /api/admin/logout
 * Clear admin cookie
 */
adminRouter.post('/logout', (req, res) => {
  clearAdminCookie(res);
  return res.json({ success: true });
});

/**
 * GET /api/admin/me
 * Get current admin user
 */
adminRouter.get('/me', (req, res) => {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ user: null });
  }

  return res.json({ user });
});
