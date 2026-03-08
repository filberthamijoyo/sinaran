'use client';

import { useNotifications } from '../lib/useNotifications';

export default function NotificationToast() {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999,
    }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: n.type === 'success' ? '#065f46'
            : n.type === 'error' ? '#991b1b' : '#1e40af',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          minWidth: 280,
          maxWidth: 380,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: 13,
          animation: 'slideIn 0.2s ease',
        }}>
          <span>{n.message}</span>
          <button onClick={() => dismiss(n.id)} style={{
            background: 'none', border: 'none', color: 'white',
            cursor: 'pointer', marginLeft: 12, fontSize: 16, lineHeight: 1,
            opacity: 0.7,
          }}>×</button>
        </div>
      ))}
    </div>
  );
}
