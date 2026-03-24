import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import DoctorsManagement from './pages/DoctorsManagement';
import Staff from './pages/Staff';
import MedicalRecords from './pages/MedicalRecords';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Register from './pages/Register';
import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Dummy components for other remaining routes
const Placeholder = ({ title }) => (
  <div className="card h-96 flex items-center justify-center text-slate-400 font-medium border-dashed">
    {title} Module Coming Soon
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

        {/* Private Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><Layout><Doctors /></Layout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Layout><Appointments /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        
        {/* Module Specific / Admin Routes */}
        <Route path="/records" element={<ProtectedRoute><Layout><MedicalRecords /></Layout></ProtectedRoute>} />
        <Route path="/doctors-management" element={<ProtectedRoute allowedRoles={['admin']}><Layout><DoctorsManagement /></Layout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Staff /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute><Layout><Placeholder title="Lab Reports" /></Layout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
