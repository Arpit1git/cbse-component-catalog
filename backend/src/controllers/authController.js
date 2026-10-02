import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'contributor' ? 'contributor' : 'consumer';

    // Check if email already registered
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, assignedRole]
    );

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: assignedRole,
    };

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account registered successfully.',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const token = generateToken(safeUser);

    return res.json({
      message: 'Logged in successfully.',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user.' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let stats = {};
    if (user.role === 'contributor' || user.role === 'admin') {
      const compCount = await db.get('SELECT COUNT(*) AS count FROM components WHERE owner_id = ?', [user.id]);
      stats.myComponentsCount = Number(compCount?.count || 0);
    }

    return res.json({ user: { ...user, stats } });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}
