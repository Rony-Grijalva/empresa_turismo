import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Check, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import DetailModal from '../components/DetailModal';
import { adminService } from '../services/api';

const Mensajes = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getMensajes({ limit: pagination.limit, offset: (page - 1) * pagination.limit });
      setData(response.data.items);
      setPagination(prev => ({ ...prev, page, totalItems: response.data.count }));
    } catch (error) {
      console.error("Error loading mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (item) => {
    try {
      await adminService.marcarLeido(item.id, true);
      loadData(pagination.page);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      toast.error("Ocurrió un error.");
    }
  };

  const handleView = async (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    if (!item.leido) {
      try {
        await adminService.marcarLeido(item.id, true);
        setSelectedItem(prev => ({ ...prev, leido: true }));
        loadData(pagination.page);
      } catch (error) {
        console.error("Error auto-marking as read:", error);
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm("¿Seguro que deseas eliminar este mensaje?")) {
      try {
        await adminService.deleteMensaje(item.id);
        loadData(pagination.page);
      } catch (error) {
        console.error("Error al eliminar mensaje:", error);
        toast.error(error.response?.data?.message || "Ocurrió un error al eliminar.");
      }
    }
  };

  const columns = [
    { header: 'Fecha', render: (row) => new Date(row.fecha_creacion).toLocaleDateString() },
    { header: 'Remitente', render: (row) => <div><p className="font-medium">{row.nombre}</p><p className="text-xs text-slate-500">{row.email}</p></div> },
    { header: 'Asunto', accessor: 'asunto' },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.leido ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'
        }`}>
          {row.leido ? 'Leído' : 'Nuevo'}
        </span>
      )
    },
  ];

  const customActions = (row) => {
    if (row.leido) return null;
    return (
      <button 
        onClick={() => handleMarkAsRead(row)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Marcar como Leído"
      >
        <Check size={16} />
      </button>
    );
  };

  const detailFields = [
    { label: 'Remitente', accessor: 'nombre' },
    { label: 'Teléfono', accessor: 'telefono' },
    { label: 'Correo', accessor: 'email' },
    { label: 'Fecha', render: (d) => new Date(d.fecha_creacion).toLocaleString() },
    { label: 'Asunto', accessor: 'asunto', fullWidth: true },
    { label: 'Mensaje', accessor: 'mensaje', fullWidth: true },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Mail className="text-slate-500" />
          Bandeja de Mensajes
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando datos...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={data}
          onView={handleView}
          onDelete={handleDelete}
          customActions={customActions}
          pagination={pagination}
          onPageChange={loadData}
        />
      )}

      {selectedItem && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Detalle del Mensaje"
          data={selectedItem}
          fields={detailFields}
        />
      )}
    </div>
  );
};

export default Mensajes;
