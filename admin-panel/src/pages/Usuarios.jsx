import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Plus, Info } from 'lucide-react';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import { adminService } from '../services/api';

const Usuarios = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getUsuarios({ limit: pagination.limit, offset: (page - 1) * pagination.limit });
      setData(response.data.items);
      setPagination(prev => ({ ...prev, page, totalItems: response.data.count }));
    } catch (error) {
      console.error("Error loading usuarios:", error);
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
      reset({
        ...item,
        // No mostramos la contraseña al editar
      });
    } else {
      reset({ username: '', email: '', nombre_completo: '', telefono: '', rol: 'CLIENTE', is_active: true });
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
        await adminService.updateUsuario(editingItem.id, formData);
      } else {
        await adminService.createUsuario(formData);
      }
      closeModal();
      loadData(pagination.page);
    } catch (error) {
      console.error("Error saving usuario:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${item.email}?`)) {
      try {
        await adminService.deleteUsuario(item.id);
        toast.success("Usuario eliminado correctamente.");
        loadData(pagination.page);
      } catch (error) {
        console.error("Error deleting usuario:", error);
        toast.error(error.response?.data?.message || "Ocurrió un error al eliminar.");
      }
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { header: 'Nombre', accessor: 'nombre_completo' },
    { 
      header: 'Rol', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
        }`}>
          {row.rol === 'ADMIN' ? 'Administrador' : 'Cliente'}
        </span>
      )
    },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Personal y Usuarios</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>Añadir Usuario</span>
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
        title={editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        {!editingItem && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm flex items-start gap-2">
            <Info size={18} className="mt-0.5 flex-shrink-0" />
            <p>
              <strong>Aviso importante:</strong> El usuario será creado con la contraseña por defecto: <br/>
              <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">Grijalva2026*</code><br/>
              Asegúrate de entregar esta clave al nuevo empleado.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                {...register('username', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email"
                {...register('email', { required: 'Requerido' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input 
              {...register('nombre_completo')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input 
                {...register('telefono')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
              <select 
                {...register('rol')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLIENTE">Cliente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_active"
              {...register('is_active')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Usuario Activo</label>
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

export default Usuarios;
