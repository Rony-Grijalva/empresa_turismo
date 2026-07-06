import axios from 'axios';

let baseURL = 'http://localhost:8000/api/operaciones/';
if (import.meta.env.VITE_API_URL) {
  let envUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  if (envUrl.endsWith('/api/operaciones')) {
    baseURL = envUrl + '/';
  } else if (envUrl.endsWith('/api')) {
    baseURL = envUrl + '/operaciones/';
  } else {
    baseURL = envUrl + '/api/operaciones/';
  }
}

console.log('URL de destino (Frontend):', baseURL);

// Instancia configurada para apuntar al backend Django Ninja
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
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
