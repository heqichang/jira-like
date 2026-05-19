import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Plus, BookOpen, Target, Users, Flag, X } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (story: any) => void;
  epics: any[];
}

function CreateStoryModal({ isOpen, onClose, onCreate, epics }: CreateStoryModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    storyPoints: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
    epicId: '',
    acceptanceCriteria: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...form,
      storyPoints: form.storyPoints ? parseInt(form.storyPoints) : null,
    });
    setForm({
      title: '',
      description: '',
      storyPoints: '',
      priority: 'medium',
      status: 'todo',
      epicId: '',
      acceptanceCriteria: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">创建用户故事</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="作为[角色]，我想要[功能]，以便[价值]"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">故事点</label>
              <select
                value={form.storyPoints}
                onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">未估算</option>
                {[1, 2, 3, 5, 8, 13, 21].map((point) => (
                  <option key={point} value={point.toString()}>
                    {point}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联 Epic</label>
            <select
              value={form.epicId}
              onChange={(e) => setForm({ ...form, epicId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">无</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验收标准</label>
            <textarea
              value={form.acceptanceCriteria}
              onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="1. 给定... 当... 那么...&#10;2. 给定... 当... 那么..."
            />
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

export default function StoriesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { stories, epics, tasks, fetchStories, fetchEpics, fetchTasks, createStory } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');

  useEffect(() => {
    if (projectId) {
      fetchStories(projectId);
      fetchEpics(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchStories, fetchEpics, fetchTasks]);

  const handleCreateStory = async (storyData: any) => {
    if (!projectId) return;
    await createStory(projectId, storyData);
    setShowCreateModal(false);
  };

  const filteredStories = stories.filter((story: any) => {
    const statusMatch = filterStatus === 'all' || story.status === filterStatus;
    const epicMatch = filterEpic === 'all' || story.epicId === filterEpic;
    return statusMatch && epicMatch;
  });

  const getStoryTasks = (storyId: string) => {
    return tasks.filter((t: any) => t.storyId === storyId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return '已完成';
      case 'in_progress': return '进行中';
      default: return '待办';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const totalStoryPoints = filteredStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);

  return (
    <ProjectLayout title="用户故事">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">用户故事管理</h2>
            <p className="text-gray-500 mt-1">
              {filteredStories.length} 个故事 · {totalStoryPoints} 故事点
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus size={18} />
            创建 Story
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="todo">待办</option>
              <option value="in_progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Epic</label>
            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              {epics.map((epic: any) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户故事</h3>
            <p className="text-gray-500 mb-4">创建您的第一个用户故事</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              创建 Story
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStories.map((story: any) => {
              const storyTasks = getStoryTasks(story.id);
              const epic = epics.find((e: any) => e.id === story.epicId);
              return (
                <div key={story.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={18} className="text-indigo-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900">{story.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                          {getStatusLabel(story.status)}
                        </span>
                        <Flag size={16} className={getPriorityColor(story.priority)} />
                      </div>
                      {story.description && (
                        <p className="text-gray-600 text-sm mb-3 ml-7">{story.description}</p>
                      )}
                      <div className="flex items-center gap-6 ml-7 text-sm text-gray-500">
                        {story.storyPoints && (
                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>{story.storyPoints} SP</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{storyTasks.length} 个任务</span>
                        </div>
                        {epic && (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: epic.color }}
                            />
                            <span>{epic.name}</span>
                          </div>
                        )}
                      </div>
                      {story.acceptanceCriteria && (
                        <div className="mt-3 ml-7 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-500 mb-1">验收标准</div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateStoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateStory}
          epics={epics}
        />
      </div>
    </ProjectLayout>
  );
}
