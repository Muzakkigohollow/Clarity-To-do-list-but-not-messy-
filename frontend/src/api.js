import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {})
  },
});

export default api;
