// Client-side environment configuration
// Note: Only NEXT_PUBLIC_ prefixed variables are available in the browser

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const NODE_ENV = process.env.NODE_ENV || 'development';