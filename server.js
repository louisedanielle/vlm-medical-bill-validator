require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // For development - restrict in production
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/policies', require('./routes/policies'));
app.use('/api/bills', require('./routes/bills'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - GET  /api/policies/company/:companyId`);
  console.log(`   - POST /api/policies`);
  console.log(`   - DELETE /api/policies/:id`);
  console.log(`   - POST /api/bills`);
  console.log(`   - GET  /api/bills/company/:companyId`);
});