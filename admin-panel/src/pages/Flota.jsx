import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Plus, Calculator } from 'lucide-react';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import DetailModal from '../components/DetailModal';
import ModalCombustible from '../components/ModalCombustible';
import ModalPlanificador from '../components/ModalPlanificador';
import { adminService } from '../services/api';

const Flota = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMantenimientoModalOpen, setIsMantenimientoModalOpen] = useState(false);
  const [isCombustibleModalOpen, setIsCombustibleModalOpen] = useState(false);
  const [isPlanificadorModalOpen, setIsPlanificadorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [mantenimientoItem, setMantenimientoItem] = useState(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerMant, handleSubmit: handleSubmitMant, reset: resetMant, formState: { errors: errorsMant } } = useForm();

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getVehiculos({ limit: pagination.limit, offset: (page - 1) * pagination.limit });
      setData(response.data.items);
      setPagination(prev => ({ ...prev, page, totalItems: response.data.count }));
    } catch (error) {
      console.error("Error loading vehiculos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      reset(item);
    } else {
      reset({ 
        placa: '', 
        modelo: '', 
        tipo_vehiculo: '', 
        capacidad: 1, 
        estado: 'DISPONIBLE',
        capacidad_carga: 0,
        kilometraje_actual: 0,
        kilometraje_base: 0,
        frecuencia_mantenimiento_km: 5000,
        detalles: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        capacidad: parseInt(formData.capacidad || 1, 10),
        capacidad_carga: parseFloat(formData.capacidad_carga || 0),
        kilometraje_actual: parseInt(formData.kilometraje_actual || 0, 10),
        frecuencia_mantenimiento_km: parseInt(formData.frecuencia_mantenimiento_km || 5000, 10),
      };

      // Asegurarse de cast a int el kilometraje_base
      // Si no hay kilometraje_base, asume el actual (la BD tmb lo hace)
      payload.kilometraje_base = (formData.kilometraje_base !== undefined && formData.kilometraje_base !== '' && !isNaN(formData.kilometraje_base))
        ? parseInt(formData.kilometraje_base, 10) 
        : parseInt(formData.kilometraje_actual || 0, 10);

      console.log("Payload a enviar:", payload);
      if (editingItem) {
        await adminService.updateVehiculo(editingItem.id, payload);
      } else {
        await adminService.createVehiculo(payload);
      }
      closeModal();
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving vehiculo:", error);
      toast.error("Ocurrió un error al guardar.");
    }
  };

  const openMantenimientoModal = (item) => {
    setMantenimientoItem(item);
    resetMant({
      vehiculo: item.id,
      kilometraje_realizado: item.kilometraje_actual,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      costo: ''
    });
    setIsMantenimientoModalOpen(true);
  };

  const onSubmitMantenimiento = async (formData) => {
    try {
      const payload = {
        ...formData,
        vehiculo_id: mantenimientoItem.id,
        kilometraje_realizado: Number(formData.kilometraje_realizado),
        costo: Number(formData.costo),
        fecha: new Date(formData.fecha).toISOString().split('T')[0]
      };
      // Eliminar el campo 'vehiculo' viejo si react-hook-form lo incluye
      delete payload.vehiculo;

      await adminService.createMantenimiento(payload);
      setIsMantenimientoModalOpen(false);
      setMantenimientoItem(null);
      toast.success("Mantenimiento registrado correctamente.");
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving mantenimiento:", error.response?.data || error);
      toast.error("Ocurrió un error al registrar el mantenimiento.");
    }
  };

  const onSubmitCombustible = async (formData) => {
    try {
      const payload = {
        vehiculo_id: formData.vehiculo_id,
        odometro_actual: Number(formData.odometro_actual),
        cantidad_litros: Number(formData.cantidad_litros),
        costo_total: Number(formData.costo_total),
        tanque_lleno: formData.tanque_lleno,
        fecha: new Date(formData.fecha).toISOString().split('T')[0]
      };

      await adminService.createCombustible(payload);
      setIsCombustibleModalOpen(false);
      toast.success("Combustible registrado correctamente.");
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving combustible:", error.response?.data || error);
      toast.error("Ocurrió un error al registrar el combustible.");
    }
  };

  const onSubmitPlanificador = async (data) => {
    try {
      await adminService.createPlanificacion(data);
      setIsPlanificadorModalOpen(false);
      toast.success("Planificación de viaje guardada correctamente.");
    } catch (error) {
      console.error("Error saving planificacion:", error.response?.data || error);
      toast.error("Ocurrió un error al guardar la planificación.");
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`¿Estás seguro de eliminar el vehículo con placa ${item.placa}?`)) {
      try {
        await adminService.deleteVehiculo(item.id);
        loadData(pagination.page);
      } catch (error) {
        console.error("Error deleting vehiculo:", error);
        toast.error("Ocurrió un error al eliminar.");
      }
    }
  };

  const columns = [
    { header: 'Tipo', accessor: 'tipo_vehiculo' },
    { header: 'Placa', accessor: 'placa' },
    { header: 'Odómetro (Total)', render: (row) => `${row.kilometraje_actual || 0} km` },
    { header: 'Kilometraje de Ingreso / Base', render: (row) => `${row.kilometraje_base || 0} km` },
    { 
      header: 'Kilómetros Recorridos', 
      render: (row) => {
        const km_actual = row.kilometraje_actual || 0;
        const km_base = row.kilometraje_base || 0;
        const freq = row.frecuencia_mantenimiento_km || 5000;
        const kms_recorridos = Math.max(0, km_actual - km_base);
        
        return `${kms_recorridos} km / ${freq} km`;
      }
    },
    { 
      header: 'Estado / Mantenimiento', 
      render: (row) => {
        const km_actual = row.kilometraje_actual || 0;
        const km_base = row.kilometraje_base || 0;
        const freq = row.frecuencia_mantenimiento_km || 5000;
        const kms_recorridos = Math.max(0, km_actual - km_base);
        
        let mantStatus = 'text-green-600';
        let mantLabel = 'Al Día';
        let mantIcon = '✓';
        
        if (kms_recorridos >= freq) {
          mantStatus = 'bg-red-100 text-red-800';
          mantLabel = 'Vencido';
          mantIcon = '⚠️';
        } else if (kms_recorridos >= freq * 0.9) {
          mantStatus = 'bg-yellow-100 text-yellow-800';
          mantLabel = 'Próximo';
          mantIcon = '⚠️';
        } else {
          mantStatus = 'bg-green-100 text-green-800';
        }

        const rawEstado = row.estado || 'DESCONOCIDO';
        const estadoFisico = rawEstado.toUpperCase().replace('_', ' ');

        let estadoFisicoClase = 'bg-gray-100 text-gray-800'; // Fallback genérico
        if (rawEstado === 'DISPONIBLE') estadoFisicoClase = 'bg-green-100 text-green-800';
        else if (rawEstado === 'EN_RUTA') estadoFisicoClase = 'bg-blue-100 text-blue-800';
        else if (rawEstado === 'NO_DISPONIBLE') estadoFisicoClase = 'bg-red-100 text-red-800';
        else if (rawEstado === 'EN_MANTENIMIENTO') estadoFisicoClase = 'bg-orange-100 text-orange-800';

        return (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <span className={`px-2 py-1 rounded text-xs font-semibold min-w-[100px] text-center ${estadoFisicoClase}`}>
              {estadoFisico}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold min-w-[100px] text-center flex items-center justify-center gap-1 ${mantStatus}`} title={`Faltan ${freq - kms_recorridos > 0 ? freq - kms_recorridos : 0} km`}>
              {mantIcon} {mantLabel}
            </span>
          </div>
        );
      }
    },
  ];

  const customActions = (row) => (
    <button
      onClick={() => openMantenimientoModal(row)}
      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors whitespace-nowrap text-xs font-medium border border-orange-200"
      title="Registrar Mantenimiento"
    >
      + Mantenimiento
    </button>
  );

  const detailFields = [
    { label: 'Placa', accessor: 'placa' },
    { label: 'Tipo', accessor: 'tipo_vehiculo' },
    { label: 'Marca/Modelo', accessor: 'modelo' },
    { label: 'Año', accessor: 'anio' },
    { label: 'Capacidad Pasajeros', accessor: 'capacidad' },
    { label: 'Capacidad de Carga', render: (row) => `${row.capacidad_carga} kg` },
    { label: 'Kilometraje Actual', render: (row) => `${row.kilometraje_actual} km` },
    { label: 'Kilometraje Base', render: (row) => `${row.kilometraje_base} km` },
    { label: 'Detalles', accessor: 'detalles', fullWidth: true },
  ];

  const handleView = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Flota</h1>
          <p className="text-slate-500 mt-1">Administra los vehículos y su disponibilidad.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPlanificadorModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Calculator size={20} />
            <span>Planificar Viaje</span>
          </button>
          <button 
            onClick={() => setIsCombustibleModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Registrar Combustible</span>
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Añadir Vehículo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando datos...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={data}
          onView={handleView}
          onEdit={openModal}
          onDelete={handleDelete}
          customActions={customActions}
          pagination={pagination}
          onPageChange={loadData}
        />
      )}

      <DetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Vehículo"
        data={viewingItem || {}}
        fields={detailFields}
      >
        <div className="mt-4">
          <h3 className="text-md font-semibold text-slate-800 mb-2">Agenda / Ocupación</h3>
          {viewingItem?.reservas_activas?.length > 0 ? (
            <ul className="space-y-2">
              {viewingItem.reservas_activas.map((r, idx) => (
                <li key={idx} className="bg-blue-50 text-blue-800 p-2 rounded text-sm border border-blue-100">
                  Ocupado desde <strong>{new Date(r.inicio).toLocaleString()}</strong> hasta <strong>{new Date(r.fin).toLocaleString()}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No hay reservas activas o futuras confirmadas.</p>
          )}
        </div>
      </DetailModal>

      <ModalCombustible
        isOpen={isCombustibleModalOpen}
        onClose={() => setIsCombustibleModalOpen(false)}
        onSubmit={onSubmitCombustible}
        vehiculos={data}
      />

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
              <input 
                {...register('placa', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.placa && <p className="text-red-500 text-xs mt-1">{errors.placa.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vehículo</label>
              <input 
                {...register('tipo_vehiculo', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Minivan, Cúster"
              />
              {errors.tipo_vehiculo && <p className="text-red-500 text-xs mt-1">{errors.tipo_vehiculo.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca / Modelo</label>
              <input 
                {...register('modelo', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
              <input 
                type="number"
                {...register('anio', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.anio && <p className="text-red-500 text-xs mt-1">{errors.anio.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad (Pasajeros)</label>
              <input 
                type="number"
                {...register('capacidad', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.capacidad && <p className="text-red-500 text-xs mt-1">{errors.capacidad.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select 
                {...register('estado')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="MANTENIMIENTO">En Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad Carga (kg)</label>
              <input 
                type="number"
                step="0.1"
                {...register('capacidad_carga')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingItem ? 'Kilometraje Actual' : 'Odómetro Inicial'}
              </label>
              <input 
                type="number"
                {...register('kilometraje_actual')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia Mant. (km)</label>
              <input 
                type="number"
                {...register('frecuencia_mantenimiento_km')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kilometraje Base
              </label>
              <input 
                type="number"
                {...register('kilometraje_base')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dejar vacío para usar actual"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detalles / Equipamiento</label>
            <textarea 
              {...register('detalles')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Ej. Aire acondicionado, asientos reclinables, GPS..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </ModalForm>

      <ModalForm 
        isOpen={isMantenimientoModalOpen} 
        onClose={() => setIsMantenimientoModalOpen(false)} 
        title="Registrar Mantenimiento"
      >
        <form onSubmit={handleSubmitMant(onSubmitMantenimiento)} className="space-y-4">
          <input type="hidden" {...registerMant('vehiculo')} />
          
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-4">
            <p className="text-sm text-orange-800">
              Registrando mantenimiento para el vehículo placa <strong>{mantenimientoItem?.placa}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kilometraje Realizado</label>
              <input 
                type="number"
                {...registerMant('kilometraje_realizado', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsMant.kilometraje_realizado && <p className="text-red-500 text-xs mt-1">{errorsMant.kilometraje_realizado.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input 
                type="date"
                {...registerMant('fecha', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errorsMant.fecha && <p className="text-red-500 text-xs mt-1">{errorsMant.fecha.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Costo Total (S/)</label>
            <input 
              type="number" step="0.01"
              {...registerMant('costo', { required: 'Requerido' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errorsMant.costo && <p className="text-red-500 text-xs mt-1">{errorsMant.costo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de Tareas</label>
            <textarea 
              {...registerMant('descripcion', { required: 'Requerido' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Cambio de aceite, revisión de frenos, etc."
            />
            {errorsMant.descripcion && <p className="text-red-500 text-xs mt-1">{errorsMant.descripcion.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsMantenimientoModalOpen(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Guardar Mantenimiento
            </button>
          </div>
        </form>
      </ModalForm>
      
      <ModalPlanificador 
        isOpen={isPlanificadorModalOpen}
        onClose={() => setIsPlanificadorModalOpen(false)}
        onSubmit={onSubmitPlanificador}
        vehiculos={data}
      />
    </div>
  );
};

export default Flota;
