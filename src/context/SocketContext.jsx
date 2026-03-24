import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messageService } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:9090');
            setSocket(newSocket);
            
            newSocket.on('connect', () => {
                const userId = user._id || user.id;
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
                
                // If we are not on the messages page or not in the specific conversation,
                // we should increment the unread count for that sender
                setUnreadMessages(prev => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1
                }));
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

    return (
        <SocketContext.Provider value={{ socket, unreadMessages, clearUnread }}>
            {children}
        </SocketContext.Provider>
    );
};
