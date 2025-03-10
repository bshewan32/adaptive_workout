// src/components/WorkoutLogger.jsx
import React, { useState } from 'react';
import { createWorkout } from '../services/apiService';

const WorkoutLogger = ({ workout, userId, onWorkoutLogged }) => {
  const [exerciseData, setExerciseData] = useState(
    workout.workout.type === "straight_sets" 
      ? workout.workout.exercises.map(exercise => ({
          exerciseId: exercise.id,
          sets: Array(exercise.sets).fill().map(() => ({ reps: 10, weight: 0, rpe: 7 }))
        }))
      : workout.workout.sets.flatMap(set => 
          set.exercises.map(exercise => ({
            exerciseId: exercise.id,
            sets: Array(exercise.sets).fill().map(() => ({ reps: 10, weight: 0, rpe: 7 }))
          }))
        )
  );
  
  const [duration, setDuration] = useState(workout.estimatedDuration);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Helper function to get exercise name by ID
  const getExerciseName = (id) => {
    let exercise = null;
    
    if (workout.workout.type === "straight_sets") {
      exercise = workout.workout.exercises.find(ex => ex.id === id);
    } else {
      for (const set of workout.workout.sets) {
        const found = set.exercises.find(ex => ex.id === id);
        if (found) {
          exercise = found;
          break;
        }
      }
    }
    
    return exercise ? exercise.name : 'Unknown Exercise';
  };
  
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    // Parse numeric input
    if (field === 'reps' || field === 'weight' || field === 'rpe') {
      value = parseFloat(value) || 0;
    }
    
    const updatedExercises = [...exerciseData];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExerciseData(updatedExercises);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format data for API
      const workoutData = {
        userId,
        date: new Date(),
        duration,
        exercises: exerciseData,
        notes,
        rating
      };
      
      // Send to API
      const savedWorkout = await createWorkout(workoutData);
      
      // Notify parent
      if (onWorkoutLogged) {
        onWorkoutLogged(savedWorkout);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      setError('Failed to save workout. Please try again.');
      setIsSubmitting(false);
      console.error('Error saving workout:', error);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Log Completed Workout</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Duration */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Workout Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>
        
        {/* Exercises */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Exercises</h3>
          
          {exerciseData.map((exercise, exerciseIndex) => (
            <div key={exercise.exerciseId} className="mb-6 p-4 border rounded">
              <h4 className="font-medium mb-2">{getExerciseName(exercise.exerciseId)}</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Set</th>
                      <th className="p-2 text-left">Weight</th>
                      <th className="p-2 text-left">Reps</th>
                      <th className="p-2 text-left">RPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIndex) => (
                      <tr key={setIndex}>
                        <td className="p-2">{setIndex + 1}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                            className="w-24 p-1 border rounded"
                            min="0"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                            className="w-20 p-1 border rounded"
                            min="1"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={set.rpe}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'rpe', e.target.value)}
                            className="p-1 border rounded"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Workout Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Log Workout'}
        </button>
      </form>
    </div>
  );
};

export default WorkoutLogger;