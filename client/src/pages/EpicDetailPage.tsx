import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { ArrowLeft, Target, Calendar, Users } from 'lucide-react';

export default function EpicDetailPage() {
  const { projectId, epicId } = useParams<{ projectId: string; epicId: string }>();
  const navigate = useNavigate();
  const { epics, stories, tasks, fetchEpics, fetchStories, fetchTasks } = useAppStore();

  useEffect(() => {
    if (projectId) {
      fetchEpics(projectId);
      fetchStories(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchEpics, fetchStories, fetchTasks]);

  const epic = epics.find((e) => e.id === epicId);
  const epicStories = stories.filter((s) => s.epicId === epicId);
  const epicTasks = tasks.filter((t) => t.epicId === epicId);

  if (!epic) return null;

  const totalStoryPoints = epicStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0) +
    epicTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <ProjectLayout title={`Epic: ${epic.name}`}>
      <div className="p-6">
        <button
          onClick={() => navigate(`/projects/${projectId}/epics`)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          返回 Epic 列表
        </button>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: epic.color + '20' }}
            >
              <Target size={24} style={{ color: epic.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{epic.name}</h1>
              <p className="text-gray-600 mt-1">{epic.description}</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{epicStories.length} 个 Story</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{epicTasks.length} 个任务</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target size={14} />
                  <span>{totalStoryPoints} 故事点</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">用户故事 (Story)</h3>
            {epicStories.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Target size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">暂无 Story</p>
              </div>
            ) : (
              epicStories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg p-4 border border-gray-200 mb-2">
                  <div className="font-medium">{story.title}</div>
                  {story.description && (
                    <div className="text-sm text-gray-500 mt-1">{story.description}</div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>状态: {story.status}</span>
                    {story.storyPoints && <span>{story.storyPoints} SP</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">任务</h3>
            {epicTasks.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Users size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">暂无任务</p>
              </div>
            ) : (
              epicTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200 mb-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>状态: {task.status}</span>
                    {task.storyPoints && <span>{task.storyPoints} SP</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
