import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'se_component_catalog_jwt_secret_key_2026';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }

    try {
      const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists.' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({ error: 'Authentication database check failed.' });
    }
  });
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (!err && decoded) {
      try {
        const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        if (user) req.user = user;
      } catch (e) {}
    }
    next();
  });
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: [${allowedRoles.join(', ')}]. Your role: '${req.user.role}'`
      });
    }

    next();
  };
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
