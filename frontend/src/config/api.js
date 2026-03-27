const FALLBACK_API_URL = 'https://inventory-app-id7d.onrender.com';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL?.trim() || FALLBACK_API_URL;
