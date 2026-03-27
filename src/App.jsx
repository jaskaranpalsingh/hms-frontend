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

/**
 * Route-level RBAC
 * ─────────────────────────────────────────────────────────────
 * Admin   → all routes
 * Doctor  → dashboard, patients (view+update), appointments,
 *            doctors, records, messages, settings
 * Patient → dashboard, doctors, records (own), messages, settings
 * Staff   → dashboard, appointments, patients, inventory, billing,
 *            messages, settings
 */
function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* ── Public Routes ───────────────────────────────── */}
        <Route path="/"        element={!user ? <Login />    : <Navigate to="/dashboard" replace />} />
        <Route path="/login"   element={!user ? <Login />    : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

        {/* ── Shared / All-Roles ──────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <Layout><Messages /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <Layout><Doctors /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Patients — Admin + Doctor + Staff ───────────── */}
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
            <Layout><Patients /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Appointments — Admin + Doctor + Staff ───────── */}
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'staff']}>
            <Layout><Appointments /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Medical Records — Admin + Doctor + Patient ──── */}
        <Route path="/records" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
            <Layout><MedicalRecords /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Billing — Admin + Staff ─────────────────────── */}
        <Route path="/billing" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout><Billing /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Inventory — Admin + Staff ───────────────────── */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Layout><Inventory /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Admin-Only Routes ────────────────────────────── */}
        <Route path="/doctors-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><DoctorsManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Staff /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/lab" element={
          <ProtectedRoute allowedRoles={['admin', 'doctor']}>
            <Layout><Placeholder title="Lab Reports" /></Layout>
          </ProtectedRoute>
        } />

        {/* ── Fallback ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
