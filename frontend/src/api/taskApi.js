import api from './axiosConfig';
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const completeTask = (id) => api.patch(`/tasks/${id}/complete`);
export const getAnalytics = () => api.get('/tasks/analytics');
