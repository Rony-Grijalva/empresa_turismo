import React from 'react';

const Nosotros = () => {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">¿Quiénes Somos?</h1>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Historia</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Multiservicios Grijalva nació con la firme convicción de ofrecer un servicio de transporte diferenciado, 
            donde la seguridad y la puntualidad no sean opcionales, sino nuestro estándar. Con más de 10 años en el mercado peruano, 
            hemos trasladado a miles de pasajeros, desde turistas aventureros hasta personal corporativo exigente.
          </p>
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Misión</h3>
            <p className="text-gray-700">Brindar soluciones de transporte seguras, cómodas y eficientes, superando las expectativas de nuestros clientes en cada kilómetro recorrido.</p>
          </div>
        </div>
        <div className="bg-gray-200 h-96 rounded-2xl overflow-hidden shadow-lg">
          <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop" alt="Equipo Grijalva" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
