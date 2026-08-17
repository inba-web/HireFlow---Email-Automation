import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let getClerkTokenFn = null;

export function setClerkTokenGetter(fn) {
  getClerkTokenFn = fn;
}

// Request interceptor to inject Clerk bearer token if available
api.interceptors.request.use(async (config) => {
  try {
    if (getClerkTokenFn) {
      // Add a 3.5s timeout race to prevent requests from hanging if Clerk network requests time out
      let timeoutId;
      const tokenPromise = getClerkTokenFn();
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Clerk token retrieval timed out')), 3500);
      });
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('Failed to retrieve Clerk token for API request:', err?.message || err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for consistent error unwrapping
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected network error occurred.',
      code: error.response?.data?.code || 'NETWORK_ERROR',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(customError);
  }
);
