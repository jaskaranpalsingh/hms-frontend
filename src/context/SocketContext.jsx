import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messageService, notificationService } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            const userId = user._id || user.id;
            
            // Fetch initial notifications
            const fetchNotifications = async () => {
                try {
                    const res = await notificationService.getNotifications(userId);
                    setNotifications(res.data.data);
                } catch (err) {
                    console.error('Failed to fetch notifications:', err);
                }
            };
            fetchNotifications();

            const newSocket = io('http://localhost:9090');
            setSocket(newSocket);
            
            newSocket.on('connect', () => {
                newSocket.emit('join', userId);
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket connection error:', err.message);
            });

            newSocket.on('new_message', (message) => {
                const senderId = String(message.sender?._id || message.sender?.id || message.sender);
                const currentUserId = String(user._id || user.id);

                if (senderId === currentUserId) return;

                console.log('📬 Socket received message from:', senderId);
                
                setUnreadMessages(prev => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1
                }));
            });

            newSocket.on('new_notification', (notification) => {
                console.log('🔔 Socket received notification:', notification);
                setNotifications(prev => [notification, ...prev]);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    const clearUnread = async (partnerId) => {
        try {
            await messageService.markConversationAsRead(partnerId);
            setUnreadMessages(prev => {
                const updated = { ...prev };
                delete updated[partnerId];
                return updated;
            });
        } catch (err) {
            console.error('Failed to sync read status:', err);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllNotificationsAsRead = async () => {
        if (!user) return;
        const userId = user._id || user.id;
        try {
            await notificationService.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    return (
        <SocketContext.Provider value={{ 
            socket, 
            unreadMessages, 
            clearUnread, 
            notifications, 
            markNotificationAsRead,
            markAllNotificationsAsRead
        }}>
            {children}
        </SocketContext.Provider>
    );
};
