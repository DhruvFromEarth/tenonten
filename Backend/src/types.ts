import { WebSocket } from 'ws';

export interface Message {
  type: 'message' | 'join' | 'history';
  payload: {
    roomId: string;
    userName: string;
    message: string;
    time: string;
  };
}

export interface User {
  userName: string;
  roomId: string;
  ws: WebSocket;
}
