import { clerkMiddleware, getAuth } from '@clerk/express';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { isDBConnected } from '../config/db.js';

// Apply Clerk middleware globally if Clerk secret key is configured
export const clerkAuth = config.CLERK_SECRET_KEY
  ? clerkMiddleware({ secretKey: config.CLERK_SECRET_KEY, publishableKey: config.CLERK_PUBLISHABLE_KEY })
  : (req, res, next) => next();

/**
 * Require authentication middleware.
 * Verifies Clerk session or allows fallback mock session for local development if CLERK_SECRET_KEY is omitted.
 */
export async function requireAuth(req, res, next) {
  try {
    let clerkUserId = null;

    if (config.CLERK_SECRET_KEY) {
      const auth = getAuth(req);
      clerkUserId = auth?.userId;
      if (!clerkUserId) {
        return res.status(401).json({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in via Clerk.',
        });
      }
    } else {
      // Fallback for local testing if no Clerk secret key is supplied
      clerkUserId = req.headers['x-clerk-user-id'] || 'dev_user_12345';
    }

    // Attach user information to request
    let appUser = null;
    if (isDBConnected()) {
      appUser = await User.findOne({ clerkUserId });
      if (!appUser) {
        // Auto-sync application user
        appUser = await User.create({
          clerkUserId,
          email: req.headers['x-user-email'] || 'hr.admin@hireflow.dev',
          name: req.headers['x-user-name'] || 'HireFlow Admin',
          role: 'Admin',
          status: 'Active',
        });
      }
    } else {
      // Memory fallback user
      appUser = {
        clerkUserId,
        email: 'hr.admin@hireflow.dev',
        name: 'HireFlow Admin',
        role: 'Admin',
        status: 'Active',
      };
    }

    req.auth = { userId: clerkUserId };
    req.user = appUser;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({
      success: false,
      code: 'AUTH_VERIFICATION_FAILED',
      message: 'Invalid or expired authentication session.',
    });
  }
}
