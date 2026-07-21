const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');

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

module.exports = router;