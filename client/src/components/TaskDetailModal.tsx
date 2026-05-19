import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  X,
  Save,
  Trash2,
  Bug,
  Sparkles,
  CheckSquare,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
  Send,
  MessageSquare,
  Plus,
} from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: '紧急', icon: AlertCircle, color: 'text-red-500' },
  { value: 'high', label: '高', icon: ArrowUp, color: 'text-orange-500' },
  { value: 'medium', label: '中', icon: Minus, color: 'text-yellow-500' },
  { value: 'low', label: '低', icon: ArrowDown, color: 'text-blue-500' },
];

const TYPE_OPTIONS = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-500' },
  { value: 'feature', label: 'Feature', icon: Sparkles, color: 'text-purple-500' },
  { value: 'task', label: 'Task', icon: CheckSquare, color: 'text-blue-500' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
];

interface TaskDetailModalProps {
  projectId: string;
  onClose: () => void;
}

export default function TaskDetailModal({ projectId, onClose, onOpenSubtask }: TaskDetailModalProps & {
  onOpenSubtask?: (taskId: string) => void;
}) {
  const {
    currentTask,
    currentProject,
    updateTask,
    deleteTask,
    addComment,
    deleteComment,
    fetchTask,
    createTask,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
      setStatus(currentTask.status);
      setPriority(currentTask.priority);
      setType(currentTask.type);
      setAssigneeId(currentTask.assigneeId || '');
    }
  }, [currentTask]);

  if (!currentTask) return null;

  const handleSave = async () => {
    await updateTask(projectId, currentTask.id, {
      title,
      description,
      status,
      priority,
      type,
      assigneeId: assigneeId || null,
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('确定要删除此任务吗？')) {
      await deleteTask(projectId, currentTask.id);
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(projectId, currentTask.id, commentText.trim());
    setCommentText('');
    fetchTask(projectId, currentTask.id);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(projectId, currentTask.id, commentId);
    fetchTask(projectId, currentTask.id);
  };

  const members = currentProject?.members || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            {!editing ? (
              <h2 className="text-lg font-semibold text-gray-900">{currentTask.title}</h2>
            ) : (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                <Save size={14} />
                保存
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                编辑
              </button>
            )}
            <button onClick={handleDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">状态</label>
              {editing ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                  status === 'todo' ? 'bg-slate-100 text-slate-600' :
                  status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">优先级</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm">
                  {(() => {
                    const conf = PRIORITY_OPTIONS.find((o) => o.value === priority);
                    if (!conf) return null;
                    const Icon = conf.icon;
                    return <><Icon size={14} className={conf.color} /><span className={conf.color}>{conf.label}</span></>;
                  })()}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">类型</label>
              {editing ? (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm">
                  {(() => {
                    const conf = TYPE_OPTIONS.find((o) => o.value === type);
                    if (!conf) return null;
                    const Icon = conf.icon;
                    return <><Icon size={14} className={conf.color} /><span className={conf.color}>{conf.label}</span></>;
                  })()}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">指派人</label>
              {editing ? (
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">未指派</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.nickname}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-700">
                  {currentTask.assignee?.nickname || '未指派'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">描述</label>
            {editing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {currentTask.description || '暂无描述'}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-500">子任务</label>
              {editing && (
                <button
                  onClick={() => {
                    const title = prompt('输入子任务标题：');
                    if (title && currentTask) {
                      createTask(projectId, { title, parentId: currentTask.id });
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  <Plus size={12} />
                  添加子任务
                </button>
              )}
            </div>
            {(currentTask.subtasks && currentTask.subtasks.length > 0) ? (
              <div className="space-y-1">
                {currentTask.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 text-sm py-1 group">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (currentTask) {
                          const newStatus = st.status === 'done' ? 'todo' : 'done';
                          await updateTask(projectId, st.id, { status: newStatus });
                          await fetchTask(projectId, currentTask.id);
                        }
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0"
                    >
                      <CheckSquare size={14} className={st.status === 'done' ? 'text-green-500' : 'text-gray-400'} />
                    </button>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenSubtask) onOpenSubtask(st.id);
                      }}
                      className={`flex-1 cursor-pointer hover:text-indigo-600 ${st.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
                    >
                      {st.title}
                    </span>
                    {editing && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('确定删除此子任务吗？') && currentTask) {
                            await deleteTask(projectId, st.id);
                            await fetchTask(projectId, currentTask.id);
                          }
                        }}
                        className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-opacity flex-shrink-0"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              editing ? (
                <p className="text-sm text-gray-400">点击上方"添加子任务"按钮创建</p>
              ) : (
                <p className="text-sm text-gray-400">暂无子任务</p>
              )
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                评论 ({currentTask.comments?.length || 0})
              </span>
            </div>
            <div className="space-y-3 mb-4">
              {(currentTask.comments || []).map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {c.author?.nickname[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{c.author?.nickname}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString('zh-CN')}
                      </span>
                      {c.authorId === useAppStore.getState().user?.id && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="添加评论..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
