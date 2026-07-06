import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import imgCoasterToyota from '../assets/foto_mg.png';
import imgCoasterHyundai from '../assets/foto2_mg.png';
import imgHilux from '../assets/foto3_mg.jpg';
import imgFlotaHome from '../assets/foto3_mg.jpg';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      image: imgCoasterToyota,
      alt: 'Toyota Coaster en paisaje nevado',
    },
    {
      id: 1,
      image: imgCoasterHyundai,
      alt: 'Hyundai County en carretera costera',
    },
    {
      id: 2,
      image: imgHilux,
      alt: 'Toyota Hilux en ciudad',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      {/* 2. HERO SECTION - CARRUSEL DINÁMICO */}
      <section id="inicio" className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        
        {/* Imágenes de fondo dinámicas */}
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
        
        <div className="relative z-10 flex flex-col justify-between items-center w-full h-full pt-8 pb-16 px-4">
          {/* Etiqueta en la parte superior */}
          <span className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md text-white text-sm md:text-base font-semibold tracking-wider border border-white/20 shadow-lg mt-8 sm:mt-4">
            TRANSPORTE SEGURO Y CONFIABLE
          </span>
          
          {/* Bloque inferior (Texto y Botones) */}
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* Tipografía Elegante y Formal */}
            <p 
              className="text-lg md:text-xl lg:text-2xl font-serif font-medium tracking-wide text-white drop-shadow-[0_8px_8px_rgba(0,0,0,1)] mb-8 text-center leading-relaxed"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Llevamos a tu equipo, empresa o familia a su destino con la máxima comodidad, puntualidad y seguridad en todo el Perú.
            </p>
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
              <Link to="/reservas" className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.125-.397-.179-.974-.439-1.98-1.342-1.292-1.161-2.164-2.434-2.42-2.776-.254-.342-.016-.528.113-.655.11-.11.238-.278.357-.417.119-.139.159-.238.238-.396.079-.158.04-.298-.02-.456-.06-.158-.535-1.291-.733-1.767-.193-.464-.389-.4-.535-.407-.138-.008-.298-.008-.456-.008-.158 0-.417.06-.635.298-.218.238-.833.813-.833 1.984 0 1.171.853 2.302.972 2.46.119.158 1.678 2.56 4.062 3.538 2.384.978 2.384.655 2.82.615.436-.04 1.408-.575 1.607-1.131.198-.555.198-1.031.139-1.131-.06-.099-.218-.158-.456-.278z"/></svg>
                Cotizar Servicio
              </Link>
              <Link to="/flota" className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 hover:-translate-y-1 flex items-center justify-center group">
                <span className="text-xl mr-2 group-hover:scale-110 transition-transform">🚍</span>
                Conocer Flota
              </Link>
            </div>
          </div>
        </div>

        {/* Indicadores de Diapositiva (Líneas/Puntos) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
          {slides.map((slide, index) => (
            <button 
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ease-out shadow-md ${
                index === currentSlide ? 'w-12 bg-orange-500' : 'w-4 bg-white/50 hover:bg-white/80 hover:w-6'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 3. GRID DE SERVICIOS (Resumen) */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-extrabold text-blue-950 mb-4">Nuestros Servicios</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img src="/trans_turistico.jpg" alt="Transporte Turístico" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transporte Turístico</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">Traslados cómodos a centros arqueológicos, museos y playas.</p>
                <Link to="/servicios" className="text-orange-500 font-bold hover:text-orange-600 flex items-center group-hover:translate-x-1 transition-transform">
                  Leer más →
                </Link>
              </div>
            </div>

            {/* Servicio 2 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img src="/trans_personal.png" alt="Transporte de Personal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transporte de Personal</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">Movilidad segura y puntual para los colaboradores de su empresa con rutas corporativas.</p>
                <Link to="/servicios" className="text-orange-500 font-bold hover:text-orange-600 flex items-center group-hover:translate-x-1 transition-transform">
                  Leer más →
                </Link>
              </div>
            </div>

            {/* Servicio 3 */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img src="/transp_aer.jpg" alt="Traslados al Aeropuerto" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Traslados al Aeropuerto</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">Servicio exclusivo, rápido y seguro para sus viajes de negocios o familiares.</p>
                <Link to="/servicios" className="text-orange-500 font-bold hover:text-orange-600 flex items-center group-hover:translate-x-1 transition-transform">
                  Leer más →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NUESTROS CLIENTES (Confianza) */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">Confían en Nosotros</span>
            <h2 className="text-3xl font-serif font-extrabold text-blue-950 mb-4">Nuestros Clientes</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Empresas e instituciones que respaldan la calidad, puntualidad y seguridad de nuestros servicios de transporte a nivel nacional.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-items-center">
            {/* Cliente 1 */}
            <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <img src="/cl_onpe.png" alt="ONPE" className="object-contain h-16 grayscale hover:grayscale-0 transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
            </div>
            {/* Cliente 2 */}
            <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <img src="/cl1.jpg" alt="Mochilea Perú" className="object-contain h-16 grayscale hover:grayscale-0 transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
            </div>
            {/* Cliente 3 */}
            <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <img src="/cl_tp.jpg" alt="Travel Perú" className="object-contain h-16 grayscale hover:grayscale-0 transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
            </div>
            {/* Cliente 4 */}
            <div className="w-full h-28 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <img src="/cl_mill.jpg" alt="Minera Millotingo" className="object-contain h-16 grayscale hover:grayscale-0 transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN NUESTRA FLOTA (Resumen) */}
      <section id="flota" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={imgFlotaHome} alt="Flota" className="w-full h-auto object-cover rounded-2xl shadow-2xl transition-transform hover:scale-[1.02]" />
            </div>
            <div className="w-full lg:w-1/2">
              <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">Garantía y Seguridad</span>
              <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-blue-950 mb-6">Nuestra Flota Moderna</h2>
              <p className="text-gray-600 mb-8 font-serif">
                Contamos con Toyota Coaster, Hyundai County, Toyota Hiace y Toyota Hilux, equipados para brindarte la mejor experiencia de viaje.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <div className="font-bold text-gray-900">📍 Monitoreo GPS 24/7</div>
                </li>
                <li className="flex items-start">
                  <div className="font-bold text-gray-900">❄️ Máximo Confort (A/C)</div>
                </li>
                <li className="flex items-start">
                  <div className="font-bold text-gray-900">🔧 Mantenimiento Preventivo</div>
                </li>
              </ul>
              <Link to="/flota" className="text-orange-500 font-bold hover:text-orange-600 flex items-center">
                Ver unidades al detalle →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
