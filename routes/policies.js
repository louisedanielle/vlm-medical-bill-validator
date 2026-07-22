const express = require('express');
const router = express.Router();
const Policy = require('../models/policy');

// Get all policies for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const policies = await Policy.find({ 
      companyId: req.params.companyId 
    }).sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new policy with extracted text
router.post('/', async (req, res) => {
  try {
    const { companyId, name, text, extractedText, fileInfo } = req.body;
    
    const policyData = {
      companyId,
      name,
      text,
      extractedText: extractedText || text, // Use extracted text or fallback to text
      fileInfo: fileInfo || {}
    };
    
    const policy = new Policy(policyData);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    console.error('Error saving policy:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get single policy
router.get('/:id', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update policy
router.put('/:id', async (req, res) => {
  try {
    const { name, text, extractedText } = req.body;
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        text, 
        extractedText: extractedText || text,
        updatedAt: Date.now() 
      },
      { new: true }
    );
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete policy
router.delete('/:id', async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean policy text with AI (MOVED TO ROUTER)
router.post('/api/mistral/clean', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a precise medical bill cleaner. Return ONLY the cleaned text.' },
          { role: 'user', content: `Clean this extracted text by removing duplicates, page numbers, and formatting artifacts. Keep only the main content.\n\n${text}` }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    res.json({ cleanedText: data.choices[0].message.content });
  } catch (error) {
    console.error('Clean API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse bill with AI (MOVED TO ROUTER)
router.post('/api/mistral/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const prompt = `You are an expert medical bill parser. Extract ALL information from this Hong Kong hospital bill and return ONLY valid JSON.

OUTPUT FORMAT:
{
  "hospital": "Hospital Name or null",
  "billNumber": "Bill number or null",
  "patientName": "Patient name or null",
  "patientId": "Patient ID or null",
  "admissionDate": "YYYY-MM-DD or null",
  "dischargeDate": "YYYY-MM-DD or null",
  "depositPaid": 0.00,
  "grandTotal": 0.00,
  "balanceDue": 0.00,
  "charges": [
    {
      "date": "YYYY-MM-DD or null",
      "code": "Charge code or null",
      "description": "Charge description",
      "category": "accommodation|laboratory|pharmacy|treatment|surgery|cardiac|dietary|supplies|doctor_fee|admission|other",
      "amount": 0.00,
      "discount": 0.00
    }
  ],
  "notes": "Any additional notes or null"
}

BILL TEXT:
${text}

Return ONLY the JSON.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a precise medical bill parser. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const jsonStr = data.choices[0].message.content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error('Parse API error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;