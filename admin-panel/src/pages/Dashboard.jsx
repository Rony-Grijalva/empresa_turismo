import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Calendar, DollarSign, Bus, Wrench, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getDashboardChart()
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Generando reporte...');
    try {
      const response = await adminService.exportReservasCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let filename = 'reservas_reporte.csv';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Reporte descargado con éxito', { id: toastId });
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Ocurrió un error al descargar el reporte.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard General</h1>
          <p className="text-slate-500 mt-1">Métricas y rendimiento operativo del mes actual</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Download size={20} />
          <span>{exporting ? 'Generando...' : 'Exportar Reservas del Mes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Reservas (Mes)</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.total_reservas || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg mb-4 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Ingresos Estimados</h3>
          <p className="text-3xl font-bold text-slate-900">S/ {stats?.ingresos_estimados?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4 flex items-center justify-center">
            <Bus size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Vehículos Activos</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.vehiculos_activos || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg mb-4 flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Mantenimientos Pendientes</h3>
          <p className="text-3xl font-bold text-slate-900">{stats?.mantenimientos_pendientes || 0}</p>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Tendencia de Reservas (Últimos 7 días)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <Line type="monotone" dataKey="reservas" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#334155' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
