import axios from 'axios';

const API_URL = 'http://localhost:9090/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data), // Already handles FormData
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const patientService = {
  getPatients: (params) => api.get('/patients', { params }),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  addVitals: (id, data) => api.post(`/patients/${id}/vitals`, data),
};

export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  createDoctor: (data) => api.post('/doctors', data),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
};

export const appointmentService = {
  getAppointments: (params) => api.get('/appointments', { params }),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export const billingService = {
  getInvoices: (params) => api.get('/invoices', { params }), 
  createInvoice: (data) => api.post('/invoices', data),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
};

export const analyticsService = {
  getStats: () => api.get('/analytics/dashboard'),
};

export const staffService = {
  getStaff: () => api.get('/staff'),
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};

export const recordService = {
  getPatientRecords: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  getRecords: (params) => api.get('/medical-records', { params }),
  createRecord: (data) => api.post('/medical-records', data),
  getRecord: (id) => api.get(`/medical-records/${id}`),
  updateRecord: (id, data) => api.put(`/medical-records/${id}`, data),
};

export const inventoryService = {
  getInventory: (params) => api.get('/inventory', { params }),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateStock: (id, quantityInStock) => api.put(`/inventory/${id}/stock`, { quantityInStock }),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/inventory/${id}`),
};

export const messageService = {
  getMessages: () => api.get('/messages'),
  sendMessage: (data) => api.post('/messages', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  deleteConversation: (partnerId) => api.delete(`/messages/conversation/${partnerId}`),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markConversationAsRead: (partnerId) => api.put(`/messages/read/${partnerId}`),
};

export default api;
