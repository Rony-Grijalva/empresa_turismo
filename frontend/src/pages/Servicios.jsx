import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Servicios = () => {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const servicios = [
    { title: 'Transporte Turístico', desc: 'Traslados cómodos a centros arqueológicos, museos y playas. Disfruta del viaje mientras nosotros manejamos.', detalleExtra: 'Contamos con guías bilingües opcionales y paradas programadas para que disfrutes al máximo de tu experiencia. Nuestras unidades garantizan un viaje silencioso y placentero, ideal para grupos familiares y excursiones escolares.', image: '/trans_turistico.jpg' },
    { title: 'Traslado de Personal', desc: 'Servicio diario y puntual para trabajadores de empresas e industrias. Optimizamos las rutas.', detalleExtra: 'Ofrecemos recojo puerta a puerta o en paraderos estratégicos. Nuestras unidades cuentan con seguro contra todo riesgo y conductores capacitados en manejo defensivo, asegurando que tu equipo llegue a tiempo y relajado a sus labores corporativas.', image: '/trans_personal.png' },
    { title: 'Traslados al Aeropuerto', desc: 'Recojo y traslado al aeropuerto Jorge Chávez. Vehículos amplios con espacio suficiente para equipaje.', detalleExtra: 'Servicio disponible 24/7. Monitoreamos el estado de tu vuelo en tiempo real para evitar retrasos. Nuestros choferes te esperarán con un cartel de identificación y te ayudarán con el equipaje directamente hacia tu hotel o domicilio.', image: '/transp_aer.jpg' },
  ];

  const handleCotizar = () => {
    setSelectedService(null);
    navigate('/contacto');
  };

  return (
    <div className="py-20 px-4 bg-gray-50 min-h-[80vh] relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center">Nuestros Servicios</h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicios.map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col">
              <div className="h-48 overflow-hidden flex-shrink-0">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 mb-6">{s.desc}</p>
                </div>
                <button onClick={() => setSelectedService(s)} className="text-blue-600 font-semibold hover:text-blue-800 text-left outline-none">Leer más →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors outline-none"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="h-64 overflow-hidden relative">
               <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <h2 className="absolute bottom-6 left-6 text-3xl font-extrabold text-white drop-shadow-lg">{selectedService.title}</h2>
            </div>
            <div className="p-8 overflow-y-auto">
              <p className="text-lg text-gray-800 mb-4 font-bold leading-relaxed">{selectedService.desc}</p>
              <p className="text-gray-600 mb-8 leading-relaxed text-justify">{selectedService.detalleExtra}</p>
              <button 
                onClick={handleCotizar}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg transform transition hover:-translate-y-1 outline-none"
              >
                Cotizar este servicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
