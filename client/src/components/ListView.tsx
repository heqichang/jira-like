import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  Plus,
  ArrowUpDown,
  Filter,
  Bug,
  Sparkles,
  CheckSquare,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

const PRIORITY_CONFIG = {
  urgent: { icon: AlertCircle, color: 'text-red-500', label: '紧急' },
  high: { icon: ArrowUp, color: 'text-orange-500', label: '高' },
  medium: { icon: Minus, color: 'text-yellow-500', label: '中' },
  low: { icon: ArrowDown, color: 'text-blue-500', label: '低' },
};

const TYPE_CONFIG = {
  bug: { icon: Bug, color: 'text-red-500', bg: 'bg-red-50', label: 'Bug' },
  feature: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Feature' },
  task: { icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Task' },
};

const STATUS_LABELS: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
};

type SortKey = 'priority' | 'createdAt' | 'updatedAt';

interface ListViewProps {
  projectId: string;
  onTaskClick: (task: ReturnType<typeof useAppStore.getState>['tasks'][0]) => void;
  openCreateTask: (status?: 'todo' | 'in_progress' | 'done') => void;
}

export default function ListView({ projectId, onTaskClick, openCreateTask }: ListViewProps) {
  const { tasks, fetchTasks } = useAppStore();
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { currentProject } = useAppStore();

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterAssignee) params.assigneeId = filterAssignee;
    if (filterPriority) params.priority = filterPriority;
    if (filterType) params.type = filterType;
    fetchTasks(projectId, params);
  }, [projectId, filterAssignee, filterPriority, filterType, fetchTasks]);

  const sortedTasks = [...tasks]
    .filter((t) => !t.parentId)
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'priority') {
        cmp = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
      } else if (sortBy === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const members = currentProject?.members || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (sortDir === 'desc') setSortDir('asc');
              else setSortDir('desc');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowUpDown size={14} />
            {sortBy === 'priority' ? '优先级' : sortBy === 'createdAt' ? '创建时间' : '更新时间'}
            {sortDir === 'desc' ? ' ↓' : ' ↑'}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none"
          >
            <option value="priority">按优先级</option>
            <option value="createdAt">按创建时间</option>
            <option value="updatedAt">按更新时间</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg ${
              showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            筛选
          </button>
        </div>
        <button
          onClick={() => openCreateTask()}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          <Plus size={14} />
          新建任务
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-lg">
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none"
          >
            <option value="">全部指派人</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.nickname}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none"
          >
            <option value="">全部优先级</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none"
          >
            <option value="">全部类型</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="task">Task</option>
          </select>
          <button
            onClick={() => {
              setFilterAssignee('');
              setFilterPriority('');
              setFilterType('');
            }}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            重置
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">任务</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">优先级</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">指派人</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">更新时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  暂无任务
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const pConf = PRIORITY_CONFIG[task.priority];
                const tConf = TYPE_CONFIG[task.type];
                const PIcon = pConf.icon;
                const TIcon = tConf.icon;
                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {task.subtasks.filter((s) => s.status === 'done').length}/{task.subtasks.length} 子任务
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        task.status === 'todo' ? 'bg-slate-100 text-slate-600' :
                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <PIcon size={12} className={pConf.color} />
                        <span className={pConf.color}>{pConf.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${tConf.bg} ${tConf.color}`}>
                        <TIcon size={10} />
                        {tConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-medium">
                            {task.assignee.nickname[0]}
                          </div>
                          <span className="text-xs text-gray-600">{task.assignee.nickname}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">未指派</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(task.updatedAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
