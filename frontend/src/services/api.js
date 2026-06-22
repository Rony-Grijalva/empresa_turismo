import axios from 'axios';

// Instancia configurada para apuntar al backend Django Ninja
const api = axios.create({
  baseURL: 'http://localhost:8000/api/operaciones/',
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
