import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, AlertCircle, Plus, Pencil } from 'lucide-react';
import ModalForm from '../components/ModalForm';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  
  // Lookups state
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);

  const fetchData = async () => {
    try {
      const [resRes, cliRes, servRes, vehRes, condRes] = await Promise.all([
        api.get('/admin/reservas/'),
        api.get('/admin/lookups/clientes'),
        api.get('/admin/lookups/servicios'),
        api.get('/admin/lookups/vehiculos'),
        api.get('/admin/lookups/conductores')
      ]);
      setReservas(resRes.data);
      setClientes(cliRes.data);
      setServicios(servRes.data);
      setVehiculos(vehRes.data);
      setConductores(condRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError('No se pudieron cargar las reservas o los datos asociados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta reserva permanentemente? Esta acción requiere permisos de Superusuario.")) {
      try {
        await api.delete(`/admin/reservas/${id}/`);
        setReservas(reservas.filter(res => res.id !== id));
      } catch (err) {
        console.error("Error al eliminar:", err);
        if (err.response && err.response.status === 403) {
            alert('Acceso denegado: Solo los superusuarios pueden eliminar reservas.');
        } else {
            alert('Error al intentar eliminar la reserva.');
        }
      }
    }
  };

  const handleOpenModal = (reserva = null) => {
    setEditingReserva(reserva);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReserva(null);
  };

  const handleFormSubmit = async (data) => {
    try {
      // Formatear payload (valores nulos o vacíos)
      const payload = {
        ...data,
        vehiculo_id: data.vehiculo_id || null,
        conductor_id: data.conductor_id || null,
        cantidad_pasajeros: parseInt(data.cantidad_pasajeros, 10),
      };

      if (editingReserva) {
        // Edit
        await api.put(`/admin/reservas/${editingReserva.id}/`, payload);
      } else {
        // Create
        await api.post('/admin/reservas/', payload);
      }
      
      // Recargar lista
      handleCloseModal();
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error("Error al guardar reserva:", err);
      alert('Error al guardar la reserva. Verifica los datos.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDIENTE': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'CONFIRMADA': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Confirmada</span>;
      case 'EN_CURSO': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">En Curso</span>;
      case 'COMPLETADA': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Completada</span>;
      case 'CANCELADA':
      case 'RECHAZADA': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Cancelada</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  // Definición de campos para el ModalForm
  const formFields = [
    { name: 'cliente_id', label: 'Cliente', type: 'select', required: true, options: clientes.map(c => ({ value: c.id, label: c.nombre })) },
    { name: 'servicio_id', label: 'Servicio', type: 'select', required: true, options: servicios.map(s => ({ value: s.id, label: s.nombre })) },
    { name: 'fecha_servicio', label: 'Fecha de Servicio', type: 'date', required: true },
    { name: 'hora_servicio', label: 'Hora', type: 'time', required: true },
    { name: 'cantidad_pasajeros', label: 'N° Pasajeros', type: 'number', required: true },
    { name: 'tarifa_final', label: 'Tarifa Final (S/)', type: 'number', step: "0.01", required: true },
    { name: 'origen', label: 'Punto de Recojo', type: 'text', required: true },
    { name: 'destino', label: 'Destino', type: 'text', required: true },
    { 
      name: 'estado_reserva', label: 'Estado', type: 'select', required: true, 
      options: [
        {value: 'PENDIENTE', label: 'Pendiente'},
        {value: 'CONFIRMADA', label: 'Confirmada'},
        {value: 'EN_CURSO', label: 'En Curso'},
        {value: 'COMPLETADA', label: 'Completada'},
        {value: 'CANCELADA', label: 'Cancelada'}
      ]
    },
    { 
      name: 'estado_pago', label: 'Estado de Pago', type: 'select', required: true,
      options: [{value: 'PENDIENTE', label: 'Pendiente'}, {value: 'PAGADO', label: 'Pagado'}]
    },
    { name: 'vehiculo_id', label: 'Vehículo Asignado', type: 'select', required: false, options: vehiculos.map(v => ({ value: v.id, label: v.nombre })) },
    { name: 'conductor_id', label: 'Conductor Asignado', type: 'select', required: false, options: conductores.map(c => ({ value: c.id, label: c.nombre })) },
    { name: 'notas', label: 'Notas Adicionales', type: 'textarea', required: false, fullWidth: true }
  ];

  if (loading) {
    return <div className="p-8 text-slate-500">Cargando reservas...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Reservas</h1>
          <p className="text-slate-500 mt-1">Administra el ciclo de vida de las reservas de la flota.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Añadir Reserva
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Cód.</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Servicio</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No hay reservas registradas en el sistema.
                  </td>
                </tr>
              ) : (
                reservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{reserva.codigo_reserva}</td>
                    <td className="p-4 text-slate-600">{reserva.cliente_nombre}</td>
                    <td className="p-4 text-slate-600">{reserva.servicio_nombre}</td>
                    <td className="p-4 text-slate-600">{reserva.fecha_servicio} <span className="text-xs text-slate-400 block">{reserva.hora_servicio}</span></td>
                    <td className="p-4">
                      {getStatusBadge(reserva.estado_reserva)}
                    </td>
                    <td className="p-4 font-medium text-slate-700">S/ {reserva.tarifa_final}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleOpenModal(reserva)}
                          className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
                          title="Editar Reserva"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(reserva.id)}
                          className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                          title="Eliminar (Solo Superusuario)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalForm 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingReserva ? `Editar Reserva: ${editingReserva.codigo_reserva}` : 'Nueva Reserva'}
        fields={formFields}
        onSubmit={handleFormSubmit}
        initialData={editingReserva}
      />
    </div>
  );
};

export default Reservas;
