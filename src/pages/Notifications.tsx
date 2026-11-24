import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { NotificationItem } from '../types';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await dataService.getNotifications(user?.id);
      setNotifications(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    await dataService.markNotificationRead(id);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await dataService.markAllNotificationsRead();
    await loadNotifications();
  };

  const shown = filterUnread ? notifications.filter((n) => !n.read) : notifications;

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1000px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Notification Center
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Payment hold alerts, registration confirmations, cancellation refunds, and club dispatches.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => setFilterUnread(!filterUnread)}
              className={`px-md py-xs rounded font-label text-label-md border cursor-pointer ${
                filterUnread
                  ? 'bg-light-primary text-light-on-primary border-light-primary'
                  : 'bg-light-surface-container-lowest text-light-on-surface border-light-outline-variant'
              }`}
            >
              {filterUnread ? 'Showing Unread' : 'Unread Only'}
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-md py-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface font-label text-label-md font-semibold cursor-pointer"
            >
              Mark All Read
            </button>
          </div>
        </header>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm divide-y divide-light-outline-variant overflow-hidden">
          {loading ? (
            <div className="p-xl text-center text-light-on-surface-variant">Loading alerts...</div>
          ) : shown.length === 0 ? (
            <div className="p-xl text-center text-light-on-surface-variant">No notifications to display.</div>
          ) : (
            shown.map((notif) => (
              <div
                key={notif.id}
                className={`p-lg flex items-start justify-between gap-md ${
                  !notif.read ? 'bg-light-primary-container/5' : ''
                }`}
              >
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-[24px] text-light-primary mt-0.5">
                    {notif.icon || 'notifications'}
                  </span>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-xs">
                      <h2 className="font-title text-title-md text-light-on-surface font-semibold m-0">
                        {notif.title}
                      </h2>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-light-primary" />}
                    </div>
                    <p className="font-body text-body-md text-light-on-surface-variant m-0">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-md text-label-sm">
                      <span className="text-light-on-surface-variant">{notif.timestamp}</span>
                      {notif.link && (
                        <Link to={notif.link} className="text-light-primary font-semibold no-underline hover:underline">
                          Open Action →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notif.id)}
                    className="px-sm py-xs rounded border border-light-outline-variant bg-transparent text-light-on-surface-variant font-label text-label-sm cursor-pointer shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </AppLayout>
  );
};

export default Notifications;
