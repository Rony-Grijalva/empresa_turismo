import axios from 'axios';

// En local se usa VITE_API_URL (definida en .env.local); en producción (Vercel)
// forzamos la URL correcta del backend para evitar errores 404 por mala configuración de VITE_API_URL.
let baseURL = import.meta.env.PROD 
  ? 'https://empresa-turismo.onrender.com/api/operaciones/'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/operaciones/');

console.log('URL de destino (Frontend):', baseURL);

// Instancia configurada para apuntar al backend Django Ninja
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para debugging (opcional)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
