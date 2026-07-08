import React, { useState } from 'react';
import api from '../services/api';

// Mapa de estados de la reserva a color y etiqueta legible (RF-08)
const ESTADOS = {
  PENDIENTE:  { label: 'Pendiente de confirmación', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  CONFIRMADA: { label: 'Confirmada',                color: 'bg-blue-100 text-blue-700 border-blue-300' },
  EN_CURSO:   { label: 'En curso',                  color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  COMPLETADA: { label: 'Completada',                color: 'bg-green-100 text-green-700 border-green-300' },
  RECHAZADA:  { label: 'Rechazada',                 color: 'bg-red-100 text-red-700 border-red-300' },
  CANCELADA:  { label: 'Cancelada',                 color: 'bg-gray-200 text-gray-600 border-gray-300' },
};

const Seguimiento = () => {
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReserva(null);
    try {
      const { data } = await api.get(`reservas/seguimiento/${encodeURIComponent(codigo.trim())}/`);
      setReserva(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No encontramos ninguna reserva con ese código. Verifica que esté bien escrito (formato MG-AAAA-NNNN).');
      } else {
        setError('Ocurrió un error al consultar. Intenta nuevamente en unos momentos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const estadoInfo = reserva ? (ESTADOS[reserva.estado_reserva] || { label: reserva.estado_reserva, color: 'bg-gray-100 text-gray-700 border-gray-300' }) : null;

  const fmtFecha = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return iso; }
  };

  return (
    <div className="py-20 px-4 bg-blue-900 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Seguimiento de Reserva</h1>
        <p className="text-gray-600 mb-8">Ingresa el código que recibiste al registrar tu servicio para consultar su estado.</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ej. MG-2026-0001"
            className="flex-1 border border-gray-300 rounded-lg p-3 tracking-widest font-semibold uppercase focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`text-slate-900 font-bold py-3 px-8 rounded-lg shadow-md transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400'}`}
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {reserva && (
          <div className="border border-gray-200 rounded-xl p-6 mt-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Código de reserva</p>
                <p className="text-2xl font-extrabold tracking-widest text-gray-900">{reserva.codigo_reserva}</p>
              </div>
              <span className={`px-4 py-2 rounded-full border text-sm font-bold ${estadoInfo.color}`}>
                {estadoInfo.label}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Cliente</dt>
                <dd className="font-semibold text-gray-900">{reserva.cliente_nombre || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Servicio</dt>
                <dd className="font-semibold text-gray-900">{reserva.servicio_nombre || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Origen</dt>
                <dd className="font-semibold text-gray-900">{reserva.origen || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Destino</dt>
                <dd className="font-semibold text-gray-900">{reserva.destino || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fecha y hora de inicio</dt>
                <dd className="font-semibold text-gray-900">{fmtFecha(reserva.fecha_hora_inicio)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Pasajeros</dt>
                <dd className="font-semibold text-gray-900">{reserva.cantidad_pasajeros ?? '—'}</dd>
              </div>
              {reserva.vehiculo_nombre && (
                <div>
                  <dt className="text-gray-500">Vehículo asignado</dt>
                  <dd className="font-semibold text-gray-900">{reserva.vehiculo_nombre}</dd>
                </div>
              )}
              {reserva.conductor_nombre && (
                <div>
                  <dt className="text-gray-500">Conductor asignado</dt>
                  <dd className="font-semibold text-gray-900">{reserva.conductor_nombre}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seguimiento;
