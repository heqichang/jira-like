import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { ArrowLeft, Calendar, Users, Target, Clock, TrendingDown, Plus, X } from 'lucide-react';
import TaskCard from '../components/TaskCard';

export default function SprintDetailPage() {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const navigate = useNavigate();
  const {
    sprints,
    tasks,
    fetchSprints,
    fetchTasks,
    fetchBurndownData,
    burndownData,
    addTaskToSprint,
    removeTaskFromSprint,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'backlog' | 'burndown' | 'retrospective'>('backlog');
  const [showAddTask, setShowAddTask] = useState(false);
  const [retrospective, setRetrospective] = useState('');

  useEffect(() => {
    if (projectId && sprintId) {
      fetchSprints(projectId);
      fetchTasks(projectId);
      fetchBurndownData(projectId, sprintId);
    }
  }, [projectId, sprintId, fetchSprints, fetchTasks, fetchBurndownData]);

  const sprint = sprints.find((s) => s.id === sprintId);
  const sprintTasks = tasks.filter((t) => t.sprintId === sprintId);
  const unassignedTasks = tasks.filter((t) => !t.sprintId);

  const burndownChart = useMemo(() => {
    if (!burndownData || burndownData.length === 0) return null;

    const maxValue = Math.max(...burndownData.map((d: any) => Math.max(d.remainingStoryPoints || 0, d.idealRemaining || 0)));
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (index: number) => padding.left + (index / (burndownData.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + (1 - value / maxValue) * chartHeight;

    const actualPath = burndownData.map((d: any, i: number) =>
      `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.remainingStoryPoints || 0)}`
    ).join(' ');

    const idealPath = burndownData.map((d: any, i: number) =>
      `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.idealRemaining || 0)}`
    ).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + ratio * chartHeight}
            x2={width - padding.right}
            y2={padding.top + ratio * chartHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        <path d={idealPath} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5,5" fill="none" />

        <path d={actualPath} stroke="#6366f1" strokeWidth={3} fill="none" />

        {burndownData.map((d: any, i: number) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.remainingStoryPoints || 0)}
            r={4}
            fill="#6366f1"
          />
        ))}

        {burndownData.map((d: any, i: number) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 10}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={11}
          >
            {new Date(d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <text
            key={i}
            x={padding.left - 8}
            y={padding.top + ratio * chartHeight + 4}
            textAnchor="end"
            fill="#6b7280"
            fontSize={11}
          >
            {Math.round(maxValue * (1 - ratio))}
          </text>
        ))}

        <text x={width / 2} y={height - 5} textAnchor="middle" fill="#6b7280" fontSize={12}>
          日期
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={12}
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          剩余故事点
        </text>

        <g transform={`translate(${width - 180}, 10)`}>
          <rect x={0} y={0} width={16} height={16} fill="#6366f1" />
          <text x={22} y={12} fill="#374151" fontSize={12}>实际</text>
          <rect x={80} y={0} width={16} height={16} fill="#94a3b8" strokeDasharray="3,3" />
          <text x={102} y={12} fill="#374151" fontSize={12}>理想</text>
        </g>
      </svg>
    );
  }, [burndownData]);

  const stats = useMemo(() => {
    const total = sprintTasks.length;
    const done = sprintTasks.filter((t) => t.status === 'done').length;
    const inProgress = sprintTasks.filter((t) => t.status === 'in_progress').length;
    const todo = sprintTasks.filter((t) => t.status === 'todo').length;
    const totalStoryPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = sprintTasks
      .filter((t) => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    return { total, done, inProgress, todo, totalStoryPoints, completedStoryPoints };
  }, [sprintTasks]);

  const handleAddTask = async (taskId: string) => {
    if (!projectId || !sprintId) return;
    await addTaskToSprint(projectId, sprintId, taskId);
    setShowAddTask(false);
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!projectId || !sprintId) return;
    await removeTaskFromSprint(projectId, sprintId, taskId);
  };

  if (!sprint) return null;

  return (
    <ProjectLayout title={`Sprint: ${sprint.name}`}>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/projects/${projectId}/sprints`)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} />
            返回 Sprint 列表
          </button>

          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{sprint.name}</h1>
                <p className="text-gray-600 mb-4">{sprint.goal}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{stats.total} 个任务</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>{stats.completedStoryPoints}/{stats.totalStoryPoints} 故事点</span>
                  </div>
                  {sprint.velocity && (
                    <div className="flex items-center gap-1">
                      <TrendingDown size={14} />
                      <span>速度: {sprint.velocity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">总任务</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.todo}</div>
                <div className="text-sm text-gray-500">待办</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-500">进行中</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.done}</div>
                <div className="text-sm text-gray-500">已完成</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('backlog')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'backlog'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sprint Backlog
            </button>
            <button
              onClick={() => setActiveTab('burndown')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'burndown'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              燃尽图
            </button>
            <button
              onClick={() => setActiveTab('retrospective')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'retrospective'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              回顾
            </button>
          </div>
        </div>

        {activeTab === 'backlog' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">任务列表</h3>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
              >
                <Plus size={14} />
                添加任务
              </button>
            </div>

            <div className="space-y-2">
              {sprintTasks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Clock size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">暂无任务，点击上方按钮添加</p>
                </div>
              ) : (
                sprintTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <TaskCard task={task} />
                    <button
                      onClick={() => handleRemoveTask(task.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'burndown' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">燃尽图</h3>
            {burndownChart || (
              <div className="text-center py-12">
                <TrendingDown size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">暂无燃尽图数据</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'retrospective' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Sprint 回顾</h3>
            {sprint.retrospective ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{sprint.retrospective}</p>
              </div>
            ) : (
              <div>
                <textarea
                  value={retrospective}
                  onChange={(e) => setRetrospective(e.target.value)}
                  placeholder="记录本次 Sprint 的经验教训、改进点..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={6}
                />
                <button className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  保存回顾
                </button>
              </div>
            )}
          </div>
        )}

        {showAddTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">添加任务到 Sprint</h2>
                <button onClick={() => setShowAddTask(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {unassignedTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">没有可添加的任务</p>
                ) : (
                  unassignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
                      onClick={() => handleAddTask(task.id)}
                    >
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProjectLayout>
  );
}
