const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Import routes
const authRoutes = require('./routes/auth');
const policiesRoutes = require('./routes/policies');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', policiesRoutes);

// Serve HTML file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API info route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Medical Bill Validator API',
    endpoints: {
      '/api/auth/signup': 'POST - Sign up new company',
      '/api/auth/signin': 'POST - Sign in existing company',
      '/api/policies': 'POST - Create policy',
      '/api/policies/company/:companyId': 'GET - Get policies by company',
      '/api/mistral/clean': 'POST - Clean medical billing text',
      '/api/mistral/parse': 'POST - Parse medical bill'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Make sure MongoDB is running and the URI is correct');
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;