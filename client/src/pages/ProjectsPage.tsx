import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Plus, FolderOpen, Archive, Trash2, Settings, RotateCcw } from 'lucide-react';

export default function ProjectsPage() {
  const {
    projects,
    archivedProjects,
    fetchProjects,
    fetchArchivedProjects,
    createProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
  } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'active') {
      fetchProjects();
    } else {
      fetchArchivedProjects();
    }
  }, [activeTab, fetchProjects, fetchArchivedProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({ name, description, color });
    setShowCreate(false);
    setName('');
    setDescription('');
    setColor('#6366f1');
  };

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  const displayProjects = activeTab === 'active' ? projects : archivedProjects;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
          {activeTab === 'active' && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              新建项目
            </button>
          )}
        </div>
        <div className="max-w-6xl mx-auto flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            我的项目 ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'archived'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Archive size={14} />
            已归档 ({archivedProjects.length})
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {activeTab === 'active' ? '我的项目' : '已归档项目'}
        </h2>
        {displayProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {activeTab === 'active' ? '还没有项目，创建一个开始吧' : '暂无已归档项目'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProjects.map((project) => (
              <div
                key={project.id}
                className={`bg-white rounded-xl border border-gray-200 p-5 transition-shadow group ${
                  activeTab === 'active'
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-75'
                }`}
                onClick={() => {
                  if (activeTab === 'active') {
                    navigate(`/projects/${project.id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {project.description || '暂无描述'}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activeTab === 'active' ? (
                      <>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Settings size={14} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => archiveProject(project.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Archive size={14} className="text-gray-500" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => unarchiveProject(project.id)}
                        className="p-1.5 hover:bg-green-50 rounded"
                        title="恢复项目"
                      >
                        <RotateCcw size={14} className="text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('确定要删除此项目吗？此操作不可恢复。')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                {project.members && (
                  <div className="mt-3 flex -space-x-2">
                    {project.members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium border-2 border-white"
                        title={m.nickname}
                      >
                        {m.nickname[0]}
                      </div>
                    ))}
                    {project.members.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs border-2 border-white">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">新建项目</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="项目名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="项目描述（可选）"
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
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
