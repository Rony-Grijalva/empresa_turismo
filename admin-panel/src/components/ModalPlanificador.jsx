import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calculator } from 'lucide-react';

const ModalPlanificador = ({ isOpen, onClose, onSubmit, vehiculos = [] }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  
  const vehiculo_id = watch('vehiculo_id');
  const kilometraje_final = watch('kilometraje_final');
  const precio_galon = watch('precio_galon');

  useEffect(() => {
    if (isOpen) {
      reset({
        vehiculo_id: vehiculos?.length > 0 ? vehiculos[0].id : '',
        kilometraje_inicial: vehiculos?.length > 0 ? vehiculos[0].kilometraje_actual : 0,
        kilometraje_final: '',
        precio_galon: '',
        distancia: 0,
        litros_estimados: 0,
        costo_estimado: 0
      });
    }
  }, [isOpen, reset, vehiculos]);

  useEffect(() => {
    if (vehiculo_id) {
      const v = vehiculos.find(v => v.id === vehiculo_id);
      if (v) {
        setValue('kilometraje_inicial', v.kilometraje_actual);
      }
    }
  }, [vehiculo_id, vehiculos, setValue]);

  useEffect(() => {
    const v = vehiculos.find(v => v.id === vehiculo_id);
    const km_inicial = v ? v.kilometraje_actual : 0;
    const km_final = parseFloat(kilometraje_final);
    const precio = parseFloat(precio_galon);

    if (!isNaN(km_final) && km_final >= km_inicial) {
      const dist = km_final - km_inicial;
      setValue('distancia', dist);
      
      const rendimiento = v?.ultimo_rendimiento || 12; // fallback si no hay historico: 12 L/100km
      // Formula: Litros = Distancia * (Rendimiento / 100)
      const litros = dist * (rendimiento / 100);
      setValue('litros_estimados', litros.toFixed(2));
      
      if (!isNaN(precio) && precio > 0) {
        setValue('costo_estimado', (litros * precio).toFixed(2));
      } else {
        setValue('costo_estimado', 0);
      }
    } else {
      setValue('distancia', 0);
      setValue('litros_estimados', 0);
      setValue('costo_estimado', 0);
    }
  }, [vehiculo_id, kilometraje_final, precio_galon, vehiculos, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-blue-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Calculator size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Planificar Viaje</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehículo a Proyectar</label>
            <select 
              {...register('vehiculo_id', { required: 'Seleccione un vehículo' })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="">Seleccione un vehículo...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.marca} {v.modelo} {v.ultimo_rendimiento ? `(Rend. Historico: ${v.ultimo_rendimiento} L/100km)` : '(Sin Histórico)'}
                </option>
              ))}
            </select>
            {errors.vehiculo_id && <span className="text-red-500 text-xs mt-1">{errors.vehiculo_id.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Odómetro Inicial (km)</label>
              <input 
                type="number"
                {...register('kilometraje_inicial')}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-gray-50 text-gray-500 outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Odómetro Final Esperado (km)</label>
              <input 
                type="number"
                {...register('kilometraje_final', { required: 'Requerido' })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="Ej: 120650"
              />
              {errors.kilometraje_final && <span className="text-red-500 text-xs mt-1">{errors.kilometraje_final.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio Actual del Galón/Litro (S/)</label>
            <input 
              type="number"
              step="0.01"
              {...register('precio_galon', { required: 'Requerido', min: 0.1 })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Ej: 18.50"
            />
            {errors.precio_galon && <span className="text-red-500 text-xs mt-1">{errors.precio_galon.message}</span>}
          </div>

          <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Proyección en Tiempo Real</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Distancia a recorrer:</span>
                <span className="font-semibold text-slate-800"><input type="number" readOnly {...register('distancia')} className="bg-transparent text-right outline-none w-20" /> km</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Combustible estimado:</span>
                <span className="font-semibold text-blue-600"><input type="number" readOnly {...register('litros_estimados')} className="bg-transparent text-right outline-none w-20 text-blue-600" /> Litros</span>
              </div>
              <div className="flex justify-between items-center text-base pt-2 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-800">Costo Proyectado:</span>
                <span className="font-bold text-emerald-600">S/ <input type="number" readOnly {...register('costo_estimado')} className="bg-transparent text-right outline-none w-24 text-emerald-600" /></span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              Guardar Proyección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPlanificador;
