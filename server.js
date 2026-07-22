// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// LOGGING MIDDLEWARE
// ============================================
// Log all requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// ============================================
// STATIC FILES
// ============================================
app.use(express.static(__dirname));

// ============================================
// DATABASE CONNECTION
// ============================================
let isDbConnected = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('Please add MONGODB_URI to your .env file');
      return false;
    }

    console.log('📊 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    isDbConnected = true;
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    isDbConnected = false;
    
    // Retry connection after 5 seconds
    console.log('🔄 Will retry database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
    return false;
  }
};

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    },
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  };
  
  res.json(health);
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    name: 'Medical Bill Validator API',
    version: '1.0.0',
    status: 'running',
    database: {
      connected: isDbConnected,
      state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    endpoints: {
      auth: {
        signup: '/api/auth/signup (POST)',
        signin: '/api/auth/signin (POST)',
        me: '/api/auth/me (GET)'
      },
      policies: {
        list: '/api/policies/company/:companyId (GET)',
        create: '/api/policies (POST)',
        get: '/api/policies/:id (GET)',
        update: '/api/policies/:id (PUT)',
        delete: '/api/policies/:id (DELETE)'
      },
      mistral: {
        clean: '/api/mistral/clean (POST)',
        parse: '/api/mistral/parse (POST)',
        vlm: '/api/mistral/vlm (POST)',
        chat: '/api/mistral/chat (POST)'
      },
      health: '/health (GET)'
    }
  });
});

// Import routes
let authRoutes, policiesRoutes;

try {
  authRoutes = require('./routes/auth');
  policiesRoutes = require('./routes/policies');
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', policiesRoutes);

// ============================================
// SERVE HTML FILE AT ROOT
// ============================================
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        error: 'index.html not found',
        message: 'Please ensure index.html exists in the root directory'
      });
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).json({
      error: 'Error serving page'
    });
  }
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  console.log(`⚠️ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
    message: 'The requested endpoint does not exist'
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Determine error type and status code
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    errorMessage = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Token expired';
  } else if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    errorMessage = 'Database connection unavailable';
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(process.env.NODE_ENV === 'development' && { details: err })
  });
});

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log(`\n🏥 Medical Bill Validator is ready!\n`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Received shutdown signal. Closing server...');
      server.close(() => {
        console.log('👋 Server closed. Goodbye!');
        mongoose.connection.close(false, () => {
          console.log('📊 Database connection closed.');
          process.exit(0);
        });
      });
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  // Don't exit in production; log the error and continue
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Uncaught exception caught but server will continue running');
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', {
    reason: reason,
    promise: promise
  });
  // Don't exit in production; log the error and continue
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Unhandled rejection caught but server will continue running');
  } else {
    process.exit(1);
  }
});

module.exports = app;