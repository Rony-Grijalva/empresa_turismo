import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reservas = () => {
  const [servicios, setServicios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    fecha_servicio: '',
    hora_servicio: '',
    cantidad_pasajeros: 1,
    origen: '',
    destino: '',
    servicio_id: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargar servicios activos desde el backend
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await api.get('/servicios');
        setServicios(response.data);
      } catch (err) {
        console.error('Error cargando servicios:', err);
      }
    };
    fetchServicios();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        servicio_id: formData.servicio_id,
        cantidad_pasajeros: parseInt(formData.cantidad_pasajeros, 10)
      };

      const response = await api.post('/reservas', payload);
      
      setSuccess(true);
      // Opcional: Redirigir al link de WhatsApp provisto por el backend
      // window.location.href = response.data.whatsapp_link;
      
    } catch (err) {
      console.error('Error al crear reserva:', err);
      let errorMsg = 'Ocurrió un error de conexión con el servidor. Por favor, intenta nuevamente.';
      
      // Extraer mensaje de error de forma segura (prevenir objetos en React JSX)
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Django Ninja devuelve array de objetos en errores de validación 422
          errorMsg = detail.map(e => `${e.loc?.slice(-1)}: ${e.msg}`).join(' | ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 px-4 bg-blue-900 min-h-[80vh] flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-green-500">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Registrada!</h2>
          <p className="text-gray-600 mb-8">Tu solicitud ha sido recibida. Nos pondremos en contacto contigo a la brevedad para confirmar los detalles finales.</p>
          <button onClick={() => setSuccess(false)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 bg-blue-900 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Programa tu Servicio</h1>
        <p className="text-gray-600 mb-8">Déjanos tus datos y te cotizaremos a la brevedad.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio de Interés</label>
            <select name="servicio_id" value={formData.servicio_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Recojo (Origen)</label>
              <input type="text" name="origen" value={formData.origen} onChange={handleChange} placeholder="Ej. Aeropuerto Jorge Chávez" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
              <input type="text" name="destino" value={formData.destino} onChange={handleChange} placeholder="Ej. Hotel Sheraton" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha_servicio" value={formData.fecha_servicio} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input type="time" name="hora_servicio" value={formData.hora_servicio} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pasajeros</label>
              <input type="number" min="1" name="cantidad_pasajeros" value={formData.cantidad_pasajeros} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales (Opcional)</label>
            <textarea name="notas" rows="3" value={formData.notas} onChange={handleChange} placeholder="Comentarios, requerimientos especiales..." className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"></textarea>
          </div>

          <button type="submit" disabled={loading} className={`w-full text-slate-900 font-bold py-4 rounded-lg shadow-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400'}`}>
            {loading ? 'Procesando...' : 'Solicitar Propuesta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reservas;
