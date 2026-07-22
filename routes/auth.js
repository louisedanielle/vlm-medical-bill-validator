const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { companyId, companyName, password } = req.body;
    
    // Validate input
    if (!companyId || !companyName || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ companyId });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company ID already exists. Please choose another.' 
      });
    }
    
    // Create new user
    const user = new User({ 
      companyId, 
      companyName, 
      password 
    });
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully! Please sign in.',
      user: { 
        companyId: user.companyId, 
        companyName: user.companyName 
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { companyId, password } = req.body;
    
    if (!companyId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company ID and password are required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ companyId });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Company ID not found. Please sign up first.' 
      });
    }
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password. Please try again.' 
      });
    }
    
    res.json({ 
      success: true, 
      user: { 
        companyId: user.companyId, 
        companyName: user.companyName 
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.' 
    });
  }
});

// Get user info (for session validation)
router.get('/user/:companyId', async (req, res) => {
  try {
    const user = await User.findOne({ companyId: req.params.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      companyId: user.companyId, 
      companyName: user.companyName 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;