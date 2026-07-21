const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Save bill data
router.post('/', async (req, res) => {
  try {
    const billData = req.body;
    const bill = new Bill(billData);
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get bills for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const bills = await Bill.find({ 
      companyId: req.params.companyId 
    }).sort({ createdAt: -1 }).limit(50);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;