import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Plus, Target, Calendar, Users, X } from 'lucide-react';

interface CreateEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (epic: any) => void;
}

function CreateEpicModal({ isOpen, onClose, onCreate }: CreateEpicModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    startDate: '',
    endDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
    setForm({ name: '', description: '', color: '#6366f1', startDate: '', endDate: '' });
  };

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">创建 Epic</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EpicsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { epics, stories, tasks, fetchEpics, fetchStories, fetchTasks, createEpic } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchEpics(projectId);
      fetchStories(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchEpics, fetchStories, fetchTasks]);

  const handleCreateEpic = async (epicData: any) => {
    if (!projectId) return;
    await createEpic(projectId, epicData);
    setShowCreateModal(false);
  };

  const getEpicStats = (epicId: string) => {
    const epicStories = stories.filter((s) => s.epicId === epicId);
    const epicTasks = tasks.filter((t) => t.epicId === epicId);
    const totalStoryPoints = epicStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0) +
      epicTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedTasks = epicTasks.filter((t) => t.status === 'done').length;
    const progress = epicTasks.length > 0 ? Math.round((completedTasks / epicTasks.length) * 100) : 0;

    return { stories: epicStories.length, tasks: epicTasks.length, totalStoryPoints, progress };
  };

  return (
    <ProjectLayout title="Epic 管理">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Epic 管理</h2>
            <p className="text-gray-500 mt-1">管理大型需求和项目里程碑</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus size={18} />
            创建 Epic
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {epics.map((epic) => {
            const stats = getEpicStats(epic.id);
            return (
              <div
                key={epic.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/projects/${projectId}/epics/${epic.id}`)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: epic.color + '20' }}
                  >
                    <Target size={20} style={{ color: epic.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{epic.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{epic.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Target size={14} />
                      <span>{stats.stories} Story</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{stats.tasks} 任务</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">故事点</span>
                      <span className="font-medium text-gray-900">{stats.totalStoryPoints} SP</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">进度</span>
                      <span className="font-medium text-gray-900">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${stats.progress}%`, backgroundColor: epic.color }}
                      />
                    </div>
                  </div>

                  {(epic.startDate || epic.endDate) && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 pt-1">
                      <Calendar size={14} />
                      <span>
                        {epic.startDate && new Date(epic.startDate).toLocaleDateString()}
                        {' - '}
                        {epic.endDate && new Date(epic.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {epics.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Target size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 Epic</h3>
            <p className="text-gray-500 mb-4">创建您的第一个 Epic 来组织大型需求</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              创建 Epic
            </button>
          </div>
        )}

        <CreateEpicModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEpic}
        />
      </div>
    </ProjectLayout>
  );
}
