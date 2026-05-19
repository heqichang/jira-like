import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Calendar, Users, Flag, Link2 } from 'lucide-react';

export default function GanttPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, ganttData, fetchTasks, fetchGanttData } = useAppStore();
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
      fetchGanttData(projectId);
    }
  }, [projectId, fetchTasks, fetchGanttData]);

  const ganttChart = useMemo(() => {
    const tasksWithDates = tasks.filter((t: any) => t.startDate && t.dueDate);
    if (tasksWithDates.length === 0) return null;

    const allStartDates = tasksWithDates.map((t: any) => new Date(t.startDate).getTime());
    const allEndDates = tasksWithDates.map((t: any) => new Date(t.dueDate).getTime());
    const minDate = new Date(Math.min(...allStartDates));
    const maxDate = new Date(Math.max(...allEndDates));

    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / dayMs) + 1;

    const getDaysInRange = () => {
      const days = [];
      const current = new Date(minDate);
      while (current <= maxDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    };

    const days = getDaysInRange();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isWeekend = (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    const isToday = (date: Date) => {
      return date.toDateString() === today.toDateString();
    };

    const getTaskPosition = (task: any) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.dueDate);
      const startOffset = Math.ceil((taskStart.getTime() - minDate.getTime()) / dayMs);
      const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / dayMs) + 1;
      return { startOffset, duration };
    };

    const getStatusColor = (status: string, isCritical: boolean) => {
      if (isCritical) return 'bg-red-500';
      switch (status) {
        case 'done': return 'bg-green-500';
        case 'in_progress': return 'bg-blue-500';
        default: return 'bg-indigo-500';
      }
    };

    return { days, totalDays, minDate, maxDate, getTaskPosition, getStatusColor, isWeekend, isToday };
  }, [tasks, ganttData]);

  return (
    <ProjectLayout title="甘特图">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">甘特图</h2>
            <p className="text-gray-500 mt-1">查看项目时间线和任务依赖</p>
          </div>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setZoom(level)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  zoom === level
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 'day' ? '日' : level === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {ganttChart ? (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex border-b border-gray-200">
                  <div className="w-64 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200">
                    <span className="text-sm font-medium text-gray-700">任务</span>
                  </div>
                  <div className="flex-1 flex">
                    {ganttChart.days.map((date, i) => (
                      <div
                        key={i}
                        className={`flex-shrink-0 w-8 text-center p-2 text-xs font-medium ${
                          ganttChart.isWeekend(date) ? 'bg-gray-50 text-gray-400' :
                          ganttChart.isToday(date) ? 'bg-indigo-50 text-indigo-600 font-bold' :
                          'text-gray-500'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                </div>

                {tasks.filter((t: any) => t.startDate && t.dueDate).map((task: any) => {
                  const { startOffset, duration } = ganttChart.getTaskPosition(task);
                  const isCritical = ganttData?.criticalPath?.includes(task.id);

                  return (
                    <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                      <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200 flex items-center gap-2">
                        {task.isMilestone && <Flag size={14} className="text-yellow-500" />}
                        {task.dependencies?.length > 0 && <Link2 size={14} className="text-gray-400" />}
                        <span className="text-sm truncate">{task.title}</span>
                      </div>
                      <div className="flex-1 relative h-12">
                        <div
                          className={`absolute top-2 h-8 rounded-md ${ganttChart.getStatusColor(task.status, isCritical)} flex items-center px-2 text-white text-xs font-medium overflow-hidden`}
                          style={{
                            left: `${startOffset * 32}px`,
                            width: `${Math.max(duration * 32 - 4, 20)}px`,
                          }}
                        >
                          {duration * 32 > 60 && <span className="truncate">{task.title}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {ganttData?.criticalPath && ganttData.criticalPath.length > 0 && (
                  <div className="p-4 bg-red-50 border-t border-red-100">
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-3 h-3 bg-red-500 rounded" />
                      <span className="font-medium">关键路径：</span>
                      <span>{ganttData.criticalPath.length} 个任务影响项目完成时间</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无甘特图数据</h3>
              <p className="text-gray-500">为任务设置开始日期和截止日期以查看甘特图</p>
            </div>
          )}
        </div>

        {ganttData?.dependencies && ganttData.dependencies.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">任务依赖</h3>
            <div className="space-y-2">
              {ganttData.dependencies.map((dep: any, i: number) => {
                const fromTask = tasks.find((t: any) => t.id === dep.dependsOnTaskId);
                const toTask = tasks.find((t: any) => t.id === dep.taskId);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{fromTask?.title || '未知任务'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-700">{toTask?.title || '未知任务'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ProjectLayout>
  );
}
