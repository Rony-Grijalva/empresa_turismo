import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Plus, AlertCircle, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import DetailModal from '../components/DetailModal';
import { adminService } from '../services/api';
import api from '../services/api';

const Reservas = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Lookups state
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  
  const [combustibleInfo, setCombustibleInfo] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  // Observar vehículo, fechas y estado
  const watchVehiculoId = watch('vehiculo_id');
  const watchInicio = watch('fecha_hora_inicio');
  const watchEstado = watch('estado_reserva');
  const watchFin = watch('fecha_hora_fin');

  const loadDynamicLookups = async (inicio = null, fin = null, reservaId = null) => {
    try {
      const params = {};
      if (inicio && fin) {
        params.inicio = inicio;
        params.fin = fin;
      }
      if (reservaId) {
        params.reserva_id = reservaId;
      }
      const [vehRes, condRes] = await Promise.all([
        adminService.getLookupsVehiculos(params),
        adminService.getLookupsConductores(params)
      ]);
      setVehiculos(vehRes.data);
      setConductores(condRes.data);
    } catch (err) {
      console.error("Error al cargar lookups dinámicos:", err);
    }
  };

  const loadLookups = async () => {
    try {
      const [cliRes, servRes] = await Promise.all([
        adminService.getLookupsClientes(),
        adminService.getLookupsServicios()
      ]);
      setClientes(cliRes.data);
      setServicios(servRes.data);
      await loadDynamicLookups();
    } catch (err) {
      console.error("Error al cargar lookups:", err);
    }
  };

  const loadData = async (page = 1, search = debouncedSearchTerm) => {
    setLoading(true);
    try {
      const params = { limit: pagination.limit, offset: (page - 1) * pagination.limit };
      if (search) params.search = search;
      
      const response = await adminService.getReservas(params);
      setData(response.data.items);
      setPagination(prev => ({ ...prev, page, totalItems: response.data.count }));
    } catch (error) {
      console.error("Error loading reservas:", error);
      setError('No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    loadData(1, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (watchInicio && watchFin) {
      loadDynamicLookups(watchInicio, watchFin, editingItem?.id);
    }
  }, [watchInicio, watchFin, editingItem]);

  useEffect(() => {
    // Cálculo estimado de combustible al editar/seleccionar vehículo
    const calcularCombustible = async () => {
      if (editingItem && watchVehiculoId && watchVehiculoId !== '') {
        try {
          const vehiculo = vehiculos.find(v => v.id === watchVehiculoId);
          // Asumimos 100km promedio si no hay distancia calculada y 10km/l, precio 15.00
          const res = await adminService.calcularCombustible({
            distancia_km: 150.0, // Mock de distancia de la ruta
            consumo_vehiculo_km_por_litro: 12.0, // Mock de rendimiento
            precio_combustible_por_litro: 18.50 // Precio actual (mock)
          });
          setCombustibleInfo(res.data.costo_estimado);
        } catch (err) {
          console.error("Error calculando combustible", err);
          setCombustibleInfo(null);
        }
      } else {
        setCombustibleInfo(null);
      }
    };
    calcularCombustible();
  }, [watchVehiculoId, vehiculos, editingItem]);

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      reset({
        ...item,
        cliente_nombre: item.cliente_nombre || '',
        cliente_correo: item.cliente_correo || '',
        cliente_telefono: item.cliente_telefono || '',
        vehiculo_id: item.vehiculo?.id || item.vehiculo_id || '',
        conductor_id: item.conductor?.id || item.conductor_id || ''
      });
      // Forzar carga de lookups con el ID actual para evitar exclusión circular
      if (item.fecha_hora_inicio && item.fecha_hora_fin) {
        loadDynamicLookups(item.fecha_hora_inicio, item.fecha_hora_fin, item.id);
      }
    } else {
      reset({
        cliente_nombre: '',
        cliente_correo: '',
        cliente_telefono: '',
        servicio_id: '',
        vehiculo_id: '',
        conductor_id: '',
        vehiculo_id: '',
        conductor_id: '',
        fecha_hora_inicio: '',
        fecha_hora_fin: '',
        cantidad_pasajeros: 1,
        origen: '',
        destino: '',
        tarifa_final: 0,
        estado_reserva: 'PENDIENTE',
        estado_pago: 'PENDIENTE',
        metodo_pago_registro: '',
        notas: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    if (item.fecha_hora_inicio && item.fecha_hora_fin) {
      loadDynamicLookups(item.fecha_hora_inicio, item.fecha_hora_fin);
    }
  };

  const handleQuickAction = async (nuevoEstado) => {
    try {
      let payload = { estado_reserva: nuevoEstado };
      
      if (nuevoEstado === 'COMPLETADA') {
        const kmStr = window.prompt("Ingrese el kilometraje final del vehículo:");
        if (kmStr === null) return; // Canceló
        const km = parseInt(kmStr, 10);
        if (isNaN(km) || km < 0) {
          toast.error("Kilometraje inválido.");
          return;
        }
        payload.kilometraje_final = km;
      }
      
      toast.loading("Actualizando estado...", { id: "quick-action" });
      await adminService.updateReservaEstado(selectedItem.id, payload);
      toast.success("Estado actualizado correctamente.", { id: "quick-action" });
      setIsDetailOpen(false);
      loadData(pagination.page);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado.", { id: "quick-action" });
    }
  };

  const generatePDF = () => {
    if (!selectedItem) return;
    
    try {
      toast.loading("Generando PDF...", { id: "pdf-toast" });
      const doc = new jsPDF();
      
      // Helper: fuerza cualquier valor a string seguro
      const S = (val, fallback = '') => String(val ?? fallback ?? '');

      // Membrete
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("MULTISERVICIOS GRIJALVA S.A.C.", 105, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.text("ORDEN DE SERVICIO", 105, 30, { align: "center" });
      
      // Datos de la Reserva
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(S(`Código de Reserva: ${S(selectedItem?.codigo_reserva, 'N/A')}`), 14, 45);
      doc.text(S(`Estado: ${S(selectedItem?.estado_reserva, 'N/A')}`), 14, 52);

      let startStr = 'No definida';
      let endStr = 'No definida';
      try {
        const startDate = new Date(selectedItem?.fecha_hora_inicio);
        const endDate = new Date(selectedItem?.fecha_hora_fin);
        if (!isNaN(startDate.getTime())) startStr = startDate.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
        if (!isNaN(endDate.getTime())) endStr = endDate.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
      } catch (_) { /* fechas inválidas, usamos fallback */ }
      doc.text(S(`Rango de Servicio: ${startStr} a ${endStr}`), 14, 59);
      
      // Datos del Cliente
      doc.setFont("helvetica", "bold");
      doc.text("Datos del Cliente:", 14, 72);
      doc.setFont("helvetica", "normal");
      doc.text(S(`Nombre: ${S(selectedItem?.cliente_nombre, 'No registrado')}`), 14, 79);
      doc.text(S(`Correo: ${S(selectedItem?.cliente_correo, 'No registrado')}`), 14, 86);
      doc.text(S(`Teléfono: ${S(selectedItem?.cliente_telefono, 'No registrado')}`), 14, 93);

      // Tabla de Detalles — cada celda forzada a String
      const vehiculoInfo = S(selectedItem?.vehiculo_nombre, 'Sin asignar');
      const conductorInfo = S(selectedItem?.conductor_nombre, 'Sin asignar');
      
      const tableData = [
        ['Origen', S(selectedItem?.origen, 'N/A')],
        ['Destino', S(selectedItem?.destino, 'N/A')],
        ['Pasajeros', S(selectedItem?.cantidad_pasajeros, '0')],
        ['Vehículo Asignado', vehiculoInfo],
        ['Conductor Asignado', conductorInfo],
        ['Tarifa Final', S(`S/ ${S(selectedItem?.tarifa_final, '0.00')}`)],
      ];

      autoTable(doc, {
        startY: 105,
        head: [['Concepto', 'Detalle']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });
      
      doc.save(S(`Orden_Servicio_${S(selectedItem?.codigo_reserva, 'SIN_CODIGO')}.pdf`));
      toast.success("PDF descargado con éxito", { id: "pdf-toast" });
    } catch (error) {
      console.error("Detalle del error PDF:", error);
      toast.error("Ocurrió un error al generar el PDF", { id: "pdf-toast" });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        vehiculo_id: formData.vehiculo_id || null,
        conductor_id: formData.conductor_id || null,
        metodo_pago_registro: formData.metodo_pago_registro || null,
        cantidad_pasajeros: parseInt(formData.cantidad_pasajeros, 10),
        kilometraje_final: formData.kilometraje_final ? parseInt(formData.kilometraje_final, 10) : null,
      };

      if (editingItem) {
        await adminService.updateReserva(editingItem.id, payload);
      } else {
        await adminService.createReserva(payload);
      }
      closeModal();
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving reserva:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          const msgs = detail.map(e => `${e.loc?.slice(-1)}: ${e.msg}`).join(' | ');
          toast.error(msgs);
        } else if (typeof detail === 'string') {
          toast.error(detail);
        } else {
          toast.error(JSON.stringify(detail));
        }
      } else {
        toast.error("Ocurrió un error al guardar la reserva.");
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar esta reserva permanentemente?`)) {
      try {
        await adminService.deleteReserva(item.id);
        loadData(pagination.page);
      } catch (err) {
        console.error("Error al eliminar:", err);
        if (err.response && err.response.status === 403) {
            toast.error('Acceso denegado: Solo los superusuarios pueden eliminar reservas.');
        } else {
            toast.error('Error al intentar eliminar la reserva.');
        }
      }
    }
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDIENTE': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'CONFIRMADA': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmada</span>;
      case 'EN_CURSO': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En Curso</span>;
      case 'COMPLETADA': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Completada</span>;
      case 'CANCELADA':
      case 'RECHAZADA': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelada</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const columns = [
    { header: 'Cód.', accessor: 'codigo_reserva' },
    { header: 'Cliente', accessor: 'cliente_nombre' },
    { header: 'Servicio', accessor: 'servicio_nombre' },
    { 
      header: 'Rango de Servicio', 
      render: (row) => (
        <div>
          <span>Inicio: {new Date(row.fecha_hora_inicio).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</span>
          <span className="text-xs text-slate-400 block">Fin: {new Date(row.fecha_hora_fin).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      )
    },
    { 
      header: 'Estado', 
      render: (row) => getStatusBadge(row.estado_reserva)
    },
    { header: 'Total', render: (row) => `S/ ${row.tarifa_final}` },
  ];

  const detailFields = [
    { label: 'Código', accessor: 'codigo_reserva' },
    { label: 'Cliente Nombre', accessor: 'cliente_nombre' },
    { label: 'Cliente Correo', accessor: 'cliente_correo' },
    { label: 'Cliente Teléfono', accessor: 'cliente_telefono' },
    { label: 'Servicio', accessor: 'servicio_nombre' },
    { label: 'Pasajeros', accessor: 'cantidad_pasajeros' },
    { label: 'Rango de Servicio', render: (r) => `${new Date(r.fecha_hora_inicio).toLocaleString()} - ${new Date(r.fecha_hora_fin).toLocaleString()}` },
    { label: 'Punto de Recojo', accessor: 'origen' },
    { label: 'Destino', accessor: 'destino' },
    { label: 'Tarifa Final', render: (r) => `S/ ${r.tarifa_final}` },
    { label: 'Estado Reserva', render: (r) => getStatusBadge(r.estado_reserva) },
    { label: 'Estado Pago', render: (r) => r.estado_pago },
    { label: 'Método Pago', accessor: 'metodo_pago_registro' },
    { label: 'Vehículo Asignado', render: (r) => r.vehiculo_nombre || 'No asignado' },
    { label: 'Conductor Asignado', render: (r) => r.conductor_nombre || 'No asignado' },
    { label: 'Notas', accessor: 'notas', fullWidth: true },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Reservas</h1>
          <p className="text-slate-500 mt-1">Administra el ciclo de vida de las reservas de la flota.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar reserva, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Añadir Reserva</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando reservas...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={data}
          onView={handleView}
          onEdit={openModal}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={loadData}
        />
      )}

      {selectedItem && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detalle de Reserva: ${selectedItem.codigo_reserva}`}
          data={selectedItem}
          fields={detailFields}
          footerAction={
            selectedItem.estado_reserva === 'CONFIRMADA' ? (
              <button 
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                <Download size={18} />
                <span>Descargar Orden (PDF)</span>
              </button>
            ) : null
          }
        >
          {(selectedItem.estado_reserva === 'CONFIRMADA' || selectedItem.estado_reserva === 'EN_CURSO') && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Gestión Rápida de Estado</h3>
              <div className="flex gap-3">
                {selectedItem.estado_reserva === 'CONFIRMADA' && (
                  <button
                    onClick={() => handleQuickAction('EN_CURSO')}
                    className="flex-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md font-medium text-sm transition-colors"
                  >
                    🟢 Iniciar Servicio
                  </button>
                )}
                {selectedItem.estado_reserva === 'EN_CURSO' && (
                  <button
                    onClick={() => handleQuickAction('COMPLETADA')}
                    className="flex-1 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md font-medium text-sm transition-colors"
                  >
                    🔵 Completar Servicio
                  </button>
                )}
                <button
                  onClick={() => handleQuickAction('CANCELADA')}
                  className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md font-medium text-sm transition-colors"
                >
                  🔴 Cancelar
                </button>
              </div>
            </div>
          )}
        </DetailModal>
      )}

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? `Editar Reserva: ${editingItem.codigo_reserva}` : 'Nueva Reserva'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Cliente</label>
              <input type="text" {...register('cliente_nombre', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
              {errors.cliente_nombre && <p className="text-red-500 text-xs mt-1">{errors.cliente_nombre.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo del Cliente</label>
              <input type="email" {...register('cliente_correo', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
              {errors.cliente_correo && <p className="text-red-500 text-xs mt-1">{errors.cliente_correo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="text" {...register('cliente_telefono')} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
              <select {...register('servicio_id', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md">
                <option value="">Seleccione...</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha/Hora Inicio</label>
              <input type="datetime-local" step="60" {...register('fecha_hora_inicio', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha/Hora Fin</label>
              <input type="datetime-local" step="60" {...register('fecha_hora_fin', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pasajeros</label>
              <input type="number" {...register('cantidad_pasajeros')} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Punto de Recojo</label>
              <input {...register('origen', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
              <input {...register('destino', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehículo Asignado</label>
              <select {...register('vehiculo_id')} className="w-full px-3 py-2 border rounded-md">
                <option value="">Ninguno</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
              {combustibleInfo && (
                <div className="mt-2 text-xs bg-orange-50 text-orange-800 p-2 rounded-md border border-orange-100 flex items-center justify-between">
                  <span>Cálculo Combustible Estimado:</span>
                  <span className="font-bold">S/ {combustibleInfo}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Conductor Asignado</label>
              <select {...register('conductor_id')} className="w-full px-3 py-2 border rounded-md">
                <option value="">Ninguno</option>
                {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select {...register('estado_reserva')} className="w-full px-3 py-2 border rounded-md">
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarifa Final (S/)</label>
              <input type="number" step="0.01" {...register('tarifa_final', { required: 'Requerido' })} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          
          {watchEstado === 'COMPLETADA' && (
            <div className="grid grid-cols-1 bg-blue-50 p-3 rounded-md border border-blue-200">
              <label className="block text-sm font-bold text-blue-800 mb-1">Kilometraje Final del Vehículo</label>
              <input 
                type="number" 
                {...register('kilometraje_final', { required: watchEstado === 'COMPLETADA' ? 'Requerido para finalizar ruta' : false })} 
                className="w-full px-3 py-2 border rounded-md border-blue-300 focus:ring-blue-500" 
                placeholder="Kilometraje exacto al finalizar"
              />
              {errors.kilometraje_final && <p className="text-red-500 text-xs mt-1">{errors.kilometraje_final.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado Pago</label>
              <select {...register('estado_pago')} className="w-full px-3 py-2 border rounded-md">
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
              <select {...register('metodo_pago_registro')} className="w-full px-3 py-2 border rounded-md">
                <option value="">No especificado</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea {...register('notas')} className="w-full px-3 py-2 border rounded-md" rows="3"></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
};

export default Reservas;
