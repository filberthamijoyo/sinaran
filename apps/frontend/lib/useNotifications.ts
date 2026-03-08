'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, getUser } from './auth';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  kp?: string;
  timestamp: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
    const port = process.env.NEXT_PUBLIC_API_PORT || '3001';
    const socketUrl = `${apiUrl}:${port}`;

    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('register', user.id);
    });

    socketRef.current.on('sc_approved', (data: { kp: string; message: string }) => {
      addNotification({
        message: data.message || `KP ${data.kp} has been approved ✓`,
        type: 'success',
        kp: data.kp,
      });
    });

    socketRef.current.on('sc_rejected', (data: { kp: string; message: string }) => {
      addNotification({
        message: data.message || `KP ${data.kp} was not approved`,
        type: 'error',
        kp: data.kp,
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp'>) => {
    const notif: Notification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== notif.id));
    }, 6000);
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(x => x.id !== id));
  };

  return { notifications, dismiss };
};
