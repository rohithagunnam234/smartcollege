import axios from 'axios';

const API_BASE = 'https://smartcollege-8o8c.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
};

// Students
export const studentApi = {
  getAll: () => api.get('/student/all'),
  filter: (params: Record<string, string>) => api.get('/student/filter', { params }),
  add: (data: any) => api.post('/student/add', data),
  addBulk: (data: { students: any[] }) => api.post('/student/bulk', data),
  update: (id: string, data: any) => api.put(`/student/${id}`, data),
  updateProfile: (data: any) => api.put('/student/update-profile', data),
  updateStatus: (id: string, status: string) => api.put(`/student/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/student/${id}`),
};

// Faculty
export const facultyApi = {
  getAll: () => api.get('/faculty/all'),
  add: (data: any) => api.post('/faculty/add', data),
  update: (id: string, data: any) => api.put(`/faculty/${id}`, data),
  delete: (id: string) => api.delete(`/faculty/${id}`),
};

// Academic
export const academicApi = {
  getRecords: () => api.get('/academic/all'),
  update: (id: string, data: any) => api.put(`/academic/update/${id}`, data),
  getProfile: () => api.get('/academic/profile'),
};

// Placement
export const placementApi = {
  getRecords: () => api.get('/placement/all'),
  update: (id: string, data: any) => api.put(`/placement/update/${id}`, data),
  getProfile: () => api.get('/placement/profile'),
};

// Jobs
export const jobApi = {
  getJobs: () => api.get('/jobs'),
  createJob: (data: any) => api.post('/jobs', data),
  applyForJob: (jobId: string) => api.post(`/jobs/${jobId}/apply`),
  getApplications: (jobId?: string) => api.get('/jobs/applications', { params: { jobId } }),
  updateApplicationStatus: (id: string, data: { status: string }) => api.put(`/jobs/applications/${id}`, data),
  toggleJobStatus: (id: string) => api.put(`/jobs/${id}/toggle`),
};

// Fees
export const feeApi = {
  assign: (data: any) => api.post('/fee/assign', data),
  getAll: () => api.get('/fee/all'),
  getMy: (studentId?: string) => api.get(`/fee/my/${studentId || ''}`),
  update: (id: string, data: any) => api.put(`/fee/update/${id}`, data),
  delete: (id: string) => api.delete(`/fee/delete/${id}`),
};

// Documents
export const documentApi = {
  upload: (studentId: string, data: any) => api.post(`/documents/upload/${studentId}`, data),
  getMy: (studentId?: string) => api.get(`/documents/my/${studentId || ''}`),
  getAll: () => api.get('/documents/all'),
  updateStatus: (id: string, data: { status: string; reason?: string }) => api.put(`/documents/status/${id}`, data),
  delete: (id: string) => api.delete(`/documents/delete/${id}`),
  update: (id: string, data: any) => api.put(`/documents/edit/${id}`, data),
};

// Notices
export const noticeApi = {
  create: (data: any) => api.post('/notices/create', data),
  getMy: (studentId?: string) => api.get(`/notices/my/${studentId || ''}`),
  getAll: () => api.get('/notices/all'),
  delete: (id: string) => api.delete(`/notices/${id}`),
  update: (id: string, data: any) => api.put(`/notices/${id}`, data),
};

// Messages
export const messageApi = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (studentId: string) => api.get(`/messages/conversation/${studentId}`),
  send: (data: any) => api.post('/messages/send', data),
  reply: (data: any) => api.post('/messages/reply', data),
  markRead: (id: string) => api.put(`/messages/read/${id}`),
  edit: (id: string, data: any) => api.put(`/messages/${id}`, data),
  delete: (id: string) => api.delete(`/messages/${id}`),
};

export default api;
