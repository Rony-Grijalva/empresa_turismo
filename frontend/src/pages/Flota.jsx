import React from 'react';

const Flota = () => {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-blue-950 mb-12 text-center">Nuestra Flota Moderna</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Vehículo 1 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 bg-gray-200 animate-pulse relative">
             <img src="../assets/toyota-coaster.jpg" alt="Toyota Coaster" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500" onLoad={(e) => e.target.classList.remove('opacity-0')} />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toyota Coaster</h2>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>🚌 <strong>Capacidad:</strong> 30 pasajeros</li>
              <li>❄️ <strong>Climatización:</strong> Aire acondicionado centralizado</li>
              <li>💺 <strong>Asientos:</strong> Reclinables con cinturones de seguridad</li>
              <li>📍 <strong>Seguridad:</strong> GPS, Control de velocidad</li>
            </ul>
            <button className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-200 transition">Ver Detalles</button>
          </div>
        </div>

        {/* Vehículo 2 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 bg-gray-200 animate-pulse relative">
             <img src="../assets/hyundai-county.jpg" alt="Hyundai County" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500" onLoad={(e) => e.target.classList.remove('opacity-0')} />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hyundai County</h2>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>🚌 <strong>Capacidad:</strong> 29 pasajeros</li>
              <li>❄️ <strong>Climatización:</strong> Aire acondicionado potente</li>
              <li>💺 <strong>Asientos:</strong> Reclinables ergonómicos</li>
              <li>📻 <strong>Entretenimiento:</strong> Equipo de sonido / Micrófono</li>
            </ul>
            <button className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-200 transition">Ver Detalles</button>
          </div>
        </div>

        {/* Vehículo 3 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 bg-gray-200 animate-pulse relative">
             <img src="../assets/toyota-hiace.jpg" alt="Toyota Hiace" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500" onLoad={(e) => e.target.classList.remove('opacity-0')} />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toyota Hiace</h2>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>🚌 <strong>Capacidad:</strong> 15 pasajeros</li>
              <li>❄️ <strong>Climatización:</strong> Aire acondicionado doble zona</li>
              <li>💺 <strong>Asientos:</strong> Confortables y amplios</li>
              <li>📍 <strong>Seguridad:</strong> GPS, Frenos ABS</li>
            </ul>
            <button className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-200 transition">Ver Detalles</button>
          </div>
        </div>

        {/* Vehículo 4 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 bg-gray-200 animate-pulse relative">
             <img src="../assets/toyota-hilux.jpg" alt="Toyota Hilux" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500" onLoad={(e) => e.target.classList.remove('opacity-0')} />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toyota Hilux (4x4)</h2>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>👥 <strong>Capacidad:</strong> 4 pasajeros</li>
              <li>⛰️ <strong>Tracción:</strong> 4x4 ideal para terrenos difíciles</li>
              <li>❄️ <strong>Climatización:</strong> Aire acondicionado</li>
              <li>🛡️ <strong>Seguridad:</strong> Equipamiento minero / antivuelco</li>
            </ul>
            <button className="w-full bg-blue-100 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-200 transition">Ver Detalles</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flota;
