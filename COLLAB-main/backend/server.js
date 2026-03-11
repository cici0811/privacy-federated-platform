const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const flService = require('./src/services/flService');
const authService = require('./src/services/authService');
const db = require('./src/models/db');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Seed Admin User
authService.seedAdmin();

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// WebSocket Event Handling
io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);
  
  // Register new node
  const node = flService.registerNode(socket.id, { id: socket.handshake.query.nodeId });
  
  // Broadcast updated node count
  io.emit('network-update', { 
    count: flService.getNodes().length, 
    nodes: flService.getNodes() 
  });

  // Handle local model update (Mock Gradient Upload)
  socket.on('model-update', async (data) => {
    console.log(`[FL] Received model update from ${socket.id}`);
    
    // Process gradient securely
    const result = await flService.processGradient(socket.id, data);
    
    if (result.newRound) {
      io.emit('global-model-updated', { 
        round: result.round, 
        modelHash: result.hash,
        accuracy: result.accuracy,
        loss: result.loss
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    flService.unregisterNode(socket.id);
    io.emit('network-update', { 
      count: flService.getNodes().length, 
      nodes: flService.getNodes() 
    });
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Secret Collab Backend (Production Grade) 🛡️
  ################################################
  Server listening on port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Database: NeDB (Embedded Persistent)
  Security: Helmet, RateLimit, JWT
  ################################################
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close DB connections if necessary
  });
});
