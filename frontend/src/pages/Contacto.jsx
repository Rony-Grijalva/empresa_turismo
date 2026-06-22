import React from 'react';

const Contacto = () => {
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
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea rows="4" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"></textarea>
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg shadow-lg transform transition hover:-translate-y-1">Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
