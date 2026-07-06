import axios from 'axios';

let baseURL = 'https://empresa-turismo.onrender.com/api/operaciones/';

console.log('URL de destino (Frontend) HARDCODED:', baseURL);

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
