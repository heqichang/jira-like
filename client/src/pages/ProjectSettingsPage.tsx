import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { Save } from 'lucide-react';

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, updateProject, archiveProject, deleteProject } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
      setColor(currentProject.color);
    }
  }, [currentProject]);

  if (!currentProject || !projectId) return null;

  const handleSave = async () => {
    await updateProject(projectId, { name, description, color });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">项目信息</h2>
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Save size={16} />
              保存
            </button>
            {saved && <span className="text-sm text-green-600">已保存</span>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">项目成员</h2>
        <div className="bg-white rounded-xl border p-6">
          {currentProject.members && currentProject.members.length > 0 ? (
            <div className="divide-y">
              {currentProject.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                      {m.nickname[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{m.nickname}</div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {(m as { ProjectMember?: { role: string } }).ProjectMember?.role || 'member'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无成员</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-red-600 mb-4">危险操作</h2>
        <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">归档项目</div>
              <div className="text-sm text-gray-500">项目将被归档，可在需要时恢复</div>
            </div>
            <button
              onClick={() => archiveProject(projectId)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              归档
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">删除项目</div>
              <div className="text-sm text-gray-500">永久删除项目及其所有任务，此操作不可恢复</div>
            </div>
            <button
              onClick={() => {
                if (confirm('确定要删除此项目吗？所有任务将被永久删除。')) {
                  deleteProject(projectId);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
