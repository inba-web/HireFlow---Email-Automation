import { User } from '../models/User.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    return res.json({
      success: true,
      data: {
        user,
        authenticated: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function syncUser(req, res, next) {
  try {
    const { clerkUserId, email, name, imageUrl, role } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'clerkUserId is required' });
    }

    let user = null;
    if (isDBConnected()) {
      user = await User.findOneAndUpdate(
        { clerkUserId },
        {
          $set: {
            email: (email || '').toLowerCase().trim(),
            name: name || 'User',
            imageUrl: imageUrl || '',
            ...(role && { role }),
            lastLoginAt: new Date(),
          },
          $setOnInsert: {
            status: 'Active',
            role: role || 'Admin', // First user default Admin
          },
        },
        { new: true, upsert: true }
      );

      await recordAudit({
        clerkUserId,
        userName: user.name,
        userEmail: user.email,
        action: 'USER_SYNCED',
        resourceType: 'User',
        resourceId: user._id,
      });
    } else {
      user = {
        clerkUserId,
        email: email || 'hr.admin@thodar.dev',
        name: name || 'Thodar User',
        role: role || 'Admin',
        status: 'Active',
      };
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: [req.user] });
    }
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Admin', 'HR Manager', 'HR Executive'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (isDBConnected()) {
      const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await recordAudit({
        clerkUserId: req.user.clerkUserId,
        userName: req.user.name,
        userEmail: req.user.email,
        action: 'USER_ROLE_CHANGED',
        resourceType: 'User',
        resourceId: updatedUser._id,
        details: { newRole: role },
      });

      return res.json({ success: true, data: updatedUser });
    }

    return res.json({ success: true, data: { _id: userId, role } });
  } catch (err) {
    next(err);
  }
}
