import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { NotificationItem } from '../types';
import { dataService } from '../services/dataService';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      setLoading(true);
      const data = await dataService.getNotifications();
      setNotifications(data);
      setLoading(false);
    }
    loadNotifs();
  }, []);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await dataService.markAllNotificationsRead();
  };

  const toggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    await dataService.markNotificationRead(id);
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <AppLayout unreadNotifications={hasUnread}>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-md max-w-[1040px] w-full mx-auto">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
            Notifications
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Official alerts, payment deadlines, advisor remarks, and event check-in reminders.
          </p>
        </div>

        {hasUnread && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-xs px-md py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications Card */}
      <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden max-w-[1040px] w-full mx-auto shadow-sm">
        {loading ? (
          <div className="p-xl text-center">
            <p className="font-body text-body-md text-light-on-surface-variant">Loading notifications from Supabase...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-2xl text-center flex flex-col items-center gap-sm">
            <span className="material-symbols-outlined text-[36px] text-light-outline">notifications_off</span>
            <span className="font-title text-title-md font-semibold text-light-on-surface">No Notifications</span>
            <p className="font-body text-body-md text-light-on-surface-variant">
              You are completely caught up with all campus updates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-light-outline-variant">
            {notifications.map((notif) => {
              let iconContainer = 'bg-info-container text-on-info-container';
              if (notif.type === 'warning') iconContainer = 'bg-warning-container text-on-warning-container';
              if (notif.type === 'success') iconContainer = 'bg-success-container text-success';
              if (notif.type === 'error') iconContainer = 'bg-light-error-container text-light-on-error-container';
              if (notif.type === 'secondary') iconContainer = 'bg-light-secondary-container text-light-on-secondary-container';

              return (
                <div
                  key={notif.id}
                  onClick={() => toggleRead(notif.id)}
                  className={`p-lg flex items-start gap-md cursor-pointer transition-colors relative ${
                    !notif.read ? 'bg-light-surface-container-low/70' : 'hover:bg-light-surface-container-low'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-light-secondary"></span>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconContainer}`}>
                    <span className="material-symbols-outlined text-[20px]">{notif.icon}</span>
                  </div>

                  <div className="flex flex-col gap-xs flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-title-md font-bold text-light-on-surface m-0">
                        {notif.title}
                      </h3>
                      <span className="font-mono text-label-sm text-light-on-surface-variant">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="font-body text-body-md text-light-on-surface-variant m-0">
                      {notif.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Notifications;
