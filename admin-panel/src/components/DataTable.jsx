import React from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data, 
  onView,
  onEdit, 
  onDelete, 
  customActions,
  pagination,
  onPageChange
}) => {
  
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.limit) : 1;
  const currentPage = pagination ? pagination.page : 1;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 whitespace-nowrap">{col.header}</th>
              ))}
              {(onView || onEdit || onDelete || customActions) && (
                <th className="px-6 py-4 text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete || customActions) && (
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {customActions && customActions(row)}
                      
                      {onView && (
                        <button 
                          onClick={() => onView(row)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-md transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Mostrando página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            {' '}({pagination.totalItems} registros en total)
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
