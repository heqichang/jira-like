import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Bell, Check, CheckCheck, ArrowLeft, UserPlus, Edit3, MessageSquare, Settings } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
  } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <UserPlus size={18} className="text-blue-500" />;
      case 'task_updated':
        return <Edit3 size={18} className="text-yellow-500" />;
      case 'comment_mentioned':
        return <MessageSquare size={18} className="text-green-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return '任务指派';
      case 'task_updated':
        return '任务更新';
      case 'comment_mentioned':
        return '提及通知';
      default:
        return '通知';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n: any) => !n.isRead)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">通知</h1>
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {unreadNotificationCount} 条未读
              </span>
            )}
          </div>
          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
            >
              <CheckCheck size={16} />
              全部标为已读
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'unread'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            未读
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? '您没有未读通知' : '您目前没有任何通知'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 border ${
                  notification.isRead ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50/30'
                } cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => {
                  if (!notification.isRead) {
                    markNotificationAsRead(notification.id);
                  }
                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 mt-0.5">
                          {notification.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    {notification.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
