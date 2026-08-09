import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { clerkAuth } from './middleware/auth.js';
import { globalApiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { initQueueWorker } from './services/queueService.js';
import { seedInitialData } from './utils/seedData.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS configuration
const allowedOrigins = [
  config.CLIENT_URL,
  'https://hire-flow-email-automation.vercel.app',
  'https://hireflow-email-automation.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-request-id',
    'x-clerk-user-id',
    'x-user-email',
    'x-user-name',
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Request parsers & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Global API Rate Limiter
app.use('/api', globalApiLimiter);

// 5. Clerk Auth Middleware
app.use(clerkAuth);

// 6. Master API Routes
app.use('/api', apiRouter);

// 7. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// 8. Centralized Error Handler
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();
  await seedInitialData();
  initQueueWorker();

  const server = app.listen(config.PORT, () => {
    logger.info(`HireFlow API Server running on port ${config.PORT} [${config.NODE_ENV}]`);
    logger.info(`Ready to serve client requests at ${config.CLIENT_URL}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error(`Fatal startup error: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
