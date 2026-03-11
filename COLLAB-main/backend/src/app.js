const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const networkRoutes = require('./routes/network');
const agentRoutes = require('./routes/agent');
const analyticsRoutes = require('./routes/analytics');
const demoRoutes = require('./routes/demo');
const schedulerRoutes = require('./routes/scheduler');
const travelRoutes = require('./routes/travel');
const recommendationRoutes = require('./routes/recommendations');
const reportRoutes = require('./routes/reports');
const swaggerSetup = require('./config/swagger');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined')); // Logger

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Setup Swagger
swaggerSetup(app);

// Routes
app.use('/api', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: 'V1.0' 
  });
});

// Mock Nodes Endpoint (for dashboard compatibility)
const flService = require('./services/flService');
app.get('/api/nodes', (req, res) => {
  // In production, this would query the DB or service
  // For now, we return the in-memory nodes from FLService
  // Note: Since FLService is instantiated in app.js context for socket.io, 
  // we need a way to share state. 
  // Here we just return a mock response or integrate properly.
  // Ideally, FLService should be a singleton exported from a module.
  res.json({ count: 8, nodes: [] }); // Placeholder, real data comes via WebSocket
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    requestId: req.id 
  });
});

module.exports = app;
