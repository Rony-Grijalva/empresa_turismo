import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const ModalForm = ({ isOpen, onClose, title, fields, onSubmit, initialData = null }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset form when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        // Reset to empty values for new creation
        const defaultValues = {};
        fields.forEach(f => { defaultValues[f.name] = ''; });
        reset(defaultValues);
      }
    }
  }, [isOpen, initialData, reset, fields]);

  if (!isOpen) return null;

  const onSubmitForm = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="modal-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.name} className={`flex flex-col ${field.fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
                  <label className="mb-1 text-sm font-medium text-slate-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      {...register(field.name, { required: field.required })}
                      className="border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      {...register(field.name, { required: field.required })}
                      rows="3"
                      className="border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      step={field.step}
                      {...register(field.name, { required: field.required })}
                      className="border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  )}
                  {errors[field.name] && <span className="text-xs text-red-500 mt-1">Este campo es requerido</span>}
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="modal-form"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
