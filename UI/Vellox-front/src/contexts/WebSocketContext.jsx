import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { AuthContext } from './AuthContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only attempt to connect if the user is fully logged in and has a token
    if (!user || !user.token) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8100/ws', // Your Spring Boot WebSocket endpoint
      connectHeaders: {
        // This is caught by the ChannelInterceptor we wrote in Spring Boot!
        Authorization: `Bearer ${user.token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Comment this out in production, but it's great for seeing the live traffic right now
        console.log(str);
      },
    });

    client.onConnect = (frame) => {
      console.log('Successfully connected to Vellox Real-Time Broker!');
      setIsConnected(true);
    };

    client.onWebSocketError = (event) => {
      console.error('WebSocket Error: ', event);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Activate the connection
    client.activate();
    setStompClient(client);

    // Cleanup function: Disconnects when the user logs out or closes the app
    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};