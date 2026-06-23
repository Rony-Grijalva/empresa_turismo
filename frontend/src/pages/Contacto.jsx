import React, { useState } from 'react';
import api from '../services/api';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('contacto/', {
        nombre: formData.nombre,
        email: formData.email,
        asunto: 'Mensaje desde el sitio web',
        mensaje: formData.mensaje
      });
      setStatus('success');
      setFormData({ nombre: '', email: '', mensaje: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center">Contáctanos</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        ¿Tienes dudas o necesitas un servicio personalizado? Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Información de contacto */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Información Directa</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">📍</div>
              <div>
                <h4 className="font-bold text-gray-900">Oficina Principal</h4>
                <p className="text-gray-600">Pj. Hipolito Unanue Km. 53.5 Otr. Carretera Central</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">📞</div>
              <div>
                <h4 className="font-bold text-gray-900">Central Telefónica</h4>
                <p className="text-gray-600">+51 915 333 035</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">✉️</div>
              <div>
                <h4 className="font-bold text-gray-900">Correo Electrónico</h4>
                <p className="text-gray-600"><a href="mailto:multiserviciosgrijalva22@gmail.com" className="hover:text-blue-600">multiserviciosgrijalva22@gmail.com</a></p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-200 h-64 rounded-xl flex items-center justify-center text-gray-500 font-bold">
            [ Placeholder Google Maps ]
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h2>
          
          {status === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              Hubo un error al enviar el mensaje. Por favor intenta nuevamente.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea rows="4" name="mensaje" value={formData.mensaje} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"></textarea>
            </div>
            <button type="submit" disabled={status === 'loading'} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50">
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
