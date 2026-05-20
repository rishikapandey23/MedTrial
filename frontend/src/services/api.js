import axios from 'axios';

const api = axios.create({
 baseURL: '', // Vite dev proxy redirects relative /api paths to http://localhost:8000
});

// Request interceptor to attach JWT tokens and user-level Gemini Key overrides
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token');
 if (token) {
  config.headers.Authorization = `Bearer ${token}`;
 }
 
 const customGeminiKey = localStorage.getItem('custom_gemini_key');
 if (customGeminiKey) {
  config.headers['X-Gemini-Key'] = customGeminiKey;
 }
 
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
);

export default api;
