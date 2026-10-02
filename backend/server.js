import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import componentRoutes from './src/routes/componentRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { initializeAndSeedDb } from './src/db/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// 2. CORS Handling
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting on Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 5. Request Logging
if (!IS_PRODUCTION) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
    next();
  });
}

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Software Component Cataloging System (CBSE)',
    database: process.env.DATABASE_URL ? 'PostgreSQL (Cloud)' : 'SQLite (Local)',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 7. Single-Deployment Static Serving (serves React frontend build if present)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

// 8. 404 Handler for Unmatched API Routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found.` });
});

// 9. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: IS_PRODUCTION ? 'An unexpected server error occurred.' : err.message
  });
});

// Boot and seed
async function startServer() {
  try {
    await initializeAndSeedDb();
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 CBSE Component Catalog API running on port ${PORT}`);
      console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL (Cloud)' : 'SQLite (Local)'}`);
      console.log(`🔒 Security: Helmet & Auth Rate Limiting Active`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===================================================`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

startServer();
