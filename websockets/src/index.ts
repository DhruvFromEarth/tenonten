import { WebSocket, WebSocketServer } from 'ws';
import { connectDB } from './config/db';
import { Message } from './models/Message';
import { PORT } from './config';

// Define message types
interface Message {
  type: 'message' | 'join' | 'history';
  payload: {
    roomId: string;
    userId: string;
    message: string;
    time: string;
  };
}

interface User {
  userId: string;
  roomId: string;
  ws: WebSocket;
}

// Connect to MongoDB
connectDB();

const wss = new WebSocketServer({ port: PORT });

// Use Maps for better performance when accessing data
const users = new Map<string, User>(); // userId -> User
const rooms = new Map<string, Set<string>>(); // roomId -> Set of userIds

// Helper function to broadcast to a specific room
function broadcastToRoom(roomId: string, message: Message) {
  const roomUserIds = rooms.get(roomId);
  if (!roomUserIds) return;
  
  roomUserIds.forEach(userId => {
    const user = users.get(userId);
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  });
}

// Helper function to get current time
function getCurrentTime(): string {
  return new Date().toISOString();
}

// Helper function to load chat history
async function loadChatHistory(roomId: string, ws: WebSocket) {
  try {
    const messages = await Message.find({ roomId })
      .sort({ time: 1 })
      .limit(10); // Limit to last 10 messages

    const historyMessage: Message = {
      type: 'history',
      payload: {
        roomId,
        userId: 'system',
        message: JSON.stringify(messages),
        time: getCurrentTime()
      }
    };

    ws.send(JSON.stringify(historyMessage));
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

wss.on('connection', (ws: WebSocket) => {
  // this can be used if there is no room general.
  // console.log('New client connected');

  ws.on('message', async (data: string) => {
    try {
      const message: Message = JSON.parse(data);
      
      if (message.type === 'join') {
        // Handle user joining a room
        const userId = message.payload.userId;
        const roomId = message.payload.roomId;
        
        // Remove user from previous room if they were in one
        const existingUser = users.get(userId);
        if (existingUser) {
          const oldRoom = existingUser.roomId;
          const oldRoomUsers = rooms.get(oldRoom);
          if (oldRoomUsers) {
            oldRoomUsers.delete(userId);
            if (oldRoomUsers.size === 0) {
              rooms.delete(oldRoom);
            }
          }
        }
        
        // Add user to new room
        const user: User = {
          userId,
          roomId,
          ws
        };
        users.set(userId, user);
        
        // Add user to room's set of users
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId)?.add(userId);
        
        // Load chat history for the room
        await loadChatHistory(roomId, ws);
        
        // Only broadcast join message if user is joining a new room
        if (!existingUser || existingUser.roomId !== roomId) {
          broadcastToRoom(roomId, message);
          console.log(`User ${userId} joined room ${roomId}`);
        }
      } 
      else if (message.type === 'message') {
        // Save message to MongoDB
        const newMessage = new Message({
          roomId: message.payload.roomId,
          userId: message.payload.userId,
          message: message.payload.message,
          time: new Date(message.payload.time)
        });
        await newMessage.save();

        // Broadcast message to room
        broadcastToRoom(message.payload.roomId, message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', async () => {
    // Find and remove the disconnected user
    for (const [userId, user] of users.entries()) {
      if (user.ws === ws) {
        // Remove user from room
        const roomId = user.roomId;
        const roomUsers = rooms.get(roomId);
        if (roomUsers) {
          roomUsers.delete(userId);
          if (roomUsers.size === 0) {
            rooms.delete(roomId);
          }
        }
        
        // Remove user from users map
        users.delete(userId);
        
        // Create and save leave message to MongoDB
        const leaveMessage: Message = {
          type: 'message' as const,
          payload: {
            roomId,
            userId: 'system',
            message: `${userId} has left the room`,
            time: new Date().toISOString()
          }
        };

        try {
          // Save to MongoDB
          const newMessage = new Message({
            roomId: leaveMessage.payload.roomId,
            userId: leaveMessage.payload.userId,
            message: leaveMessage.payload.message,
            time: new Date(leaveMessage.payload.time)
          });
          await newMessage.save();

          // Broadcast leave message
          broadcastToRoom(roomId, leaveMessage);
          console.log(`User ${userId} disconnected from room ${roomId}`);
        } catch (error) {
          console.error('Error saving leave message:', error);
        }
        break;
      }
    }
  });
});

console.log(`WebSocket server is running on port ${PORT}`);
