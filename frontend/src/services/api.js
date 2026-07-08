import axios from 'axios';

// En local se usa VITE_API_URL (definida en .env.local); en producción (Vercel)
// se usa el respaldo hacia el backend de Render.
let baseURL = import.meta.env.VITE_API_URL || 'https://empresa-turismo.onrender.com/api/operaciones/';

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
