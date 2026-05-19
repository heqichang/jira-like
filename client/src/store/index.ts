import { create } from 'zustand';
import { authApi, projectApi, taskApi } from '../api/endpoints';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  color: string;
  isArchived: boolean;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'bug' | 'feature' | 'task';
  order: number;
  projectId: string;
  creatorId: string;
  assigneeId: string | null;
  parentId: string | null;
  assignee?: User | null;
  creator?: User;
  subtasks?: Task[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

interface AppStore {
  user: User | null;
  projects: Project[];
  archivedProjects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { nickname?: string; avatar?: string }) => Promise<void>;

  fetchProjects: () => Promise<void>;
  fetchArchivedProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; icon?: string; color?: string }) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: { name?: string; description?: string; icon?: string; color?: string }) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  unarchiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  fetchTasks: (projectId: string, params?: Record<string, string>) => Promise<void>;
  createTask: (projectId: string, data: Record<string, unknown>) => Promise<void>;
  fetchTask: (projectId: string, taskId: string) => Promise<void>;
  updateTask: (projectId: string, taskId: string, data: Record<string, unknown>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  batchUpdateOrder: (projectId: string, tasks: { id: string; status: string; order: number }[]) => Promise<void>;

  addComment: (projectId: string, taskId: string, content: string) => Promise<void>;
  deleteComment: (projectId: string, taskId: string, commentId: string) => Promise<void>;

  clearError: () => void;
  setCurrentTask: (task: Task | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  projects: [],
  archivedProjects: [],
  currentProject: null,
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, loading: false });
    } catch (err: unknown) {
      const msg = (err as { error?: string })?.error || '登录失败';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  register: async (email, password, nickname) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register({ email, password, nickname });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, loading: false });
    } catch (err: unknown) {
      const msg = (err as { error?: string })?.error || '注册失败';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, projects: [], currentProject: null, tasks: [], currentTask: null });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile();
      set({ user: res.data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null });
    }
  },

  updateProfile: async (data) => {
    const res = await authApi.updateProfile(data);
    set({ user: res.data });
  },

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const res = await projectApi.getMyProjects();
      set({ projects: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchArchivedProjects: async () => {
    set({ loading: true });
    try {
      const res = await projectApi.getArchivedProjects();
      set({ archivedProjects: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    const res = await projectApi.create(data);
    set((state) => ({ projects: [res.data, ...state.projects] }));
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const res = await projectApi.getProject(id);
      set({ currentProject: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateProject: async (id, data) => {
    const res = await projectApi.updateProject(id, data);
    set((state) => ({
      currentProject: res.data,
      projects: state.projects.map((p) => (p.id === id ? res.data : p)),
    }));
  },

  archiveProject: async (id) => {
    await projectApi.archiveProject(id);
    set((state) => {
      const project = state.projects.find((p) => p.id === id);
      return {
        projects: state.projects.filter((p) => p.id !== id),
        archivedProjects: project ? [project, ...state.archivedProjects] : state.archivedProjects,
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      };
    });
  },

  unarchiveProject: async (id) => {
    await projectApi.unarchiveProject(id);
    set((state) => {
      const project = state.archivedProjects.find((p) => p.id === id);
      return {
        archivedProjects: state.archivedProjects.filter((p) => p.id !== id),
        projects: project ? [project, ...state.projects] : state.projects,
      };
    });
  },

  deleteProject: async (id) => {
    await projectApi.deleteProject(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      archivedProjects: state.archivedProjects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  fetchTasks: async (projectId, params) => {
    set({ loading: true });
    try {
      const res = await taskApi.getTasks(projectId, params);
      set({ tasks: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createTask: async (projectId, data) => {
    const res = await taskApi.create(projectId, data as Parameters<typeof taskApi.create>[1]);
    set((state) => ({ tasks: [...state.tasks, res.data] }));
  },

  fetchTask: async (projectId, taskId) => {
    set({ loading: true });
    try {
      const res = await taskApi.getTask(projectId, taskId);
      set({ currentTask: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateTask: async (projectId, taskId, data) => {
    const res = await taskApi.updateTask(projectId, taskId, data);
    const updated = res.data;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
      currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
    }));
  },

  deleteTask: async (projectId, taskId) => {
    await taskApi.deleteTask(projectId, taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    }));
  },

  batchUpdateOrder: async (projectId, tasks) => {
    await taskApi.batchUpdateOrder(projectId, tasks);
  },

  addComment: async (projectId, taskId, content) => {
    const res = await taskApi.createComment(projectId, taskId, content);
    set((state) => {
      if (!state.currentTask || state.currentTask.id !== taskId) return state;
      return {
        currentTask: {
          ...state.currentTask,
          comments: [...(state.currentTask.comments || []), res.data],
        },
      };
    });
  },

  deleteComment: async (projectId, taskId, commentId) => {
    await taskApi.deleteComment(projectId, taskId, commentId);
    set((state) => {
      if (!state.currentTask || state.currentTask.id !== taskId) return state;
      return {
        currentTask: {
          ...state.currentTask,
          comments: (state.currentTask.comments || []).filter((c) => c.id !== commentId),
        },
      };
    });
  },

  clearError: () => set({ error: null }),
  setCurrentTask: (task) => set({ currentTask: task }),
}));
