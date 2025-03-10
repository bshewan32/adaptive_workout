// server/models/workoutModel.js
const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  weight: { type: Number },
  reps: { type: Number, required: true },
  rpe: { type: Number, min: 1, max: 10 }
});

const exercisePerformedSchema = new mongoose.Schema({
  exerciseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exercise',
    required: true 
  },
  sets: [setSchema]
});

const recoveryFeedbackSchema = new mongoose.Schema({
  chest: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  back: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  shoulders: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  biceps: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  triceps: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  legs: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] },
  core: { type: String, enum: ['fully_recovered', 'somewhat_sore', 'very_sore'] }
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, default: Date.now },
  duration: { type: Number }, // in minutes
  exercises: [exercisePerformedSchema],
  recoveryFeedback: recoveryFeedbackSchema,
  notes: { type: String },
  rating: { type: Number, min: 1, max: 5 } // How the user felt about the workout
});

// Method to calculate total volume by muscle group
workoutSchema.methods.calculateVolumeByMuscle = async function() {
  const volumeMap = {
    chest: 0,
    back: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    legs: 0,
    core: 0
  };
  
  // Populate exercise details
  await this.populate('exercises.exerciseId');
  
  // Calculate volume for each exercise
  for (const exercisePerformed of this.exercises) {
    const exercise = exercisePerformed.exerciseId;
    const sets = exercisePerformed.sets.length;
    
    // Add volume to primary muscle group
    volumeMap[exercise.primaryMuscleGroup] += sets;
    
    // Add partial volume to secondary muscle groups (count as 0.3 per set)
    exercise.secondaryMuscleGroups.forEach(muscle => {
      volumeMap[muscle] += sets * 0.3;
    });
  }
  
  return volumeMap;
};

module.exports = mongoose.model('Workout', workoutSchema);