const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const policiesRoutes = require('./routes/policies');

// Use routes - this makes all routes in policies.js available
app.use(policiesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medical Bill Validator API',
    endpoints: {
      '/api/mistral/clean': 'POST - Clean medical billing text',
      '/api/mistral/parse': 'POST - Parse medical bill',
      '/company/:companyId': 'GET - Get policies by company',
      '/:id': 'GET - Get single policy'
    }
  });
});

// MongoDB connection (if using)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-bills')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;