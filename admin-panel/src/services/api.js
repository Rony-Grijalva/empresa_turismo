import axios from 'axios';

let baseURL = 'https://empresa-turismo.onrender.com/api';

console.log('URL de destino (Admin) HARDCODED:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const adminService = {
  // --- DASHBOARD & CALENDAR ---
  getDashboardStats: () => api.get('/admin/dashboard/stats/'),
  getDashboardChart: () => api.get('/admin/dashboard/chart/'),
  exportReservasCsv: () => api.get('/admin/reportes/reservas-csv/', { responseType: 'blob' }),
  getCalendario: () => api.get('/admin/calendario/'),

  // --- USUARIOS ---
  getUsuarios: (params) => api.get('/admin/usuarios/', { params }),
  createUsuario: (data) => api.post('/admin/usuarios/', data),
  updateUsuario: (id, data) => api.put(`/admin/usuarios/${id}/`, data),
  deleteUsuario: (id) => api.delete(`/admin/usuarios/${id}/`),

  // --- CONDUCTORES ---
  getConductores: (params) => api.get('/admin/conductores/', { params }),
  createConductor: (data) => api.post('/admin/conductores/', data),
  updateConductor: (id, data) => api.put(`/admin/conductores/${id}/`, data),
  deleteConductor: (id) => api.delete(`/admin/conductores/${id}/`),

  // --- VEHICULOS (FLOTA) ---
  getVehiculos: (params) => api.get('/admin/vehiculos/', { params }),
  createVehiculo: (data) => api.post('/admin/vehiculos/', data),
  updateVehiculo: (id, data) => api.put(`/admin/vehiculos/${id}/`, data),
  deleteVehiculo: (id) => api.delete(`/admin/vehiculos/${id}/`),

  // --- MANTENIMIENTOS ---
  createMantenimiento: (data) => api.post('/admin/mantenimientos/', data),

  // --- SERVICIOS ---
  getServicios: (params) => api.get('/admin/servicios/', { params }),
  createServicio: (data) => api.post('/admin/servicios/', data),
  updateServicio: (id, data) => api.put(`/admin/servicios/${id}/`, data),
  deleteServicio: (id) => api.delete(`/admin/servicios/${id}/`),

  // --- RESERVAS ---
  getReservas: (params) => api.get('/admin/reservas/', { params }),
  createReserva: (data) => api.post('/admin/reservas/', data),
  updateReserva: (id, data) => api.put(`/admin/reservas/${id}/`, data),
  updateReservaEstado: (id, data) => api.put(`/admin/reservas/${id}/estado`, data),
  deleteReserva: (id) => api.delete(`/admin/reservas/${id}/`),
  
  // --- RUTAS (ASIGNACIÓN) ---
  asignarRuta: (data) => api.post('/admin/rutas/asignar/', data),
  calcularCombustible: (data) => api.post('/admin/rutas/calcular-combustible/', data),
  
  // --- MENSAJES ---
  getMensajes: (params) => api.get('/admin/mensajes/', { params }),
  marcarLeido: (id, leido) => api.put(`/admin/mensajes/${id}/leido`, { leido }),
  deleteMensaje: (id) => api.delete(`/admin/mensajes/${id}/`),
  
  // --- LOOKUPS ---
  getLookupsClientes: () => api.get('/admin/lookups/clientes'),
  getLookupsServicios: () => api.get('/admin/lookups/servicios'),
  getLookupsVehiculos: (params) => api.get('/admin/lookups/vehiculos', { params }),
  getLookupsConductores: (params) => api.get('/admin/lookups/conductores', { params }),
};
