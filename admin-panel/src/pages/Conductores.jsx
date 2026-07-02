import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import { adminService } from '../services/api';

const Conductores = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getConductores({ limit: pagination.limit, offset: (page - 1) * pagination.limit });
      setData(response.data.items);
      setPagination(prev => ({ ...prev, page, totalItems: response.data.count }));
    } catch (error) {
      console.error("Error loading conductores:", error);
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
      reset({ nombre: '', licencia: '', telefono: '', estado: 'DISPONIBLE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (formData) => {
    try {
      if (editingItem) {
        await adminService.updateConductor(editingItem.id, formData);
      } else {
        await adminService.createConductor(formData);
      }
      closeModal();
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving conductor:", error);
      toast.error("Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al conductor ${item.nombre}?`)) {
      try {
        await adminService.deleteConductor(item.id);
        toast.success("Conductor eliminado exitosamente.");
        loadData(pagination.page);
      } catch (error) {
        console.error("Error deleting conductor:", error);
        toast.error("Ocurrió un error al eliminar.");
      }
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Licencia', accessor: 'licencia' },
    { header: 'Teléfono', accessor: 'telefono' },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' : 
          row.estado === 'EN_RUTA' ? 'bg-blue-100 text-blue-800' : 
          row.estado === 'NO_DISPONIBLE' ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {row.estado.replace('_', ' ')}
        </span>
      )
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Conductores</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>Añadir Conductor</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando datos...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={data}
          onEdit={openModal}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={loadData}
        />
      )}

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? 'Editar Conductor' : 'Nuevo Conductor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input 
              {...register('nombre', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N.° Licencia</label>
            <input 
              {...register('licencia', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.licencia && <p className="text-red-500 text-xs mt-1">{errors.licencia.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input 
              {...register('telefono')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select 
              {...register('estado')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="MANTENIMIENTO">No Disponible</option>
            </select>
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
    </div>
  );
};

export default Conductores;
