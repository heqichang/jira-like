import api from './index';

export const authApi = {
  register: (data: { email: string; password: string; nickname: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    api.put('/users/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/users/password', data),
};

export const projectApi = {
  create: (data: { name: string; description?: string; icon?: string; color?: string }) =>
    api.post('/projects', data),
  getMyProjects: () => api.get('/projects'),
  getArchivedProjects: () => api.get('/projects/archived'),
  getProject: (id: string) => api.get(`/projects/${id}`),
  updateProject: (id: string, data: { name?: string; description?: string; icon?: string; color?: string }) =>
    api.put(`/projects/${id}`, data),
  archiveProject: (id: string) => api.put(`/projects/${id}/archive`),
  unarchiveProject: (id: string) => api.put(`/projects/${id}/unarchive`),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  addMember: (projectId: string, data: { userId: string; role?: string }) =>
    api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskApi = {
  create: (projectId: string, data: {
    title: string; description?: string; priority?: string;
    type?: string; assigneeId?: string; parentId?: string;
  }) => api.post(`/projects/${projectId}/tasks`, data),
  getTasks: (projectId: string, params?: Record<string, string>) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  getTask: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  updateTask: (projectId: string, taskId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
  batchUpdateOrder: (projectId: string, tasks: { id: string; status: string; order: number }[]) =>
    api.put(`/projects/${projectId}/tasks/batch/order`, { tasks }),
  createComment: (projectId: string, taskId: string, content: string) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content }),
  getComments: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}/comments`),
  deleteComment: (projectId: string, taskId: string, commentId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};
