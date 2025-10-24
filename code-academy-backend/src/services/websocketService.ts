import { Server as SocketIOServer } from 'socket.io';

export const initializeWebSocket = (io: SocketIOServer) => {
  console.log('🔌 WebSocket Service initialized');
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Join room for real-time collaboration
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
    
    // Leave room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });
    
    // Handle code collaboration
    socket.on('code-change', (data: { roomId: string; code: string; userId: string }) => {
      socket.to(data.roomId).emit('code-update', {
        code: data.code,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Handle cursor position
    socket.on('cursor-move', (data: { roomId: string; position: any; userId: string }) => {
      socket.to(data.roomId).emit('cursor-update', {
        position: data.position,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Handle chat messages
    socket.on('chat-message', (data: { roomId: string; message: string; userId: string; username: string }) => {
      io.to(data.roomId).emit('new-message', {
        message: data.message,
        userId: data.userId,
        username: data.username,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  
  return io;
};