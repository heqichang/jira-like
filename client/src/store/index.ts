import { create } from 'zustand';
import { authApi, projectApi, taskApi, sprintApi, epicApi, timeLogApi, tagApi, notificationApi, ganttApi } from '../api/endpoints';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
}

interface UserSettings {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
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
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  isMilestone?: boolean;
  sprintId?: string | null;
  epicId?: string | null;
  storyId?: string | null;
  assignee?: User | null;
  creator?: User;
  subtasks?: Task[];
  comments?: Comment[];
  tags?: Tag[];
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

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'planned' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  velocity?: number;
  retrospective?: string;
  projectId: string;
  tasks?: Task[];
  stories?: Story[];
  burndownData?: SprintBurndown[];
  createdAt: string;
  updatedAt: string;
}

interface SprintBurndown {
  id: string;
  sprintId: string;
  date: string;
  remainingStoryPoints: number;
  remainingTasks: number;
  completedStoryPoints: number;
  completedTasks: number;
  idealRemaining: number;
}

interface Epic {
  id: string;
  name: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  color: string;
  startDate?: string;
  endDate?: string;
  totalStoryPoints?: number;
  totalStories?: number;
  completedStories?: number;
  completedStoryPoints?: number;
  progress?: number;
  projectId: string;
  creatorId: string;
  creator?: User;
  stories?: Story[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  acceptanceCriteria: string;
  order: number;
  projectId: string;
  epicId?: string | null;
  sprintId?: string | null;
  creatorId: string;
  assigneeId?: string | null;
  epic?: Epic | null;
  sprint?: Sprint | null;
  creator?: User;
  assignee?: User | null;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

interface TimeLog {
  id: string;
  hours: number;
  description: string;
  logDate: string;
  isEstimate: boolean;
  taskId: string;
  userId: string;
  task?: Task;
  user?: User;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  projectId: string;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  type: 'task_assigned' | 'task_status_changed' | 'comment_mention' | 'sprint_started' | 'sprint_completed';
  title: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  link: string;
  emailSent: boolean;
  userId: string;
  createdAt: string;
}

interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  dependsOnTask?: Task;
  task?: Task;
}

interface GanttData {
  tasks: Task[];
  dependencies: TaskDependency[];
  milestones: Task[];
  criticalPath: string[];
}

interface VelocityStats {
  sprints: {
    sprintId: string;
    sprintName: string;
    completedPoints: number;
    endDate: string;
  }[];
  averageVelocity: number;
}

interface AppStore {
  user: User | null;
  userSettings: UserSettings | null;
  projects: Project[];
  archivedProjects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  currentTask: Task | null;
  sprints: Sprint[];
  currentSprint: Sprint | null;
  epics: Epic[];
  currentEpic: Epic | null;
  stories: Story[];
  currentStory: Story | null;
  timeLogs: TimeLog[];
  tags: Tag[];
  notifications: Notification[];
  unreadNotificationCount: number;
  ganttData: GanttData | null;
  velocityStats: VelocityStats | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { nickname?: string; avatar?: string }) => Promise<void>;

  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (data: { emailNotificationsEnabled?: boolean; pushNotificationsEnabled?: boolean }) => Promise<void>;

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

  fetchSprints: (projectId: string) => Promise<void>;
  fetchSprint: (projectId: string, sprintId: string) => Promise<void>;
  createSprint: (projectId: string, data: { name: string; goal?: string; startDate: string; endDate: string }) => Promise<void>;
  updateSprint: (projectId: string, sprintId: string, data: Record<string, unknown>) => Promise<void>;
  deleteSprint: (projectId: string, sprintId: string) => Promise<void>;
  addTaskToSprint: (projectId: string, sprintId: string, taskId: string) => Promise<void>;
  removeTaskFromSprint: (projectId: string, sprintId: string, taskId: string) => Promise<void>;
  addStoryToSprint: (projectId: string, sprintId: string, storyId: string) => Promise<void>;
  removeStoryFromSprint: (projectId: string, sprintId: string, storyId: string) => Promise<void>;
  recordBurndown: (projectId: string, sprintId: string) => Promise<void>;
  fetchVelocity: (projectId: string) => Promise<void>;

  fetchEpics: (projectId: string) => Promise<void>;
  fetchEpic: (projectId: string, epicId: string) => Promise<void>;
  createEpic: (projectId: string, data: { name: string; description?: string; color?: string; startDate?: string; endDate?: string }) => Promise<void>;
  updateEpic: (projectId: string, epicId: string, data: Record<string, unknown>) => Promise<void>;
  deleteEpic: (projectId: string, epicId: string) => Promise<void>;

  fetchStories: (projectId: string, params?: Record<string, string>) => Promise<void>;
  fetchStory: (projectId: string, storyId: string) => Promise<void>;
  createStory: (projectId: string, epicId: string, data: Record<string, unknown>) => Promise<void>;
  updateStory: (projectId: string, storyId: string, data: Record<string, unknown>) => Promise<void>;
  deleteStory: (projectId: string, storyId: string) => Promise<void>;
  batchUpdateStoryOrder: (projectId: string, stories: { id: string; order: number }[]) => Promise<void>;

  fetchTaskTimeLogs: (projectId: string, taskId: string) => Promise<void>;
  createTimeLog: (projectId: string, taskId: string, data: { hours: number; description?: string; logDate: string; isEstimate?: boolean }) => Promise<void>;
  updateTimeLog: (projectId: string, taskId: string, timeLogId: string, data: Record<string, unknown>) => Promise<void>;
  deleteTimeLog: (projectId: string, taskId: string, timeLogId: string) => Promise<void>;
  fetchProjectTimeLogs: (projectId: string, params?: { startDate?: string; endDate?: string; userId?: string }) => Promise<void>;
  fetchMyTimeLogs: (params?: { startDate?: string; endDate?: string; projectId?: string }) => Promise<void>;

  fetchTags: (projectId: string) => Promise<void>;
  createTag: (projectId: string, data: { name: string; color?: string }) => Promise<void>;
  updateTag: (projectId: string, tagId: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (projectId: string, tagId: string) => Promise<void>;
  addTagToTask: (projectId: string, taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (projectId: string, taskId: string, tagId: string) => Promise<void>;
  fetchTaskTags: (projectId: string, taskId: string) => Promise<void>;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;

  fetchGanttData: (projectId: string) => Promise<void>;
  createDependency: (projectId: string, taskId: string, data: { dependsOnTaskId: string; type?: string }) => Promise<void>;
  deleteDependency: (projectId: string, dependencyId: string) => Promise<void>;

  clearError: () => void;
  setCurrentTask: (task: Task | null) => void;
  setCurrentSprint: (sprint: Sprint | null) => void;
  setCurrentEpic: (epic: Epic | null) => void;
  setCurrentStory: (story: Story | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  userSettings: null,
  projects: [],
  archivedProjects: [],
  currentProject: null,
  tasks: [],
  currentTask: null,
  sprints: [],
  currentSprint: null,
  epics: [],
  currentEpic: null,
  stories: [],
  currentStory: null,
  timeLogs: [],
  tags: [],
  notifications: [],
  unreadNotificationCount: 0,
  ganttData: null,
  velocityStats: null,
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
    set({
      user: null,
      userSettings: null,
      projects: [],
      currentProject: null,
      tasks: [],
      currentTask: null,
      sprints: [],
      currentSprint: null,
      epics: [],
      currentEpic: null,
      stories: [],
      currentStory: null,
      timeLogs: [],
      tags: [],
      notifications: [],
      unreadNotificationCount: 0,
      ganttData: null,
      velocityStats: null,
    });
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

  fetchNotificationSettings: async () => {
    try {
      const res = await notificationApi.getSettings();
      set({ userSettings: res.data });
    } catch {
      // Ignore
    }
  },

  updateNotificationSettings: async (data) => {
    const res = await notificationApi.updateSettings(data);
    set({ userSettings: res.data });
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

  fetchSprints: async (projectId) => {
    set({ loading: true });
    try {
      const res = await sprintApi.getSprints(projectId);
      set({ sprints: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchSprint: async (projectId, sprintId) => {
    set({ loading: true });
    try {
      const res = await sprintApi.getSprint(projectId, sprintId);
      set({ currentSprint: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createSprint: async (projectId, data) => {
    const res = await sprintApi.create(projectId, data);
    set((state) => ({ sprints: [...state.sprints, res.data] }));
  },

  updateSprint: async (projectId, sprintId, data) => {
    const res = await sprintApi.updateSprint(projectId, sprintId, data);
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? res.data : s)),
      currentSprint: state.currentSprint?.id === sprintId ? res.data : state.currentSprint,
    }));
  },

  deleteSprint: async (projectId, sprintId) => {
    await sprintApi.deleteSprint(projectId, sprintId);
    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== sprintId),
      currentSprint: state.currentSprint?.id === sprintId ? null : state.currentSprint,
    }));
  },

  addTaskToSprint: async (projectId, sprintId, taskId) => {
    await sprintApi.addTask(projectId, sprintId, taskId);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, sprintId } : t)),
    }));
  },

  removeTaskFromSprint: async (projectId, sprintId, taskId) => {
    await sprintApi.removeTask(projectId, sprintId, taskId);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, sprintId: null } : t)),
    }));
  },

  addStoryToSprint: async (projectId, sprintId, storyId) => {
    await sprintApi.addStory(projectId, sprintId, storyId);
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? { ...s, sprintId } : s)),
    }));
  },

  removeStoryFromSprint: async (projectId, sprintId, storyId) => {
    await sprintApi.removeStory(projectId, sprintId, storyId);
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? { ...s, sprintId: null } : s)),
    }));
  },

  recordBurndown: async (projectId, sprintId) => {
    await sprintApi.recordBurndown(projectId, sprintId);
  },

  fetchVelocity: async (projectId) => {
    try {
      const res = await sprintApi.getVelocity(projectId);
      set({ velocityStats: res.data });
    } catch {
      // Ignore
    }
  },

  fetchEpics: async (projectId) => {
    set({ loading: true });
    try {
      const res = await epicApi.getEpics(projectId);
      set({ epics: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchEpic: async (projectId, epicId) => {
    set({ loading: true });
    try {
      const res = await epicApi.getEpic(projectId, epicId);
      set({ currentEpic: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createEpic: async (projectId, data) => {
    const res = await epicApi.create(projectId, data);
    set((state) => ({ epics: [...state.epics, res.data] }));
  },

  updateEpic: async (projectId, epicId, data) => {
    const res = await epicApi.updateEpic(projectId, epicId, data);
    set((state) => ({
      epics: state.epics.map((e) => (e.id === epicId ? res.data : e)),
      currentEpic: state.currentEpic?.id === epicId ? res.data : state.currentEpic,
    }));
  },

  deleteEpic: async (projectId, epicId) => {
    await epicApi.deleteEpic(projectId, epicId);
    set((state) => ({
      epics: state.epics.filter((e) => e.id !== epicId),
      currentEpic: state.currentEpic?.id === epicId ? null : state.currentEpic,
    }));
  },

  fetchStories: async (projectId, params) => {
    set({ loading: true });
    try {
      const res = await epicApi.getStories(projectId, params);
      set({ stories: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchStory: async (projectId, storyId) => {
    set({ loading: true });
    try {
      const res = await epicApi.getStory(projectId, storyId);
      set({ currentStory: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createStory: async (projectId, epicId, data) => {
    const res = await epicApi.createStory(projectId, epicId, data as Parameters<typeof epicApi.createStory>[2]);
    set((state) => ({ stories: [...state.stories, res.data] }));
  },

  updateStory: async (projectId, storyId, data) => {
    const res = await epicApi.updateStory(projectId, storyId, data);
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? res.data : s)),
      currentStory: state.currentStory?.id === storyId ? res.data : state.currentStory,
    }));
  },

  deleteStory: async (projectId, storyId) => {
    await epicApi.deleteStory(projectId, storyId);
    set((state) => ({
      stories: state.stories.filter((s) => s.id !== storyId),
      currentStory: state.currentStory?.id === storyId ? null : state.currentStory,
    }));
  },

  batchUpdateStoryOrder: async (projectId, stories) => {
    await epicApi.batchUpdateStoryOrder(projectId, stories);
  },

  fetchTaskTimeLogs: async (projectId, taskId) => {
    try {
      const res = await timeLogApi.getTaskTimeLogs(projectId, taskId);
      set((state) => ({
        timeLogs: res.data.timeLogs,
      }));
    } catch {
      // Ignore
    }
  },

  createTimeLog: async (projectId, taskId, data) => {
    const res = await timeLogApi.create(projectId, taskId, data);
    set((state) => ({ timeLogs: [...state.timeLogs, res.data] }));
  },

  updateTimeLog: async (projectId, taskId, timeLogId, data) => {
    const res = await timeLogApi.updateTimeLog(projectId, taskId, timeLogId, data);
    set((state) => ({
      timeLogs: state.timeLogs.map((t) => (t.id === timeLogId ? res.data : t)),
    }));
  },

  deleteTimeLog: async (projectId, taskId, timeLogId) => {
    await timeLogApi.deleteTimeLog(projectId, taskId, timeLogId);
    set((state) => ({
      timeLogs: state.timeLogs.filter((t) => t.id !== timeLogId),
    }));
  },

  fetchProjectTimeLogs: async (projectId, params) => {
    try {
      const res = await timeLogApi.getProjectTimeLogs(projectId, params);
      set({ timeLogs: res.data.timeLogs });
    } catch {
      // Ignore
    }
  },

  fetchMyTimeLogs: async (params) => {
    try {
      const res = await timeLogApi.getMyTimeLogs(params);
      set({ timeLogs: res.data.timeLogs });
    } catch {
      // Ignore
    }
  },

  fetchTags: async (projectId) => {
    try {
      const res = await tagApi.getTags(projectId);
      set({ tags: res.data });
    } catch {
      // Ignore
    }
  },

  createTag: async (projectId, data) => {
    const res = await tagApi.create(projectId, data);
    set((state) => ({ tags: [...state.tags, res.data] }));
  },

  updateTag: async (projectId, tagId, data) => {
    const res = await tagApi.updateTag(projectId, tagId, data);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === tagId ? res.data : t)),
    }));
  },

  deleteTag: async (projectId, tagId) => {
    await tagApi.deleteTag(projectId, tagId);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== tagId),
    }));
  },

  addTagToTask: async (projectId, taskId, tagId) => {
    await tagApi.addToTask(projectId, taskId, tagId);
  },

  removeTagFromTask: async (projectId, taskId, tagId) => {
    await tagApi.removeFromTask(projectId, taskId, tagId);
  },

  fetchTaskTags: async (projectId, taskId) => {
    try {
      const res = await tagApi.getTaskTags(projectId, taskId);
      set((state) => {
        if (!state.currentTask || state.currentTask.id !== taskId) return state;
        return {
          currentTask: {
            ...state.currentTask,
            tags: res.data,
          },
        };
      });
    } catch {
      // Ignore
    }
  },

  fetchNotifications: async (unreadOnly) => {
    try {
      const res = await notificationApi.getNotifications(unreadOnly);
      set({
        notifications: res.data.notifications,
        unreadNotificationCount: res.data.unreadCount,
      });
    } catch {
      // Ignore
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      set({ unreadNotificationCount: res.data.unreadCount });
    } catch {
      // Ignore
    }
  },

  markNotificationRead: async (notificationId) => {
    await notificationApi.markAsRead(notificationId);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ),
      unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
    }));
  },

  markAllNotificationsRead: async () => {
    await notificationApi.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      unreadNotificationCount: 0,
    }));
  },

  deleteNotification: async (notificationId) => {
    await notificationApi.deleteNotification(notificationId);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }));
  },

  fetchGanttData: async (projectId) => {
    set({ loading: true });
    try {
      const res = await ganttApi.getGanttData(projectId);
      set({ ganttData: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createDependency: async (projectId, taskId, data) => {
    await ganttApi.createDependency(projectId, taskId, data);
  },

  deleteDependency: async (projectId, dependencyId) => {
    await ganttApi.deleteDependency(projectId, dependencyId);
  },

  clearError: () => set({ error: null }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setCurrentSprint: (sprint) => set({ currentSprint: sprint }),
  setCurrentEpic: (epic) => set({ currentEpic: epic }),
  setCurrentStory: (story) => set({ currentStory: story }),
}));
