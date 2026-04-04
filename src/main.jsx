import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
               borderRadius: '24px',
               background: '#ffffff',
               color: '#0f172a',
               border: '1px solid rgba(241, 245, 249, 0.8)',
               padding: '16px 28px',
               fontSize: '14px',
               fontWeight: '700',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
