import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, UserCircle, Bell, Shield, Sliders, HardDrive, Save, Download } from 'lucide-react';

const Configuracion = () => {
  // Estados para simular datos (luego se conectarán al backend)
  const [perfil, setPerfil] = useState({
    nombreComercial: 'Multiservicios Grijalva',
    ruc: '20123456789',
    telefono: '999 999 999',
    email: 'contacto@grijalva.com'
  });

  const [notificacionesActivas, setNotificacionesActivas] = useState(true);

  const [seguridad, setSeguridad] = useState({
    actual: '',
    nueva: '',
    confirmacion: ''
  });

  const [ajustesReserva, setAjustesReserva] = useState({
    mensajePersonalizado: 'Gracias por tu reserva, pronto nos comunicaremos.',
    limitePasajeros: 20
  });

  const handlePerfilChange = (e) => setPerfil({ ...perfil, [e.target.name]: e.target.value });
  const handleSeguridadChange = (e) => setSeguridad({ ...seguridad, [e.target.name]: e.target.value });
  const handleAjustesChange = (e) => setAjustesReserva({ ...ajustesReserva, [e.target.name]: e.target.value });

  const handleGuardarPerfil = (e) => {
    e.preventDefault();
    toast.success('Perfil guardado exitosamente (simulado).');
  };

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    if (seguridad.nueva !== seguridad.confirmacion) {
      toast.error('Las nuevas contraseñas no coinciden.');
      return;
    }
    toast.success('Contraseña actualizada exitosamente (simulada).');
    setSeguridad({ actual: '', nueva: '', confirmacion: '' });
  };

  const handleGuardarAjustes = (e) => {
    e.preventDefault();
    toast.success('Ajustes de reserva guardados (simulado).');
  };

  const handleBackup = () => {
    toast.success('Generando archivo CSV con las reservas del mes actual...');
    // Aquí iría la lógica real de descarga
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-slate-500" />
          Configuración del Sistema
        </h1>
        <p className="text-slate-500 mt-1">Ajustes generales, seguridad y mantenimiento.</p>
      </div>

      <div className="space-y-8">
        
        {/* 1. PERFIL DE EMPRESA */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserCircle className="text-blue-500" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Perfil de Empresa</h2>
          </div>
          <form onSubmit={handleGuardarPerfil} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial</label>
                <input type="text" name="nombreComercial" value={perfil.nombreComercial} onChange={handlePerfilChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">RUC / Datos Fiscales</label>
                <input type="text" name="ruc" value={perfil.ruc} onChange={handlePerfilChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
                <input type="text" name="telefono" value={perfil.telefono} onChange={handlePerfilChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email de Soporte</label>
                <input type="email" name="email" value={perfil.email} onChange={handlePerfilChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                <Save size={16} /> Guardar Perfil
              </button>
            </div>
          </form>
        </section>

        {/* 2. NOTIFICACIONES */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Bell className="text-amber-500" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Notificaciones</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="font-medium text-slate-800">Alertas de nuevas reservas</p>
              <p className="text-sm text-slate-500">Recibir un correo electrónico cuando un cliente registre una solicitud en la web.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notificacionesActivas} onChange={() => setNotificacionesActivas(!notificacionesActivas)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </section>

        {/* 3. SEGURIDAD */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Shield className="text-green-500" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Seguridad</h2>
          </div>
          <form onSubmit={handleCambiarPassword} className="space-y-4 max-w-md">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Cambiar mi Contraseña</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
              <input type="password" name="actual" value={seguridad.actual} onChange={handleSeguridadChange} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
              <input type="password" name="nueva" value={seguridad.nueva} onChange={handleSeguridadChange} className="w-full px-3 py-2 border rounded-md" required minLength="6" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
              <input type="password" name="confirmacion" value={seguridad.confirmacion} onChange={handleSeguridadChange} className="w-full px-3 py-2 border rounded-md" required minLength="6" />
            </div>
            <div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </section>

        {/* 4. AJUSTES DE RESERVA (Propuesta) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sliders className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Ajustes de Reserva</h2>
          </div>
          <form onSubmit={handleGuardarAjustes} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Límite de pasajeros por defecto</label>
              <input type="number" name="limitePasajeros" value={ajustesReserva.limitePasajeros} onChange={handleAjustesChange} className="w-full md:w-1/3 px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje automático al confirmar reserva (WhatsApp/Email)</label>
              <textarea name="mensajePersonalizado" value={ajustesReserva.mensajePersonalizado} onChange={handleAjustesChange} className="w-full px-3 py-2 border rounded-md" rows="3" required></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                <Save size={16} /> Guardar Ajustes
              </button>
            </div>
          </form>
        </section>

        {/* 5. BACKUP (Propuesta) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <HardDrive className="text-slate-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Copia de Seguridad (Backup)</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
            <div>
              <p className="font-medium text-slate-800">Exportar Reservas</p>
              <p className="text-sm text-slate-500">Descarga un archivo CSV con todas las reservas registradas durante el mes actual.</p>
            </div>
            <button onClick={handleBackup} className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-900 transition whitespace-nowrap">
              <Download size={16} /> Exportar a CSV
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Configuracion;
