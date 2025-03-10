// server/models/exerciseModel.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  primaryMuscleGroup: { 
    type: String, 
    required: true,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core']
  },
  secondaryMuscleGroups: [{ 
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core']
  }],
  exerciseType: {
    type: String,
    enum: ['compound', 'isolation'],
    required: true
  },
  equipment: [{
    type: String,
    enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'bands', 'bench', 'ab wheel', 'other']
  }],
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  instructions: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String }
});

module.exports = mongoose.model('Exercise', exerciseSchema);