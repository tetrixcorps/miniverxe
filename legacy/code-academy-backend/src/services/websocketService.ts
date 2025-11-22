import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface CollaborationRoom {
  id: string;
  participants: Map<string, AuthenticatedSocket>;
  code: string;
  language: string;
  lastModified: Date;
  cursors: Map<string, { line: number; column: number }>;
}

class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer;
  private collaborationRooms: Map<string, CollaborationRoom> = new Map();

  private constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  public static getInstance(io: SocketIOServer): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(io);
    }
    return WebSocketService.instance;
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        if (decoded.type !== 'access') {
          return next(new Error('Invalid token type'));
        }

        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, username: true, isActive: true },
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user.id;
        socket.username = user.username;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.username} (${socket.userId})`);

      // Join collaboration room
      socket.on('join-collaboration', async (data: { roomId: string; lessonId?: string; exerciseId?: string }) => {
        try {
          const { roomId, lessonId, exerciseId } = data;
          
          // Leave any existing rooms
          socket.rooms.forEach(room => {
            if (room !== socket.id) {
              socket.leave(room);
            }
          });

          // Join the new room
          await socket.join(roomId);

          // Get or create collaboration room
          let room = this.collaborationRooms.get(roomId);
          if (!room) {
            room = {
              id: roomId,
              participants: new Map(),
              code: '',
              language: 'javascript',
              lastModified: new Date(),
              cursors: new Map(),
            };
            this.collaborationRooms.set(roomId, room);
          }

          // Add participant
          room.participants.set(socket.userId!, socket);

          // Send current room state to the new participant
          socket.emit('room-state', {
            code: room.code,
            language: room.language,
            participants: Array.from(room.participants.values()).map(s => ({
              id: s.userId,
              username: s.username,
            })),
            cursors: Object.fromEntries(room.cursors),
          });

          // Notify other participants
          socket.to(roomId).emit('participant-joined', {
            id: socket.userId,
            username: socket.username,
          });

          logger.info(`User ${socket.username} joined collaboration room ${roomId}`);
        } catch (error) {
          logger.error('Error joining collaboration room:', error);
          socket.emit('error', { message: 'Failed to join collaboration room' });
        }
      });

      // Handle code changes
      socket.on('code-change', (data: { roomId: string; code: string; language?: string }) => {
        try {
          const { roomId, code, language } = data;
          const room = this.collaborationRooms.get(roomId);

          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Update room state
          room.code = code;
          if (language) {
            room.language = language;
          }
          room.lastModified = new Date();

          // Broadcast to other participants
          socket.to(roomId).emit('code-updated', {
            code,
            language: room.language,
            userId: socket.userId,
            username: socket.username,
            timestamp: room.lastModified,
          });

          logger.debug(`Code updated in room ${roomId} by ${socket.username}`);
        } catch (error) {
          logger.error('Error handling code change:', error);
          socket.emit('error', { message: 'Failed to update code' });
        }
      });

      // Handle cursor position changes
      socket.on('cursor-change', (data: { roomId: string; line: number; column: number }) => {
        try {
          const { roomId, line, column } = data;
          const room = this.collaborationRooms.get(roomId);

          if (!room) {
            return;
          }

          // Update cursor position
          room.cursors.set(socket.userId!, { line, column });

          // Broadcast to other participants
          socket.to(roomId).emit('cursor-updated', {
            userId: socket.userId,
            username: socket.username,
            line,
            column,
          });
        } catch (error) {
          logger.error('Error handling cursor change:', error);
        }
      });

      // Handle chat messages
      socket.on('chat-message', async (data: { roomId: string; message: string; type?: string }) => {
        try {
          const { roomId, message, type = 'text' } = data;
          
          // Save message to database
          const chatMessage = await prisma.message.create({
            data: {
              sessionId: roomId,
              userId: socket.userId!,
              content: message,
              messageType: type.toUpperCase() as any,
            },
          });

          // Broadcast to all participants in the room
          this.io.to(roomId).emit('chat-message', {
            id: chatMessage.id,
            userId: socket.userId,
            username: socket.username,
            message,
            type,
            timestamp: chatMessage.createdAt,
          });

          logger.info(`Chat message in room ${roomId} from ${socket.username}`);
        } catch (error) {
          logger.error('Error handling chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle AI assistance requests
      socket.on('ai-assistance', async (data: { roomId: string; question: string; code?: string; language?: string }) => {
        try {
          const { roomId, question, code, language } = data;
          
          // Emit loading state
          socket.emit('ai-response', {
            type: 'loading',
            message: 'AI is thinking...',
          });

          // Import AI service dynamically to avoid circular dependencies
          const { AIService } = await import('./aiService');
          const aiService = AIService.getInstance();

          const response = await aiService.getCodingAssistance(question, {
            language,
            code,
            userId: socket.userId,
          });

          // Broadcast AI response to all participants
          this.io.to(roomId).emit('ai-response', {
            type: 'response',
            question,
            response: response.response,
            code: response.code,
            explanation: response.explanation,
            suggestions: response.suggestions,
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date(),
          });

          logger.info(`AI assistance provided in room ${roomId} by ${socket.username}`);
        } catch (error) {
          logger.error('Error handling AI assistance:', error);
          socket.emit('ai-response', {
            type: 'error',
            message: 'Failed to get AI assistance. Please try again.',
          });
        }
      });

      // Handle voice input
      socket.on('voice-input', async (data: { roomId: string; audioData: string }) => {
        try {
          const { roomId, audioData } = data;
          
          // Convert base64 audio to buffer
          const audioBuffer = Buffer.from(audioData, 'base64');
          
          // Import AI service dynamically
          const { AIService } = await import('./aiService');
          const aiService = AIService.getInstance();

          // Transcribe speech to text
          const transcript = await aiService.transcribeSpeech(audioBuffer);
          
          // Broadcast transcript
          this.io.to(roomId).emit('voice-transcript', {
            transcript,
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date(),
          });

          logger.info(`Voice input transcribed in room ${roomId} by ${socket.username}`);
        } catch (error) {
          logger.error('Error handling voice input:', error);
          socket.emit('error', { message: 'Failed to process voice input' });
        }
      });

      // Handle participant leaving
      socket.on('leave-collaboration', (data: { roomId: string }) => {
        try {
          const { roomId } = data;
          const room = this.collaborationRooms.get(roomId);

          if (room) {
            // Remove participant
            room.participants.delete(socket.userId!);
            room.cursors.delete(socket.userId!);

            // Notify other participants
            socket.to(roomId).emit('participant-left', {
              id: socket.userId,
              username: socket.username,
            });

            // Clean up empty rooms
            if (room.participants.size === 0) {
              this.collaborationRooms.delete(roomId);
            }
          }

          socket.leave(roomId);
          logger.info(`User ${socket.username} left collaboration room ${roomId}`);
        } catch (error) {
          logger.error('Error leaving collaboration room:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.username} (${socket.userId})`);

        // Remove from all collaboration rooms
        this.collaborationRooms.forEach((room, roomId) => {
          if (room.participants.has(socket.userId!)) {
            room.participants.delete(socket.userId!);
            room.cursors.delete(socket.userId!);

            // Notify other participants
            socket.to(roomId).emit('participant-left', {
              id: socket.userId,
              username: socket.username,
            });

            // Clean up empty rooms
            if (room.participants.size === 0) {
              this.collaborationRooms.delete(roomId);
            }
          }
        });
      });
    });
  }

  // Get collaboration room state
  public getRoomState(roomId: string) {
    const room = this.collaborationRooms.get(roomId);
    if (!room) {
      return null;
    }

    return {
      id: room.id,
      code: room.code,
      language: room.language,
      participants: Array.from(room.participants.values()).map(s => ({
        id: s.userId,
        username: s.username,
      })),
      cursors: Object.fromEntries(room.cursors),
      lastModified: room.lastModified,
    };
  }

  // Get all active rooms
  public getActiveRooms() {
    return Array.from(this.collaborationRooms.entries()).map(([id, room]) => ({
      id,
      participantCount: room.participants.size,
      lastModified: room.lastModified,
    }));
  }
}

// Initialize WebSocket service
export const initializeWebSocket = (io: SocketIOServer) => {
  const wsService = WebSocketService.getInstance(io);
  logger.info('WebSocket service initialized successfully');
  return wsService;
};

export default WebSocketService;
