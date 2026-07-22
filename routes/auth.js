// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// ============================================
// SIGNUP ROUTE
// ============================================
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup attempt for:', req.body.companyId);
    
    const { companyId, companyName, password } = req.body;
    
    // Validate input
    const errors = [];
    if (!companyId || companyId.trim() === '') {
      errors.push('Company ID is required');
    }
    if (!companyName || companyName.trim() === '') {
      errors.push('Company Name is required');
    }
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ companyId: companyId.trim() });
    if (existingUser) {
      console.log('⚠️ User already exists:', companyId);
      return res.status(409).json({
        success: false,
        error: 'Company ID already registered. Please choose a different ID or sign in.'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      companyId: companyId.trim(),
      companyName: companyName.trim(),
      password: hashedPassword
    });
    
    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User created successfully:', user.companyId);
    
    // Return success without password
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in.',
      user: {
        companyId: user.companyId,
        companyName: user.companyName,
        _id: user._id
      }
    });
    
  } catch (error) {
    console.error('❌ Signup error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Company ID already exists. Please choose a different ID.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    // Handle database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({
        success: false,
        error: 'Database connection error. Please try again later.'
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error. Please try again later.'
    });
  }
});

// ============================================
// SIGNIN ROUTE
// ============================================
router.post('/signin', async (req, res) => {
  try {
    console.log('🔑 Signin attempt for:', req.body.companyId);
    
    const { companyId, password } = req.body;
    
    // Validate input
    if (!companyId || companyId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    if (!password || password.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // Find user
    const user = await User.findOne({ companyId: companyId.trim() });
    if (!user) {
      console.log('⚠️ User not found:', companyId);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your Company ID and password.'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('⚠️ Invalid password for:', companyId);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your Company ID and password.'
      });
    }
    
    // Return user data without password
    const userData = {
      companyId: user.companyId,
      companyName: user.companyName,
      _id: user._id
    };
    
    console.log('✅ User signed in successfully:', user.companyId);
    
    res.json({
      success: true,
      message: 'Welcome back!',
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Signin error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // Handle database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({
        success: false,
        error: 'Database connection error. Please try again later.'
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error. Please try again later.'
    });
  }
});

// ============================================
// GET CURRENT USER (for session validation)
// ============================================
router.get('/me', async (req, res) => {
  try {
    // This would typically use JWT or session
    // For now, we'll just return a simple response
    res.json({
      success: true,
      message: 'Session validation endpoint'
    });
  } catch (error) {
    console.error('❌ Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;