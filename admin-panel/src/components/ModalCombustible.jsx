import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const ModalCombustible = ({ isOpen, onClose, onSubmit, vehiculos = [] }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  
  const cantidad_litros = watch('cantidad_litros');
  const precio_por_litro = watch('precio_por_litro');

  useEffect(() => {
    if (cantidad_litros && precio_por_litro) {
      const costo = (parseFloat(cantidad_litros) * parseFloat(precio_por_litro)).toFixed(2);
      setValue('costo_total', costo);
    } else {
      setValue('costo_total', '');
    }
  }, [cantidad_litros, precio_por_litro, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        vehiculo_id: vehiculos?.length > 0 ? vehiculos[0].id : '',
        fecha: new Date().toISOString().split('T')[0],
        odometro_actual: '',
        cantidad_litros: '',
        precio_por_litro: '',
        costo_total: '',
        tanque_lleno: false
      });
    }
  }, [isOpen, reset, vehiculos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Registrar Combustible</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehículo</label>
            <select 
              {...register('vehiculo_id', { required: 'Seleccione un vehículo' })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="">Seleccione un vehículo...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
              ))}
            </select>
            {errors.vehiculo_id && <span className="text-red-500 text-xs mt-1">{errors.vehiculo_id.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input 
              type="date"
              {...register('fecha', { required: 'La fecha es requerida' })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
            {errors.fecha && <span className="text-red-500 text-xs mt-1">{errors.fecha.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Odómetro Actual (km)</label>
            <input 
              type="number"
              {...register('odometro_actual', { required: 'Requerido', min: 0 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Ej: 120500"
            />
            {errors.odometro_actual && <span className="text-red-500 text-xs mt-1">{errors.odometro_actual.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad de Litros/Galones</label>
            <input 
              type="number"
              step="0.01"
              {...register('cantidad_litros', { required: 'Requerido', min: 0 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Ej: 45.5"
            />
            {errors.cantidad_litros && <span className="text-red-500 text-xs mt-1">{errors.cantidad_litros.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio por Litro/Galón (S/)</label>
            <input 
              type="number"
              step="0.01"
              {...register('precio_por_litro', { required: 'Requerido', min: 0 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Ej: 18.50"
            />
            {errors.precio_por_litro && <span className="text-red-500 text-xs mt-1">{errors.precio_por_litro.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Costo Total (S/) - Calculado</label>
            <input 
              type="number"
              step="0.01"
              {...register('costo_total')}
              readOnly
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-gray-50 text-gray-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center mt-4">
            <input 
              type="checkbox"
              id="tanque_lleno"
              {...register('tanque_lleno')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="tanque_lleno" className="ml-2 text-sm font-medium text-gray-900">
              ¿Se llenó el tanque completo?
            </label>
          </div>
          <p className="text-xs text-slate-500 ml-6">
            Marque esta opción para calcular el rendimiento L/100km respecto al último llenado.
          </p>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCombustible;
