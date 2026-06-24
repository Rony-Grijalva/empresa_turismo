import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings, Users, Bus, Calendar } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-2xl sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider uppercase">Grijalva Admin</h1>
        <p className="text-xs text-slate-500 mt-1">Panel Administrativo</p>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          <li>
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/reservas" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Calendar size={20} />
              <span>Reservas</span>
            </Link>
          </li>
          <li>
            <Link to="/flota" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Bus size={20} />
              <span>Flota</span>
            </Link>
          </li>
          <li>
            <Link to="/usuarios" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Users size={20} />
              <span>Usuarios</span>
            </Link>
          </li>
          <li>
            <Link to="/configuracion" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Settings size={20} />
              <span>Configuración</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-900/50 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
