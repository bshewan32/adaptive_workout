// src/components/SimpleWorkoutLogger.jsx
import React, { useState } from 'react';

const SimpleWorkoutLogger = ({ workout, onWorkoutLogged }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      if (onWorkoutLogged) {
        onWorkoutLogged();
      }
      setIsSubmitting(false);
    }, 1500); // Simulate 1.5 second API call
  };
  
  // Format the workout for display
  const formatWorkout = () => {
    if (workout.workout.type === "straight_sets") {
      return workout.workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
      }));
    } else {
      return workout.workout.sets.flatMap(set => 
        set.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets
        }))
      );
    }
  };
  
  const exercises = formatWorkout();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Log Completed Workout</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Exercises */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Exercises Completed</h3>
          
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded">
                    {exercise.sets} sets completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">How do you feel about this workout?</label>
          <select className="w-full p-2 border rounded">
            <option>Great - felt strong!</option>
            <option>Good - completed as planned</option>
            <option>Okay - struggled a bit</option>
            <option>Difficult - had to reduce weights/reps</option>
          </select>
        </div>
        
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

export default SimpleWorkoutLogger;