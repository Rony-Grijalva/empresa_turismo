import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Flota from './pages/Flota';
import Usuarios from './pages/Usuarios';
import Conductores from './pages/Conductores';
import Mensajes from './pages/Mensajes';
import Configuracion from './pages/Configuracion';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/*" element={
          <PrivateRoute>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/flota" element={<Flota />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/conductores" element={<Conductores />} />
              <Route path="/mensajes" element={<Mensajes />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
