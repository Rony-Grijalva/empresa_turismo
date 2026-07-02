import React from 'react';
import { X } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, data, fields, children, footerAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <dl className="space-y-4">
            {fields.map((field, idx) => (
              <div key={idx} className={`${field.fullWidth ? 'col-span-2' : ''}`}>
                <dt className="text-sm font-medium text-slate-500 mb-1">{field.label}</dt>
                <dd className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {field.render ? field.render(data) : (data[field.accessor] || <span className="text-slate-400 italic">No especificado</span>)}
                </dd>
              </div>
            ))}
          </dl>
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <div>
            {footerAction}
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
