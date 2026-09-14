// API Configuration
const isProduction = import.meta.env.PROD;

const defaultApiUrl = isProduction
  ? 'https://urjasync-service.onrender.com/api'
  : 'http://localhost:5000/api';

const defaultSocketUrl = isProduction
  ? 'https://urjasync-service.onrender.com'
  : 'http://localhost:5000';

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;

