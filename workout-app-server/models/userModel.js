const mongoose = require('mongoose');

const muscleGroupSettingSchema = new mongoose.Schema({
  minimumDose: { type: Number, required: true },
  focusTarget: { type: Number, required: true },
  recoveryRate: { type: Number, required: true }
}, { _id: false }); // Add { _id: false } to prevent Mongoose from adding an _id

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  experienceLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate' 
  },
  availableEquipment: [{ type: String }],
  trainingGoal: { 
    type: String, 
    enum: ['strength', 'hypertrophy', 'endurance', 'blend'],
    default: 'hypertrophy' 
  },
  focusAreas: [{ type: String }],
  muscleGroupSettings: {
    chest: muscleGroupSettingSchema,
    back: muscleGroupSettingSchema,
    shoulders: muscleGroupSettingSchema,
    biceps: muscleGroupSettingSchema,
    triceps: muscleGroupSettingSchema,
    legs: muscleGroupSettingSchema,
    core: muscleGroupSettingSchema
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
