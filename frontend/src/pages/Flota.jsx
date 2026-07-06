import React, { useState } from 'react';

const flotaData = [
  { 
    id: 1, 
    nombre: "Toyota Coaster", 
    imagen: "/toy_coaster.jpg", 
    capacidad: "30 Pasajeros",
    descripcion: "Ideal para transporte de personal y turismo corporativo. Cuenta con un diseño espacioso y confortable para viajes largos y cortos.",
    novedades: ["Asientos reclinables ergonómicos", "Aire acondicionado centralizado", "GPS y monitoreo 24/7", "Cinturones de seguridad de 3 puntos"]
  },
  { 
    id: 2, 
    nombre: "Hyundai County", 
    imagen: "/hyund_county.jpg", 
    capacidad: "29 Pasajeros",
    descripcion: "Minibús versátil y seguro, perfecto para traslados ejecutivos y viajes turísticos de mediana distancia con la mayor comodidad.",
    novedades: ["Aire acondicionado potente", "Asientos reclinables", "Equipo de sonido y micrófono", "Amplio espacio para equipaje"]
  },
  { 
    id: 3, 
    nombre: "Toyota Hiace", 
    imagen: "/toyota_hiace.jpg", 
    capacidad: "15 Pasajeros",
    descripcion: "Minivan de alto rendimiento para grupos pequeños, destacada por su seguridad y confort interior inigualable.",
    novedades: ["Aire acondicionado doble zona", "Asientos confortables y amplios", "Frenos ABS y seguridad activa", "Sistema GPS integrado"]
  },
  { 
    id: 4, 
    nombre: "Toyota Hilux (4x4)", 
    imagen: "/toyota_hilux.jpg", 
    capacidad: "4 Pasajeros",
    descripcion: "Camioneta pick-up todoterreno totalmente equipada para proyectos mineros y traslados a zonas de difícil acceso.",
    novedades: ["Tracción 4x4", "Equipamiento minero estándar", "Jaula antivuelco", "Aire acondicionado"]
  }
];

const Flota = () => {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  if (vehiculoSeleccionado) {
    return (
      <div className="py-20 px-4 max-w-7xl mx-auto min-h-[80vh] animate-fadeIn">
        <button 
          onClick={() => setVehiculoSeleccionado(null)}
          className="mb-8 inline-flex items-center text-blue-800 font-bold hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg shadow-sm"
        >
          <span className="mr-2 text-xl leading-none">←</span> Volver a la Galería
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-50 relative flex items-center justify-center overflow-hidden">
            <img 
              src={vehiculoSeleccionado.imagen} 
              alt={vehiculoSeleccionado.nombre} 
              className="w-full h-full min-h-[400px] object-cover hover:scale-105 transition-transform duration-500" 
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          </div>
          <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{vehiculoSeleccionado.nombre}</h2>
            <div className="inline-block bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full mb-6 w-max">
              👥 {vehiculoSeleccionado.capacidad}
            </div>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {vehiculoSeleccionado.descripcion}
            </p>

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Características Principales</h3>
            <ul className="space-y-4">
              {vehiculoSeleccionado.novedades.map((novedad, index) => (
                <li key={index} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{novedad}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto min-h-[80vh] animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-4 text-center">Nuestra Flota Moderna</h1>
      <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
        Contamos con unidades de reciente modelo, estrictos mantenimientos y comodidades premium para asegurar un viaje placentero y seguro.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {flotaData.map((vehiculo) => (
          <div 
            key={vehiculo.id}
            onClick={() => setVehiculoSeleccionado(vehiculo)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 group flex flex-col"
          >
            <div className="h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
               <img 
                 src={vehiculo.imagen} 
                 alt={vehiculo.nombre} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-0" 
                 onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
               />
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{vehiculo.nombre}</h2>
                <p className="text-gray-500 font-medium mb-4 flex items-center text-sm">
                  <span className="mr-2">🚌</span> {vehiculo.capacidad}
                </p>
              </div>
              <button className="w-full bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Flota;
