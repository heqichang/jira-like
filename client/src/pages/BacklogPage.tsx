import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Plus, ArrowUpDown, Target, FolderKanban } from 'lucide-react';
import TaskCard from '../components/TaskCard';

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, stories, epics, sprints, fetchTasks, fetchStories, fetchEpics, fetchSprints, setCurrentTask, currentTask } = useAppStore();
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      fetchStories(projectId);
      fetchEpics(projectId);
      fetchSprints(projectId);
    }
  }, [projectId, fetchTasks, fetchStories, fetchEpics, fetchSprints]);

  const backlogTasks = tasks.filter((t) => !t.sprintId);
  const filteredTasks = backlogTasks
    .filter((t) => !selectedEpic || t.epicId === selectedEpic)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleTaskClick = (task: typeof tasks[0]) => {
    setCurrentTask(task);
    setShowDetail(true);
  };

  const totalStoryPoints = filteredTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <ProjectLayout title="待办池">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">待办池</h2>
            <p className="text-gray-500 mt-1">
              {filteredTasks.length} 个需求 · {totalStoryPoints} 故事点
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">按 Epic 筛选</label>
            <select
              value={selectedEpic || ''}
              onChange={(e) => setSelectedEpic(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">全部 Epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">规划到 Sprint</label>
            <select
              value={selectedSprint || ''}
              onChange={(e) => setSelectedSprint(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">选择 Sprint</option>
              {sprints.filter((s) => s.status !== 'completed').map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ArrowUpDown size={14} />
              <span>拖拽调整优先级</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <FolderKanban size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">待办池为空</h3>
                <p className="text-gray-500">所有需求都已规划到 Sprint 中</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-sm text-gray-500 font-medium mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <TaskCard task={task} compact />
                    </div>
                    {selectedSprint && (
                      <button
                        onClick={async () => {
                          if (!projectId) return;
                          await useAppStore.getState().addTaskToSprint(projectId, selectedSprint, task.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100"
                      >
                        添加到 Sprint
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showDetail && currentTask && projectId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">{currentTask.title}</h3>
              <p className="text-gray-600 mb-4">{currentTask.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">状态：</span>
                  <span className="text-gray-900">{currentTask.status}</span>
                </div>
                {currentTask.storyPoints && (
                  <div>
                    <span className="text-gray-500">故事点：</span>
                    <span className="text-gray-900">{currentTask.storyPoints}</span>
                  </div>
                )}
                {currentTask.estimatedHours && (
                  <div>
                    <span className="text-gray-500">预估工时：</span>
                    <span className="text-gray-900">{currentTask.estimatedHours} 小时</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setCurrentTask(null);
                }}
                className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </ProjectLayout>
  );
}
