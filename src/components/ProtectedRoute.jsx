import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Inline Unauthorized Screen ──────────────────────────── */
const UnauthorizedScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top left, #f8fafc, #eff6ff, #f8fafc)',
    fontFamily: '"Inter", system-ui, sans-serif',
    padding: '2rem',
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '2.5rem',
      padding: '4rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(255,255,255,1) inset',
      textAlign: 'center',
      maxWidth: '480px',
      border: '1px solid rgba(226, 232, 240, 0.5)',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
        borderRadius: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem',
        transform: 'rotate(-5deg)',
        boxShadow: '0 10px 20px rgba(225, 29, 72, 0.1)',
      }}>
        <ShieldOff size={36} color="#e11d48" />
      </div>
      
      <h1 style={{ 
        fontSize: '1.875rem', 
        fontWeight: 900, 
        color: '#0f172a', 
        marginBottom: '1rem',
        letterSpacing: '-0.025em',
        textTransform: 'uppercase'
      }}>
        Security Alert
      </h1>
      
      <p style={{ 
        color: '#64748b', 
        fontSize: '1rem', 
        lineHeight: 1.6,
        marginBottom: '2.5rem',
        fontWeight: 500
      }}>
        Access to this clinical terminal is restricted. You do not have the necessary clearance level to view this resource.
      </p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
          }}
          onMouseOver={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.2)';
            e.target.style.background = '#1e293b';
          }}
          onMouseOut={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.2)';
            e.target.style.background = '#0f172a';
          }}
        >
          Return to Previous
        </button>
        
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'transparent',
            color: '#64748b',
            border: '2px solid #f1f5f9',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
          onMouseOver={e => {
            e.target.style.background = '#f8fafc';
            e.target.style.color = '#0f172a';
            e.target.style.borderColor = '#e2e8f0';
          }}
          onMouseOut={e => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#64748b';
            e.target.style.borderColor = '#f1f5f9';
          }}
        >
          Hospital Dashboard
        </button>
      </div>
    </div>
    
    <div style={{ 
      marginTop: '2rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      opacity: 0.5
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.2rem', textTransform: 'uppercase' }}>
        Secure Gateway v4.2
      </span>
    </div>
  </div>
);

/* ─── Protected Route ──────────────────────────────────────── */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e0e7ff',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedScreen />;
  }

  return children;
};

export default ProtectedRoute;
