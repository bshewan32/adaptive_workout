// src/components/SimpleWorkoutHistory.jsx
import React, { useState } from 'react';

const SimpleWorkoutHistory = ({ workouts = [] }) => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  // Add this at the top of your SimpleWorkoutHistory component
// (just inside the component function but before any state or return)

console.log("Workouts passed to SimpleWorkoutHistory:", workouts);

// Check if each workout has the required structure
workouts.forEach((workout, index) => {
  console.log(`Workout ${index} structure check:`);
  console.log("- Has musclesTargeted:", Boolean(workout.musclesTargeted));
  console.log("- Has exercises:", Boolean(workout.exercises));
  console.log("- Number of exercises:", workout.exercises ? workout.exercises.length : 0);
  
  if (workout.exercises && workout.exercises.length > 0) {
    const firstEx = workout.exercises[0];
    console.log("- First exercise:", firstEx);
    console.log("- Has primaryMuscleGroup:", Boolean(firstEx.primaryMuscleGroup));
    console.log("- Has secondaryMuscleGroups:", Boolean(firstEx.secondaryMuscleGroups));
    console.log("- Has sets value:", Boolean(firstEx.sets));
  }
});

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return dateObj.toLocaleDateString(undefined, options);
  };
  
  // Calculate total volume by muscle group from actual workout history
  const calculateVolumeByMuscle = (workouts) => {
    const volumeMap = {
      chest: 0,
      back: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      legs: 0,
      core: 0
    };
    
    // Filter to only include workouts from the last 7 days
    const now = new Date();
    const recentWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      const daysDifference = Math.floor((now - workoutDate) / (1000 * 60 * 60 * 24));
      return daysDifference <= 7;
    });
    
    // Process each workout
    recentWorkouts.forEach(workout => {
      // Process each exercise
      workout.exercises.forEach(exercise => {
        const primaryMuscle = exercise.primaryMuscleGroup;
        const sets = exercise.sets || 0;
        
        // Add primary muscle volume
        if (volumeMap.hasOwnProperty(primaryMuscle)) {
          volumeMap[primaryMuscle] += sets;
        }
        
        // Add secondary muscle volume (at 50% value)
        if (exercise.secondaryMuscleGroups) {
          exercise.secondaryMuscleGroups.forEach(muscle => {
            if (volumeMap.hasOwnProperty(muscle)) {
              volumeMap[muscle] += sets * 0.5;
            }
          });
        }
      });
    });
    
    return Object.entries(volumeMap).map(([muscle, volume]) => ({
      muscle,
      volume: Math.round(volume) // Round to nearest integer
    }));
  };
  
  const volumeData = calculateVolumeByMuscle(workouts);
  
  // If no workouts, show message
  if (workouts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Workout History</h2>
        <div className="text-center py-8 text-gray-500">
          No workout history yet. Start logging your workouts!
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Workout History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side - Recent Workouts */}
        <div>
          <h3 className="text-lg font-medium mb-3">Recent Workouts</h3>
          <div className="space-y-4">
            {workouts.map(workout => (
              <div 
                key={workout.id}
                className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedWorkout?.id === workout.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{formatDate(workout.date)}</h4>
                    <p className="text-sm text-gray-600">
                      {workout.duration} min • {workout.exercises.length} exercises
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {workout.musclesTargeted.map(muscle => (
                    <span key={muscle} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side - Selected Workout Details */}
        <div>
          {selectedWorkout ? (
            <div>
              <h3 className="text-lg font-medium mb-3">Workout Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Date:</span>
                  <span className="font-medium ml-2">{formatDate(selectedWorkout.date)}</span>
                </div>
                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Duration:</span>
                  <span className="font-medium ml-2">{selectedWorkout.duration} minutes</span>
                </div>
                
                <h4 className="font-medium mt-4 mb-2">Exercises</h4>
                <div className="space-y-2">
                  {selectedWorkout.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-gray-600">{exercise.sets} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a workout to view details</p>
            </div>
          )}
          
          {/* Volume Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Weekly Volume Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {volumeData.map(({ muscle, volume }) => (
                <div key={muscle} className="mb-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{muscle}</span>
                    <span>{volume} sets</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (volume / 15) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleWorkoutHistory;