import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Plus, Calendar, Users, Target, CheckCircle2, Clock } from 'lucide-react';

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (sprint: any) => void;
}

function CreateSprintModal({ isOpen, onClose, onCreate }: CreateSprintModalProps) {
  const [form, setForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
    setForm({ name: '', goal: '', startDate: '', endDate: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">创建 Sprint</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">目标</label>
            <textarea
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
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

export default function SprintsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { sprints, fetchSprints, createSprint, updateSprint } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
    }
  }, [projectId, fetchSprints]);

  const handleCreateSprint = async (sprintData: any) => {
    if (!projectId) return;
    await createSprint(projectId, sprintData);
    setShowCreateModal(false);
  };

  const handleStartSprint = async (sprintId: string) => {
    if (!projectId) return;
    await updateSprint(projectId, sprintId, { status: 'in_progress' });
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!projectId) return;
    await updateSprint(projectId, sprintId, { status: 'completed' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planned':
        return { label: '计划中', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'in_progress':
        return { label: '进行中', color: 'bg-blue-100 text-blue-700', icon: Target };
      case 'completed':
        return { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const plannedSprints = sprints.filter((s) => s.status === 'planned');
  const activeSprint = sprints.find((s) => s.status === 'in_progress');
  const completedSprints = sprints.filter((s) => s.status === 'completed');

  return (
    <ProjectLayout title="Sprint 管理">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sprint 管理</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus size={18} />
            创建 Sprint
          </button>
        </div>

        {activeSprint && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">当前 Sprint</h3>
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
              onClick={() => navigate(`/projects/${projectId}/sprints/${activeSprint.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2">{activeSprint.name}</h4>
                  <p className="text-indigo-100 mb-4">{activeSprint.goal}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{activeSprint.tasks?.length || 0} 个任务</span>
                    </div>
                    {activeSprint.velocity && (
                      <div className="flex items-center gap-1">
                        <Target size={14} />
                        <span>速度: {activeSprint.velocity}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteSprint(activeSprint.id);
                  }}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm font-medium"
                >
                  完成 Sprint
                </button>
              </div>
            </div>
          </div>
        )}

        {plannedSprints.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">计划中 ({plannedSprints.length})</h3>
            <div className="space-y-3">
              {plannedSprints.map((sprint) => {
                const statusConfig = getStatusConfig(sprint.status);
                return (
                  <div
                    key={sprint.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${projectId}/sprints/${sprint.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{sprint.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">{sprint.goal}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{sprint.tasks?.length || 0} 个任务</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSprint(sprint.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
                      >
                        开始
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedSprints.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">已完成 ({completedSprints.length})</h3>
            <div className="space-y-3">
              {completedSprints.map((sprint) => {
                const statusConfig = getStatusConfig(sprint.status);
                return (
                  <div
                    key={sprint.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/projects/${projectId}/sprints/${sprint.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-700">{sprint.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">{sprint.goal}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                          </div>
                          {sprint.velocity && (
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              <span>速度: {sprint.velocity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sprints.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 Sprint</h3>
            <p className="text-gray-500 mb-4">创建您的第一个 Sprint 开始敏捷开发</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              创建 Sprint
            </button>
          </div>
        )}

        <CreateSprintModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSprint}
        />
      </div>
    </ProjectLayout>
  );
}
