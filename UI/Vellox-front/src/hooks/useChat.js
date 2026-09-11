import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { WebSocketContext } from '../contexts/WebSocketContext';
import { AuthContext } from '../contexts/AuthContext';

export const useChat = (activeConversation) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { stompClient, isConnected } = useContext(WebSocketContext);
  const { user } = useContext(AuthContext);

  // Normalize conversation object
  const conv = typeof activeConversation === 'string' 
    ? { type: 'room', id: activeConversation } 
    : activeConversation;

  const type = conv?.type;
  const targetId = conv?.id;

  // 1. Fetch Historical Messages via REST
  useEffect(() => {
    if (!targetId || !type) {
      setMessages([]);
      return;
    }
    
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const url = type === 'direct' 
          ? `/messages/private/${targetId}` 
          : `/messages/room/${targetId}`;
        const response = await api.get(url);
        if (isMounted) {
          setMessages(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [type, targetId]);

  // 2. Subscribe to Live Messages via WebSockets
  useEffect(() => {
    if (!targetId || !type || !isConnected || !stompClient) return;

    let subscription = null;

    if (type === 'room') {
      subscription = stompClient.subscribe(`/topic/room/${targetId}`, (messageOutput) => {
        try {
          const newMessage = JSON.parse(messageOutput.body);
          setMessages((prev) => {
            // Avoid duplicate messages if already present
            if (prev.some((m) => m.id && newMessage.id && m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        } catch (e) {
          console.error("Error parsing room message:", e);
        }
      });
    } else if (type === 'direct') {
      subscription = stompClient.subscribe('/user/queue/messages', (messageOutput) => {
        try {
          const newMessage = JSON.parse(messageOutput.body);
          // Check if message belongs to the currently active direct conversation
          const isRelated = 
            (newMessage.senderId === targetId && newMessage.receiverId === user?.id) ||
            (newMessage.senderId === user?.id && newMessage.receiverId === targetId);

          if (isRelated) {
            setMessages((prev) => {
              if (prev.some((m) => m.id && newMessage.id && m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        } catch (e) {
          console.error("Error parsing private message:", e);
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [type, targetId, isConnected, stompClient, user?.id]);

  // 3. Send Message Function
  const sendMessage = useCallback((content) => {
    if (!stompClient || !isConnected || !content?.trim() || !targetId) return;

    if (type === 'direct') {
      stompClient.publish({
        destination: '/app/chat.private',
        body: JSON.stringify({
          content: content.trim(),
          targetId: targetId
        }),
      });
    } else {
      stompClient.publish({
        destination: `/app/chat.room/${targetId}`,
        body: JSON.stringify({
          content: content.trim(),
          targetId: targetId
        }),
      });
    }
  }, [stompClient, isConnected, type, targetId]);

  return { messages, sendMessage, isLoading };
};