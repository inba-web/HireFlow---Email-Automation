import Redis from 'ioredis';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient = null;
let isRedisAvailable = false;

export function getRedisClient() {
  if (redisClient) return redisClient;

  // If no REDIS_URL or localhost, probe gently
  try {
    const isTls = config.REDIS_URL?.startsWith('rediss://');
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
      retryStrategy(times) {
        if (times > 5) {
          return null; // Stop reconnecting after 5 attempts
        }
        return Math.min(times * 500, 2000);
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      logger.info('Connecting to Redis server...');
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
      logger.info('Successfully connected and ready on Redis');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      logger.warn(`Redis connection event: ${err.message}`);
    });

    return redisClient;
  } catch (err) {
    logger.info('Using in-memory async worker queue.');
    return null;
  }
}

export function checkRedisAvailable() {
  return isRedisAvailable && redisClient && redisClient.status === 'ready';
}
