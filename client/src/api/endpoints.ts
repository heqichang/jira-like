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
    estimatedHours?: number; startDate?: string; dueDate?: string;
    sprintId?: string; epicId?: string; storyId?: string;
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
  updateDates: (projectId: string, taskId: string, data: { startDate?: string; dueDate?: string; estimatedHours?: number }) =>
    api.put(`/projects/${projectId}/tasks/${taskId}/dates`, data),
};

export const sprintApi = {
  create: (projectId: string, data: { name: string; goal?: string; startDate: string; endDate: string }) =>
    api.post(`/projects/${projectId}/sprints`, data),
  getSprints: (projectId: string) =>
    api.get(`/projects/${projectId}/sprints`),
  getSprint: (projectId: string, sprintId: string) =>
    api.get(`/projects/${projectId}/sprints/${sprintId}`),
  updateSprint: (projectId: string, sprintId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/sprints/${sprintId}`, data),
  deleteSprint: (projectId: string, sprintId: string) =>
    api.delete(`/projects/${projectId}/sprints/${sprintId}`),
  addTask: (projectId: string, sprintId: string, taskId: string) =>
    api.post(`/projects/${projectId}/sprints/${sprintId}/tasks`, { taskId }),
  removeTask: (projectId: string, sprintId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/sprints/${sprintId}/tasks/${taskId}`),
  addStory: (projectId: string, sprintId: string, storyId: string) =>
    api.post(`/projects/${projectId}/sprints/${sprintId}/stories`, { storyId }),
  removeStory: (projectId: string, sprintId: string, storyId: string) =>
    api.delete(`/projects/${projectId}/sprints/${sprintId}/stories/${storyId}`),
  recordBurndown: (projectId: string, sprintId: string) =>
    api.post(`/projects/${projectId}/sprints/${sprintId}/burndown`),
  getBurndown: (projectId: string, sprintId: string) =>
    api.get(`/projects/${projectId}/sprints/${sprintId}/burndown`),
  getVelocity: (projectId: string) =>
    api.get(`/projects/${projectId}/sprints/velocity`),
};

export const epicApi = {
  create: (projectId: string, data: { name: string; description?: string; color?: string; startDate?: string; endDate?: string }) =>
    api.post(`/projects/${projectId}/epics`, data),
  getEpics: (projectId: string) =>
    api.get(`/projects/${projectId}/epics`),
  getEpic: (projectId: string, epicId: string) =>
    api.get(`/projects/${projectId}/epics/${epicId}`),
  updateEpic: (projectId: string, epicId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/epics/${epicId}`, data),
  deleteEpic: (projectId: string, epicId: string) =>
    api.delete(`/projects/${projectId}/epics/${epicId}`),
  createStory: (projectId: string, data: {
    title: string; description?: string; storyPoints?: number;
    priority?: string; acceptanceCriteria?: string; assigneeId?: string; sprintId?: string; epicId?: string;
  }) => api.post(`/projects/${projectId}/stories`, data),
  getStories: (projectId: string, params?: Record<string, string>) =>
    api.get(`/projects/${projectId}/stories`, { params }),
  getStory: (projectId: string, storyId: string) =>
    api.get(`/projects/${projectId}/stories/${storyId}`),
  updateStory: (projectId: string, storyId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/stories/${storyId}`, data),
  deleteStory: (projectId: string, storyId: string) =>
    api.delete(`/projects/${projectId}/stories/${storyId}`),
  batchUpdateStoryOrder: (projectId: string, stories: { id: string; order: number }[]) =>
    api.put(`/projects/${projectId}/stories/batch/order`, { stories }),
};

export const timeLogApi = {
  create: (projectId: string, taskId: string, data: { hours: number; description?: string; logDate: string; isEstimate?: boolean }) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/timelogs`, data),
  getTaskTimeLogs: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}/timelogs`),
  updateTimeLog: (projectId: string, taskId: string, timeLogId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}/tasks/${taskId}/timelogs/${timeLogId}`, data),
  deleteTimeLog: (projectId: string, taskId: string, timeLogId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}/timelogs/${timeLogId}`),
  getProjectTimeLogs: (projectId: string, params?: { startDate?: string; endDate?: string; userId?: string }) =>
    api.get(`/projects/${projectId}/timelogs`, { params }),
  getMyTimeLogs: (params?: { startDate?: string; endDate?: string; projectId?: string }) =>
    api.get('/timelogs/me', { params }),
  getReports: (projectId: string, period: 'week' | 'month') =>
    api.get(`/projects/${projectId}/timelogs/reports`, { params: { period } }),
};

export const tagApi = {
  create: (projectId: string, data: { name: string; color?: string }) =>
    api.post(`/projects/${projectId}/tags`, data),
  getTags: (projectId: string) =>
    api.get(`/projects/${projectId}/tags`),
  updateTag: (projectId: string, tagId: string, data: { name?: string; color?: string }) =>
    api.put(`/projects/${projectId}/tags/${tagId}`, data),
  deleteTag: (projectId: string, tagId: string) =>
    api.delete(`/projects/${projectId}/tags/${tagId}`),
  addToTask: (projectId: string, taskId: string, tagId: string) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/tags`, { tagId }),
  removeFromTask: (projectId: string, taskId: string, tagId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}/tags/${tagId}`),
  getTaskTags: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}/tags`),
};

export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) =>
    api.get('/notifications', { params: unreadOnly ? { unreadOnly: 'true' } : undefined }),
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
  getNotificationSettings: () =>
    api.get('/notifications/settings'),
  updateNotificationSettings: (data: { emailNotificationsEnabled?: boolean; pushNotificationsEnabled?: boolean }) =>
    api.put('/notifications/settings', data),
};

export const ganttApi = {
  getGanttData: (projectId: string) =>
    api.get(`/projects/${projectId}/gantt`),
  createDependency: (projectId: string, taskId: string, data: { dependsOnTaskId: string; type?: string }) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/dependencies`, data),
  deleteDependency: (projectId: string, dependencyId: string) =>
    api.delete(`/projects/${projectId}/dependencies/${dependencyId}`),
  getTaskDependencies: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}/dependencies`),
};
