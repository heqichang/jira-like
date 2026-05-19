import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import ProjectLayout from '../components/ProjectLayout';
import { Clock, Calendar, Users, Plus, X } from 'lucide-react';

export default function TimeTrackingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    timeLogs,
    tasks,
    user,
    fetchTimeLogs,
    fetchTasks,
    createTimeLog,
    fetchTimeReport,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'logs' | 'report'>('logs');
  const [showAddLog, setShowAddLog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');
  const [timeReport, setTimeReport] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      fetchTimeLogs(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, fetchTimeLogs, fetchTasks]);

  useEffect(() => {
    if (projectId && activeTab === 'report') {
      loadReport();
    }
  }, [projectId, activeTab, reportPeriod]);

  const loadReport = async () => {
    if (!projectId) return;
    const report = await fetchTimeReport(projectId, reportPeriod);
    setTimeReport(report);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedTask || !hours) return;
    await createTimeLog(projectId, selectedTask, {
      hours: parseFloat(hours),
      description,
      logDate,
    });
    setShowAddLog(false);
    setSelectedTask('');
    setHours('');
    setDescription('');
  };

  const myLogs = timeLogs.filter((log: any) => log.userId === user?.id);
  const totalHours = myLogs.reduce((sum: number, log: any) => sum + log.hours, 0);
  const estimatedHours = tasks.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0);

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t: any) => t.id === taskId);
    return task?.title || '未知任务';
  };

  return (
    <ProjectLayout title="时间追踪">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">时间追踪</h2>
            <p className="text-gray-500 mt-1">记录和管理工时</p>
          </div>
          <button
            onClick={() => setShowAddLog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus size={18} />
            记录工时
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</div>
                <div className="text-sm text-gray-500">已记录工时（小时）</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{estimatedHours.toFixed(1)}</div>
                <div className="text-sm text-gray-500">预估工时（小时）</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{myLogs.length}</div>
                <div className="text-sm text-gray-500">工时记录数</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            工时日志
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'report'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            统计报表
          </button>
        </div>

        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">工时</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                        暂无工时记录
                      </td>
                    </tr>
                  ) : (
                    myLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(log.logDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getTaskTitle(log.taskId)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {log.hours} 小时
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setReportPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  reportPeriod === 'week'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                本周
              </button>
              <button
                onClick={() => setReportPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  reportPeriod === 'month'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                本月
              </button>
            </div>

            {timeReport ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">按任务统计</h3>
                <div className="space-y-3">
                  {timeReport.byTask?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{item.taskTitle}</span>
                      <span className="font-semibold text-indigo-600">{item.totalHours} 小时</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">按日期统计</h3>
                <div className="space-y-3">
                  {timeReport.byDate?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{item.date}</span>
                      <span className="font-semibold text-indigo-600">{item.totalHours} 小时</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Clock size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">加载中...</p>
              </div>
            )}
          </div>
        )}

        {showAddLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">记录工时</h2>
                <button onClick={() => setShowAddLog(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddLog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务</label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">选择任务</option>
                    {tasks.map((task: any) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工时（小时）</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如：2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="记录今天完成的工作内容..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProjectLayout>
  );
}
