const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Import Custom Middlewares
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// 1. Production Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Strict CORS Configuration (Restrict allowed origins)
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://shield-her-tau.vercel.app'
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : [];

const allowedOrigins = [...defaultAllowedOrigins, ...envAllowedOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check exact match, vercel preview subdomains, or non-production mode
    const isExplicitlyAllowed = allowedOrigins.indexOf(origin) !== -1;
    const isVercelDomain = origin.endsWith('.vercel.app');
    
    if (isExplicitlyAllowed || isVercelDomain || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Blocked by CORS policy: Origin ${origin} is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Strict Payload Size Limits (Mitigate DoS & Buffer Overflow)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. Request Logging
app.use(logger);

// 5. Rate Limiting for Public & Critical Endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const sosLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'SOS rate limit reached. Please wait a moment.' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Assistant rate limit reached. Please try again shortly.' }
});

app.use('/api/', generalLimiter);

// Routes
const sosRoutes = require('./routes/sos');
const locationRoutes = require('./routes/location');
const alertsRoutes = require('./routes/alerts');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const actionsRoutes = require('./routes/actions');

app.use('/api/sos', sosLimiter, sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/actions', actionsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Only start the HTTP listener if not running in a Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\x1b[35m[ShieldHer Backend]\x1b[0m Secure Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
