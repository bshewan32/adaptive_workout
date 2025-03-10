// src/components/WorkoutDisplay.jsx
import React, { useState, useEffect } from 'react';

const WorkoutDisplay = ({ workout, onWorkoutUpdated, readOnly = false }) => {
  const [editableWorkout, setEditableWorkout] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize the editable workout when the prop changes
  useEffect(() => {
    if (workout) {
      setEditableWorkout(JSON.parse(JSON.stringify(workout))); // Deep copy
    }
  }, [workout]);
  
  if (!workout || !editableWorkout) return null;
  
  // Helper function to capitalize muscle group names
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  
  // Handle set count changes
  const handleSetCountChange = (exerciseIndex, newCount) => {
    const updatedWorkout = { ...editableWorkout };
    
    if (updatedWorkout.workout.type === "straight_sets") {
      updatedWorkout.workout.exercises[exerciseIndex].sets = parseInt(newCount) || 0;
    } else {
      // Find which superset this exercise is in
      let found = false;
      for (let i = 0; i < updatedWorkout.workout.sets.length && !found; i++) {
        const superset = updatedWorkout.workout.sets[i];
        for (let j = 0; j < superset.exercises.length; j++) {
          if (exerciseIndex === 0) {
            superset.exercises[j].sets = parseInt(newCount) || 0;
            found = true;
            break;
          }
          exerciseIndex--;
        }
      }
    }
    
    setEditableWorkout(updatedWorkout);
  };
  
  // Remove an exercise from the workout
  const handleRemoveExercise = (exerciseIndex) => {
    const updatedWorkout = { ...editableWorkout };
    
    if (updatedWorkout.workout.type === "straight_sets") {
      // Get the muscle group of the exercise to be removed
      const exercise = updatedWorkout.workout.exercises[exerciseIndex];
      const muscleToRemove = exercise.primaryMuscleGroup;
      
      // Remove the exercise
      updatedWorkout.workout.exercises.splice(exerciseIndex, 1);
      
      // Check if we need to update musclesTargeted
      const remainingExercisesForMuscle = updatedWorkout.workout.exercises.filter(
        ex => ex.primaryMuscleGroup === muscleToRemove
      );
      
      if (remainingExercisesForMuscle.length === 0) {
        // Remove this muscle from the targeted list
        updatedWorkout.musclesTargeted = updatedWorkout.musclesTargeted.filter(
          m => m !== muscleToRemove
        );
      }
    } else {
      // Supersets are more complex, for now we'll just zero out the sets
      // to effectively remove the exercise from the workout
      let found = false;
      for (let i = 0; i < updatedWorkout.workout.sets.length && !found; i++) {
        const superset = updatedWorkout.workout.sets[i];
        for (let j = 0; j < superset.exercises.length; j++) {
          if (exerciseIndex === 0) {
            superset.exercises[j].sets = 0;
            found = true;
            break;
          }
          exerciseIndex--;
        }
      }
    }
    
    setEditableWorkout(updatedWorkout);
  };
  
  // Handle saving the edited workout
  const handleSaveChanges = () => {
    if (onWorkoutUpdated) {
      // Recalculate estimated duration based on sets
      let totalSets = 0;
      
      if (editableWorkout.workout.type === "straight_sets") {
        totalSets = editableWorkout.workout.exercises.reduce(
          (sum, ex) => sum + (ex.sets || 0), 0
        );
      } else {
        for (const set of editableWorkout.workout.sets) {
          for (const ex of set.exercises) {
            totalSets += (ex.sets || 0);
          }
        }
      }
      
      // Rough estimate: 2 minutes per set + 10 min warmup
      const updatedDuration = Math.max(20, (totalSets * 2) + 10);
      editableWorkout.estimatedDuration = updatedDuration;
      
      onWorkoutUpdated(editableWorkout);
    }
    
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Your Personalized Workout</h2>
        {!readOnly && (
          <button
            onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
            className={`px-4 py-1 rounded font-medium ${
              isEditing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEditing ? "Save Changes" : "Customize"}
          </button>
        )}
      </div>
      
      <p className="text-gray-600 mb-4">Estimated duration: {editableWorkout.estimatedDuration} minutes</p>
      
      {/* Target muscle groups */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Target Muscle Groups</h3>
        <div className="flex flex-wrap gap-2">
          {editableWorkout.musclesTargeted.map(muscle => (
            <span 
              key={muscle} 
              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
            >
              {capitalize(muscle)}
            </span>
          ))}
        </div>
      </div>
      
      {/* Workout Structure */}
      <div>
        <h3 className="text-lg font-medium mb-3">Exercises</h3>
        
        {editableWorkout.workout.type === "straight_sets" ? (
          <div className="space-y-4">
            {editableWorkout.workout.exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {exercise.primaryMuscleGroup} • {exercise.exerciseType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <label className="text-sm text-gray-600">Sets:</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={exercise.sets || 0}
                          onChange={(e) => handleSetCountChange(index, e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                        />
                        <button
                          onClick={() => handleRemoveExercise(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove exercise"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="bg-gray-100 px-3 py-1 rounded">
                        {exercise.sets} sets
                      </div>
                    )}
                  </div>
                </div>
                {exercise.instructions && (
                  <p className="mt-2 text-sm text-gray-700">{exercise.instructions}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {editableWorkout.workout.sets.map((set, setIndex) => {
              // Track the overall exercise index for editing purposes
              let exerciseIndexOffset = 0;
              for (let i = 0; i < setIndex; i++) {
                exerciseIndexOffset += editableWorkout.workout.sets[i].exercises.length;
              }
              
              return (
                <div key={setIndex} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gray-200 text-gray-800 rounded px-2 py-1 text-xs">
                      {set.type === "antagonist" 
                        ? "Antagonist Superset" 
                        : set.type === "non_overlapping" 
                          ? "Non-overlapping Superset" 
                          : "Straight Set"}
                    </span>
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {set.exercises.map((exercise, exIndex) => {
                      const globalExIndex = exerciseIndexOffset + exIndex;
                      
                      return (
                        <div key={exercise.id || exIndex} className="border-l-4 border-purple-500 pl-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{exercise.name}</h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {exercise.primaryMuscleGroup}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <label className="text-sm text-gray-600">Sets:</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={exercise.sets || 0}
                                    onChange={(e) => handleSetCountChange(globalExIndex, e.target.value)}
                                    className="w-16 p-1 border rounded text-center"
                                  />
                                  <button
                                    onClick={() => handleRemoveExercise(globalExIndex)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove exercise"
                                  >
                                    ✕
                                  </button>
                                </>
                              ) : (
                                <div className="text-sm text-gray-600">
                                  {exercise.sets} sets
                                </div>
                              )}
                            </div>
                          </div>
                          {exercise.instructions && (
                            <p className="mt-1 text-sm text-gray-700">{exercise.instructions}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isEditing && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSaveChanges}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDisplay;