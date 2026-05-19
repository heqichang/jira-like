import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { useEffect } from 'react';
import {
  ChevronLeft,
  LayoutGrid,
  List,
  Clock,
  BarChart3,
  Target,
  Calendar,
  FolderKanban,
  Settings,
  Bell,
  BookOpen,
} from 'lucide-react';

interface ProjectLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function ProjectLayout({ children, title }: ProjectLayoutProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject, fetchProject, unreadNotificationCount } = useAppStore();

  useEffect(() => {
    if (projectId && !currentProject) {
      fetchProject(projectId);
    }
  }, [projectId, currentProject, fetchProject]);

  const navItems = [
    { path: '', icon: LayoutGrid, label: '看板' },
    { path: 'sprints', icon: Target, label: 'Sprint' },
    { path: 'backlog', icon: FolderKanban, label: '待办池' },
    { path: 'epics', icon: BarChart3, label: 'Epic' },
    { path: 'stories', icon: BookOpen, label: 'Story' },
    { path: 'gantt', icon: Calendar, label: '甘特图' },
    { path: 'time-tracking', icon: Clock, label: '工时' },
    { path: 'settings', icon: Settings, label: '设置' },
  ];

  const isActive = (path: string) => {
    const basePath = `/projects/${projectId}`;
    const currentPath = location.pathname;
    if (path === '') {
      return currentPath === basePath;
    }
    return currentPath.startsWith(`${basePath}/${path}`);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: currentProject.color }}
            >
              {currentProject.name[0]}
            </div>
            <h1 className="font-semibold text-gray-900">{currentProject.name}</h1>
            {title && <span className="text-gray-400">/ {title}</span>}
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(`/projects/${projectId}/${item.path}`)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive(item.path)
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
