import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, collection, query, where, onSnapshot, doc, updateDoc, messaging, getToken } from '../utils/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() { return useContext(NotificationContext); }

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !db) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
      }, (error) => {
        console.error('Notification stream failed:', error);
        setNotifications([]);
        setUnreadCount(0);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to start notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
