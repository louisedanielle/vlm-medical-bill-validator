require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve the HTML file
app.use(express.static(__dirname));

const API_KEY = process.env.MISTRAL_API_KEY;

// Proxy endpoint for Mistral API
app.post('/api/mistral', async (req, res) => {
    try {
        // Check if API key is configured
        if (!API_KEY) {
            return res.status(500).json({ 
                error: 'MISTRAL_API_KEY not configured. Please set it in .env file or environment variables.' 
            });
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 LeapStack AI Claims Server`);
    console.log(`📍 Running at: http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${API_KEY ? '✅ Configured' : '❌ MISSING - Set MISTRAL_API_KEY in .env'}`);
    console.log(`\n📋 For your manager: Just run "npm install" then "npm start"\n`);
});