import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import logoGrijalva from '../assets/logo_mg.png';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
      {/* HEADER */}
      <header className="w-full">
        {/* Topbar */}
        <div className="bg-blue-950 text-white text-sm py-2 px-4 sm:px-8 flex justify-between items-center hidden sm:flex">
          <div className="flex items-center space-x-4">
            <a href="mailto:multiserviciosgrijalva22@gmail.com" className="flex items-center hover:text-blue-200 transition">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
              multiserviciosgrijalva22@gmail.com
            </a>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              +51 915 333 035
            </span>
          </div>
        </div>

        {/* Navbar Sticky */}
        <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center py-3">
              <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
                <img src={logoGrijalva} alt="Logo Multiservicios Grijalva" className="w-48 sm:w-56 md:w-64 h-auto object-contain transition-transform hover:opacity-90" />
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-slate-900 hover:text-blue-700 font-semibold transition-colors">Inicio</Link>
                <Link to="/nosotros" className="text-slate-900 hover:text-blue-700 font-semibold transition-colors">Nosotros</Link>
                <Link to="/servicios" className="text-slate-900 hover:text-blue-700 font-semibold transition-colors">Servicios</Link>
                <Link to="/flota" className="text-slate-900 hover:text-blue-700 font-semibold transition-colors">Flota</Link>
                <Link to="/contacto" className="text-slate-900 hover:text-blue-700 font-semibold transition-colors">Contacto</Link>
                <Link to="/reservas" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2.5 rounded-lg font-bold shadow-lg transform transition hover:-translate-y-1">
                  Programa tu Servicio
                </Link>
              </div>
            </div>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logoGrijalva} alt="Logo" className="h-12 w-auto mb-4 opacity-80 grayscale" />
            <p className="text-sm">Soluciones integrales de transporte turístico y privado a nivel nacional, garantizando seguridad, puntualidad y confort.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/nosotros" className="hover:text-blue-400">Quiénes Somos</Link></li>
              <li><Link to="/servicios" className="hover:text-blue-400">Servicios</Link></li>
              <li><Link to="/flota" className="hover:text-blue-400">Nuestra Flota</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <p className="text-sm">📞 +51 915 333 035</p>
            <p className="text-sm">✉️ <a href="mailto:multiserviciosgrijalva22@gmail.com" className="hover:text-blue-400">multiserviciosgrijalva22@gmail.com</a></p>
            <p className="text-sm text-slate-400">📍 Pj. Hipolito Unanue Km. 53.5 Otr. Carretera Central</p>
          </div>
        </div>
        <div className="text-center text-sm border-t border-gray-800 mt-8 pt-8">
          © 2026 Multiservicios Grijalva. Todos los derechos reservados.
        </div>
      </footer>

      {/* WIDGET FLOTANTE WHATSAPP (GLOBAL) */}
      <a 
        href="https://wa.me/51915333035?text=Hola,%20vengo%20de%20la%20página%20web%20y%20deseo%20más%20información." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 group z-50 flex items-center"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute right-20 bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-100">
          ¿Necesitas un vehículo?
        </span>
        <div className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:shadow-[0_0_30px_rgba(37,211,102,0.8)] hover:scale-110 transition-all duration-300">
          <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      </a>
    </div>
  );
};

export default Layout;
