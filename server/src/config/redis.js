import Redis from 'ioredis';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient = null;
let isRedisAvailable = false;

export function getRedisClient() {
  if (redisClient) return redisClient;

  // If no REDIS_URL or localhost, probe gently
  try {
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      autoResubscribe: false,
      reconnectOnError: () => false,
      retryStrategy(times) {
        if (times > 1) {
          return null; // Stop reconnecting after 1 attempt
        }
        return 1000;
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      logger.info('Connected to Redis server');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      // Suppress unhandled crash noise
    });

    redisClient.connect().then(() => {
      isRedisAvailable = true;
    }).catch(() => {
      isRedisAvailable = false;
      logger.info('Redis server not active. Using in-memory async worker queue.');
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
