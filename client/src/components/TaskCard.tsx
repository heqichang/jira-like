import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bug, Sparkles, CheckSquare, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  high: { icon: ArrowUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  medium: { icon: Minus, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  low: { icon: ArrowDown, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const TYPE_CONFIG = {
  bug: { icon: Bug, color: 'text-red-500', bg: 'bg-red-50', label: 'Bug' },
  feature: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Feature' },
  task: { icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Task' },
};

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    type: 'bug' | 'feature' | 'task';
    assignee?: { id: string; nickname: string; avatar: string | null } | null;
    subtasks?: { id: string; status: string }[];
  };
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export default function TaskCard({ task, onClick, isDragOverlay }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConf = PRIORITY_CONFIG[task.priority];
  const typeConf = TYPE_CONFIG[task.type];
  const PriorityIcon = priorityConf.icon;
  const TypeIcon = typeConf.icon;
  const doneSubtasks = task.subtasks?.filter((s) => s.status === 'done').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${isDragOverlay ? 'shadow-xl rotate-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${typeConf.bg} ${typeConf.color}`}>
              <TypeIcon size={10} />
              {typeConf.label}
            </span>
            <PriorityIcon size={14} className={priorityConf.color} />
          </div>
          <h4 className="text-sm font-medium text-gray-900 leading-snug">{task.title}</h4>
        </div>
        {task.assignee && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
            {task.assignee.nickname[0]}
          </div>
        )}
      </div>
      {totalSubtasks > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <CheckSquare size={12} />
          <span>{doneSubtasks}/{totalSubtasks}</span>
        </div>
      )}
    </div>
  );
}
