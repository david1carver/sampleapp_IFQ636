// frontend/src/components/mesa/NotificationBell.jsx
// In-app notifications bell (A2 feature). Shows an unread badge and a dropdown
// list; marks items read. Uses the shared axiosInstance (token auto-attached)
// and the Mesa Tailwind tokens. Renders nothing for unauthenticated users.

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/notifications/unread/count');
      setUnread(data.count || 0);
    } catch (e) {
      /* unauthenticated or offline — ignore */
    }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/notifications');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    }
  }, []);

  // Poll the unread count on mount and every 30s while logged in.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated, fetchUnread]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) fetchList();
  }

  async function markRead(id) {
    try {
      await axiosInstance.put(`/api/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (e) {
      /* ignore */
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-2 text-foreground hover:text-primary transition-colors"
      >
        {/* bell icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 bg-card border border-border rounded-lg shadow-[0_8px_24px_rgba(31,26,18,0.12)]">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
            </div>
            {items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                No notifications yet.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-border last:border-0 ${n.read ? 'opacity-60' : ''}`}
                >
                  <p className="text-sm text-foreground">{n.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n._id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
