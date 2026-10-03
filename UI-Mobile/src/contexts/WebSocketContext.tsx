import { Client } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import 'text-encoding';
import { AuthContext } from './AuthContext';



export const WebSocketContext = createContext<any | null>(null);

const WS_URL = 'ws://10.0.2.2:8080/ws';
const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  if (!auth) {
    return null;
  }
  const { user } = auth;
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    //we only connect to websockets if the user is logged in
    if (!user) {
      if (stompClient) {
        stompClient.deactivate();
        setIsConnected(false);
      }
      return;
    }
    const connectWebSocket = async () => {
      const token = await SecureStore.getItemAsync('token');

      const client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        //we use text to force the polyfill to handle the parsing properly
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        debug: (str) => {
          // console.log(str);
        },
        onConnect: () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        },
      }
      );


      //start the connection
      client.activate();
      setStompClient(client);
    };
    connectWebSocket();

    //cleanup function : disconnect the user logs out or close the app
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };

  }, [user]);


  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketProvider;

