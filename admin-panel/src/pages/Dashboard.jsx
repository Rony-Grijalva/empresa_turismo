import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Users, Bus, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats/');
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Cargando Dashboard...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-8 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard General</h1>
          <p className="text-slate-500 mt-1">Bienvenido al panel de control de Multiservicios Grijalva</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Reservas</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.reservas?.total || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg mb-4 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Reservas Pendientes</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.reservas?.pendientes || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4 flex items-center justify-center">
            <Bus size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Vehículos (Flota)</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.vehiculos || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Mensajes de Contacto</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.mensajes || 0}</p>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Área lista para integración de gráficos e indicadores clave...</p>
      </div>
    </div>
  );
};

export default Dashboard;
