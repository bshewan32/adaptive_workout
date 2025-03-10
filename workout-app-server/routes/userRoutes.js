// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Get a user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user profile
// Inside the POST route in userRoutes.js
router.post('/', async (req, res) => {
  try {
    console.log('Received user data:', JSON.stringify(req.body));
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('User creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a user profile
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
