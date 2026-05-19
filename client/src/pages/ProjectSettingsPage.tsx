import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { Save, Plus, X, Tag, Mail, Bell } from 'lucide-react';
import ProjectLayout from '../components/ProjectLayout';

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    currentProject,
    updateProject,
    archiveProject,
    deleteProject,
    tags,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    userSettings,
    fetchUserSettings,
    updateUserSettings,
  } = useAppStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'tags' | 'notifications'>('general');

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
      setColor(currentProject.color);
    }
  }, [currentProject]);

  useEffect(() => {
    if (projectId) {
      fetchTags(projectId);
    }
  }, [projectId, fetchTags]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (userSettings) {
      setEmailNotifications(userSettings.emailNotificationsEnabled ?? true);
    }
  }, [userSettings]);

  const handleSave = async () => {
    await updateProject(projectId, { name, description, color });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(projectId, { name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
    setNewTagColor('#6366f1');
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('确定要删除此标签吗？')) return;
    await deleteTag(projectId, tagId);
  };

  const handleNotificationSettingsSave = async () => {
    await updateUserSettings({ emailNotificationsEnabled: emailNotifications });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  return (
    <ProjectLayout title="设置">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'general'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          基本设置
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'tags'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          标签管理
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'notifications'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          通知设置
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-8">
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
      )}

      {activeTab === 'tags' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">标签管理</h2>
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="输入标签名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                </div>
                <div className="flex items-center gap-1">
                  {colors.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newTagColor === c ? 'scale-110 ring-2 ring-offset-1 ring-gray-300' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateTag}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-1"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>

              <div className="border-t pt-4">
                {tags.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">暂无标签，创建您的第一个标签</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tags.map((tag: any) => (
                      <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-gray-900">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h2>
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">邮件通知</div>
                    <div className="text-sm text-gray-500">接收任务分配、状态变更等邮件通知</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bell size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">推送通知</div>
                    <div className="text-sm text-gray-500">接收浏览器推送通知</div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">始终开启</span>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleNotificationSettingsSave}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Save size={16} />
                  保存设置
                </button>
                {saved && <span className="ml-3 text-sm text-green-600">已保存</span>}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
    </ProjectLayout>
  );
}
