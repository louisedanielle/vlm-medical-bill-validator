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

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// ✅ YOUR API ROUTES (all of them work)
const policiesRoutes = require('./routes/policies');
app.use(policiesRoutes);

// ✅ Your HTML interface at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional: API info at /api
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Medical Bill Validator API',
    endpoints: {
      '/api/mistral/clean': 'POST - Clean medical billing text',
      '/api/mistral/parse': 'POST - Parse medical bill'
    }
  });
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});