// server/routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');

// Get all workouts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .populate('exercises.exerciseId');
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific workout
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exerciseId');
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout
router.post('/', async (req, res) => {
  try {
    const workout = new Workout(req.body);
    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update workout with recovery feedback
router.patch('/:id/recovery', async (req, res) => {
  try {
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      { recoveryFeedback: req.body },
      { new: true }
    );
    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get muscle metrics for a user (last 7 days of training)
router.get('/metrics/:userId', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find all workouts in the last 7 days
    const recentWorkouts = await Workout.find({
      userId: req.params.userId,
      date: { $gte: oneWeekAgo }
    }).populate('exercises.exerciseId');

    // Calculate weekly volume per muscle group
    const muscleMetrics = {
      chest: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      back: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      shoulders: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      biceps: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      triceps: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      legs: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
      core: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 }
    };

    // Muscle group date tracking
    const muscleLastTrained = {
      chest: null,
      back: null,
      shoulders: null,
      biceps: null,
      triceps: null,
      legs: null,
      core: null
    };

    // Process each workout
    for (const workout of recentWorkouts) {
      const workoutDate = new Date(workout.date);
      
      // Calculate volume for this workout
      for (const exercisePerformed of workout.exercises) {
        const exercise = exercisePerformed.exerciseId;
        if (!exercise) continue;
        
        const sets = exercisePerformed.sets.length;
        const primaryMuscle = exercise.primaryMuscleGroup;
        
        // Add volume to primary muscle
        muscleMetrics[primaryMuscle].weeklyVolume += sets;
        
        // Track last trained date for this muscle
        if (!muscleLastTrained[primaryMuscle] || workoutDate > muscleLastTrained[primaryMuscle]) {
          muscleLastTrained[primaryMuscle] = workoutDate;
        }
        
        // Add partial volume to secondary muscles (0.3 per set)
        exercise.secondaryMuscleGroups.forEach(secondaryMuscle => {
          muscleMetrics[secondaryMuscle].weeklyVolume += (sets * 0.3);
          
          // Track last trained date for secondary muscles
          if (!muscleLastTrained[secondaryMuscle] || workoutDate > muscleLastTrained[secondaryMuscle]) {
            muscleLastTrained[secondaryMuscle] = workoutDate;
          }
        });
      }
      
      // Use recovery feedback if available
      if (workout.recoveryFeedback) {
        Object.entries(workout.recoveryFeedback).forEach(([muscle, status]) => {
          if (status === 'very_sore') {
            muscleMetrics[muscle].recoveryStatus = Math.min(muscleMetrics[muscle].recoveryStatus, 60);
          } else if (status === 'somewhat_sore') {
            muscleMetrics[muscle].recoveryStatus = Math.min(muscleMetrics[muscle].recoveryStatus, 80);
          }
        });
      }
    }
    
    // Update last trained dates
    Object.entries(muscleLastTrained).forEach(([muscle, date]) => {
      if (date) {
        muscleMetrics[muscle].lastTrainedDate = date;
        
        // Calculate recovery status based on days since last trained
        // (if we don't have explicit recovery feedback)
        if (muscleMetrics[muscle].recoveryStatus === 100) {
          const daysSinceLastTrained = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
          if (daysSinceLastTrained <= 1) {
            muscleMetrics[muscle].recoveryStatus = 70; // 1 day - 70% recovered
          } else if (daysSinceLastTrained === 2) {
            muscleMetrics[muscle].recoveryStatus = 85; // 2 days - 85% recovered
          } // 3+ days - stays at 100%
        }
      }
    });
    
    res.json(muscleMetrics);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;