// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io logic
const userSocketMap = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Verify token (simplified for now)
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = userId;
      userSocketMap.set(userId, socket.id);
      
      // Update user status
      await User.findByIdAndUpdate(userId, {
        status: 'online',
        socketId: socket.id,
        lastSeen: new Date()
      });
      
      // Notify all users about this user's online status
      io.emit('user_status_change', { userId, status: 'online' });
    }
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);
  
  // Join user's personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle private messages
  socket.on('private_message', async (data) => {
    try {
      const { receiverId, content } = data;
      
      // Save message to database
      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content,
        status: 'sent'
      });
      
      // Populate sender info
      await message.populate('sender', 'username avatar');
      
      // Emit to receiver
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', message);
        // Update message status to delivered
        message.status = 'delivered';
        await message.save();
      }
      
      // Also send back to sender for confirmation
      socket.emit('message_sent', message);
      
    } catch (error) {
      console.error('Message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', ({ receiverId, isTyping }) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        senderId: socket.userId,
        isTyping
      });
    }
  });
  
  // Handle message read status
  socket.on('mark_as_read', async ({ messageId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: 'read' },
        { new: true }
      ).populate('sender', 'username avatar');
      
      if (message) {
        const senderSocketId = userSocketMap.get(message.sender._id.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read', message);
        }
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);
    
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
      
      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        socketId: null,
        lastSeen: new Date()
      });
      
      // Notify all users
      io.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
});