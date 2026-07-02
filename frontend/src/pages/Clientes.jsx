import React from 'react';

const Clientes = () => {
  return (
    <div className="pt-8 pb-20 bg-gray-50 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16 pt-8">
          <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">Confían en Nosotros</span>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-blue-950 mb-6">Nuestros Clientes</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-8"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto font-serif leading-relaxed">
            A lo largo de nuestra trayectoria, empresas e instituciones de diversos sectores han respaldado la calidad, puntualidad y seguridad de nuestros servicios de transporte a nivel nacional. Nos enorgullece ser el socio logístico y de movilidad de las siguientes organizaciones.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mt-12">
          {/* Cliente 1 */}
          <div className="w-full h-32 md:h-40 bg-white rounded-2xl flex items-center justify-center p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group">
            <span className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-blue-900 transition-colors duration-300 font-serif tracking-wide">ONPE</span>
          </div>
          {/* Cliente 2 */}
          <div className="w-full h-32 md:h-40 bg-white rounded-2xl flex items-center justify-center p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group">
            <span className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-blue-900 transition-colors duration-300 font-serif tracking-wide text-center leading-tight">Mochilea<br/>Perú</span>
          </div>
          {/* Cliente 3 */}
          <div className="w-full h-32 md:h-40 bg-white rounded-2xl flex items-center justify-center p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group">
            <span className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-blue-900 transition-colors duration-300 font-serif tracking-wide text-center leading-tight">Travel<br/>Perú</span>
          </div>
          {/* Cliente 4 */}
          <div className="w-full h-32 md:h-40 bg-white rounded-2xl flex items-center justify-center p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group">
            <span className="text-2xl md:text-3xl font-bold text-gray-400 group-hover:text-blue-900 transition-colors duration-300 font-serif tracking-wide text-center leading-tight">Minera<br/>Millotingo</span>
          </div>
        </div>

        <div className="mt-20 text-center bg-blue-950 text-white rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold font-serif mb-4">¿Deseas unirte a nuestra red de clientes?</h3>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              Brindamos soluciones corporativas a medida. Contáctanos para solicitar una cotización especial para tu empresa.
            </p>
            <a href="/contacto" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:-translate-y-1">
              Contactar a un Asesor
            </a>
          </div>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-900 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-800 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
