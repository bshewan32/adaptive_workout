// server/routes/exerciseRoutes.js

const express = require('express');
const router = express.Router();
const Exercise = require('../models/exerciseModel');

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercises by muscle group
router.get('/muscle/:muscleGroup', async (req, res) => {
  try {
    const muscleGroup = req.params.muscleGroup;
    
    // Find exercises where this is either the primary or a secondary muscle
    const exercises = await Exercise.find({
      $or: [
        { primaryMuscleGroup: muscleGroup },
        { secondaryMuscleGroups: muscleGroup }
      ]
    });
    
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercises by equipment
router.get('/equipment/:equipment', async (req, res) => {
  try {
    const equipment = req.params.equipment;
    const exercises = await Exercise.find({ equipment: equipment });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new exercise
router.post('/', async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    const savedExercise = await exercise.save();
    res.status(201).json(savedExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;