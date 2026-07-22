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
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// --- Existing Routes ---
app.use('/api/policies', require('./routes/policies'));
app.use('/api/bills', require('./routes/bills'));

// --- NEW: Proxy Routes for Mistral API ---

// Proxy for Mistral text completion
app.post('/api/mistral/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;
    const mistralModel = model || 'mistral-small-latest';
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: mistralModel,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Mistral API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy for Mistral VLM (Pixtral) OCR
app.post('/api/mistral/vlm', async (req, res) => {
  try {
    const { imageData, pageNum, totalPages } = req.body;
    const base64Image = imageData.split(',')[1];
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `Extract ALL text from this medical bill page (${pageNum}/${totalPages}). Return ONLY the text content.` },
            { type: 'image_url', image_url: `data:image/jpeg;base64,${base64Image}` }
          ]
        }],
        max_tokens: 4096,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Mistral API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/mistral/chat (Proxy)`);
  console.log(`   - POST /api/mistral/vlm (Proxy)`);
});