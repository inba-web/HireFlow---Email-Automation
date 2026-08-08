/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles Array of allowed roles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      });
    }

    const userRole = req.user.role || 'HR Executive';

    // Admin has superuser access to everything
    if (userRole === 'Admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_RESOURCE',
      message: `Access denied. Requires one of: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
    });
  };
}
