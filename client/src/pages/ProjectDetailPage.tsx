import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import ListView from '../components/ListView';
import ProjectLayout from '../components/ProjectLayout';

const STATUS_CONFIG = {
  todo: { label: '待办', color: 'bg-slate-100', headerColor: 'text-slate-600' },
  in_progress: { label: '进行中', color: 'bg-blue-50', headerColor: 'text-blue-600' },
  done: { label: '已完成', color: 'bg-green-50', headerColor: 'text-green-600' },
};

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    currentProject,
    tasks,
    fetchProject,
    fetchTasks,
    fetchTask,
    batchUpdateOrder,
    setCurrentTask,
    currentTask,
  } = useAppStore();

  const [view, setView] = useState<'board' | 'list'>('board');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTask, setActiveTask] = useState<typeof tasks[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchProject, fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !projectId) {
        setTimeout(() => setActiveTask(null), 200);
        return;
      }

      const activeTaskItem = tasks.find((t) => t.id === active.id);
      if (!activeTaskItem) {
        setTimeout(() => setActiveTask(null), 200);
        return;
      }

      let newStatus = activeTaskItem.status;
      let newOrder = activeTaskItem.order;

      const overId = String(over.id);

      if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
        newStatus = overId as 'todo' | 'in_progress' | 'done';
        const columnTasks = tasks.filter((t) => t.status === newStatus && t.id !== active.id);
        newOrder = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.order)) + 1 : 1;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          newStatus = overTask.status;
          newOrder = overTask.order;
        }
      }

      if (newStatus !== activeTaskItem.status || newOrder !== activeTaskItem.order) {
        const updatedTasks = tasks.map((t) =>
          t.id === active.id ? { ...t, status: newStatus, order: newOrder } : t
        );
        const columnTasks = updatedTasks
          .filter((t) => t.status === newStatus)
          .sort((a, b) => a.order - b.order);
        const batchData = columnTasks.map((t, i) => ({
          id: t.id,
          status: t.status,
          order: i + 1,
        }));
        await batchUpdateOrder(projectId, batchData);
      }

      setTimeout(async () => {
        setActiveTask(null);
        await fetchTasks(projectId);
      }, 200);
    },
    [tasks, projectId, batchUpdateOrder, fetchTasks]
  );

  const handleTaskClick = (task: typeof tasks[0]) => {
    setCurrentTask(task);
    setShowDetail(true);
  };

  const handleOpenSubtask = async (subtaskId: string) => {
    if (!projectId) return;
    await fetchTask(projectId, subtaskId);
  };

  const openCreateTask = (status: 'todo' | 'in_progress' | 'done' = 'todo') => {
    setDefaultStatus(status);
    setShowCreateTask(true);
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.parentId).sort((a, b) => a.order - b.order);
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' && !t.parentId).sort((a, b) => a.order - b.order);
  const doneTasks = tasks.filter((t) => t.status === 'done' && !t.parentId).sort((a, b) => a.order - b.order);

  return (
    <ProjectLayout>
      {!currentProject ? (
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex gap-2">
              <button
                onClick={() => setView('board')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  view === 'board'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                看板视图
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  view === 'list'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                列表视图
              </button>
            </div>
          </div>

          {view === 'board' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
                {(['todo', 'in_progress', 'done'] as const).map((status) => {
                  const columnTasks = status === 'todo' ? todoTasks : status === 'in_progress' ? inProgressTasks : doneTasks;
                  const config = STATUS_CONFIG[status];
                  return (
                    <DroppableColumn
                      key={status}
                      id={status}
                      label={config.label}
                      headerColor={config.headerColor}
                      bgColor={config.color}
                      tasks={columnTasks}
                      onAddTask={() => openCreateTask(status)}
                      onTaskClick={handleTaskClick}
                    />
                  );
                })}
              </div>
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
                style={{ zIndex: 1000 }}
              >
                {activeTask && <TaskCard task={activeTask} isDragOverlay />}
              </DragOverlay>
            </DndContext>
          ) : (
            <ListView projectId={projectId!} onTaskClick={handleTaskClick} openCreateTask={openCreateTask} />
          )}
        </div>
      )}

      {currentProject && showDetail && currentTask && projectId && (
        <TaskDetailModal
          projectId={projectId}
          onClose={() => {
            setShowDetail(false);
            setCurrentTask(null);
          }}
          onOpenSubtask={handleOpenSubtask}
        />
      )}

      {currentProject && showCreateTask && projectId && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={defaultStatus}
          members={currentProject.members || []}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </ProjectLayout>
  );
}

function DroppableColumn({
  id,
  label,
  headerColor,
  bgColor,
  tasks,
  onAddTask,
  onTaskClick,
}: {
  id: string;
  label: string;
  headerColor: string;
  bgColor: string;
  tasks: ReturnType<typeof useAppStore.getState>['tasks'];
  onAddTask: () => void;
  onTaskClick: (task: ReturnType<typeof useAppStore.getState>['tasks'][0]) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[300px]">
      <div className={`${bgColor} rounded-xl p-4 ${isOver ? 'ring-2 ring-indigo-400 ring-opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${headerColor}`}>
              {label}
            </span>
            <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="p-1 hover:bg-white rounded transition-colors"
          >
            <Plus size={16} className="text-gray-400" />
          </button>
        </div>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export { STATUS_CONFIG };
