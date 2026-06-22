import React from 'react';

const Servicios = () => {
  const servicios = [
    { title: 'Transporte Turístico', desc: 'Traslados cómodos a centros arqueológicos, museos y playas. Disfruta del viaje mientras nosotros manejamos.' },
    { title: 'Traslado de Personal', desc: 'Servicio diario y puntual para trabajadores de empresas e industrias. Optimizamos las rutas.' },
    { title: 'Traslados al Aeropuerto', desc: 'Recojo y traslado al aeropuerto Jorge Chávez. Vehículos amplios con espacio suficiente para equipaje.' },
  ];

  return (
    <div className="py-20 px-4 bg-gray-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center">Nuestros Servicios</h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicios.map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl mb-6 flex items-center justify-center text-blue-600 font-bold">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-600 mb-6">{s.desc}</p>
              <button className="text-blue-600 font-semibold hover:text-blue-800">Leer más →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Servicios;
