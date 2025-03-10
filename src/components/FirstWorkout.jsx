// src/components/FirstWorkout.jsx
import React, { useState, useEffect } from 'react';
import { getAllExercises } from '../services/apiService';
import localExercises from '../data/exercises'; // Fallback data

const FirstWorkout = ({ userProfile, onWorkoutGenerated, onCustomWorkoutCreated, onSkip }) => {
  const [option, setOption] = useState(null);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [customWorkout, setCustomWorkout] = useState({
    musclesTargeted: [],
    exercises: []
  });
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseSets, setExerciseSets] = useState(3);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exercises, setExercises] = useState([]); // Database exercises
  
  // Fetch exercises from API
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const data = await getAllExercises();
        setExercises(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises. Using local data instead.');
        setExercises(localExercises);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExercises();
  }, []);
  
  // Filter exercises based on user's available equipment
  useEffect(() => {
    if (userProfile && userProfile.availableEquipment && exercises.length > 0) {
      const filtered = exercises.filter(ex => 
        ex.equipment.some(equip => userProfile.availableEquipment.includes(equip))
      );
      setAvailableExercises(filtered);
    }
  }, [userProfile, exercises]);
  
  // Generate a default first workout based on user profile
  const generateDefaultWorkout = () => {
    // Create a balanced full-body workout
    const workout = {
      musclesTargeted: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'core'], // Updated for split legs
      estimatedDuration: 60,
      workout: {
        type: "straight_sets",
        exercises: []
      }
    };
    
    // Select exercises based on available equipment and experience level
    const targetedMuscles = new Set();
    
    // Helper function to get best exercise for a muscle group
    const getBestExerciseFor = (muscleGroup, preferCompound = true) => {
      const muscleExercises = availableExercises.filter(ex => 
        ex.primaryMuscleGroup === muscleGroup &&
        (ex.difficultyLevel === userProfile.experienceLevel || 
         availableExercises.filter(e => e.primaryMuscleGroup === muscleGroup && 
           e.difficultyLevel === userProfile.experienceLevel).length === 0)
      );
      
      if (muscleExercises.length === 0) return null;
      
      // Sort by compound first if preferred
      const sorted = [...muscleExercises].sort((a, b) => {
        if (preferCompound) {
          if (a.exerciseType === 'compound' && b.exerciseType !== 'compound') return -1;
          if (a.exerciseType !== 'compound' && b.exerciseType === 'compound') return 1;
        }
        return 0;
      });
      
      return sorted[0];
    };
    
    // Add major compound exercises first (if available)
    // Updated for split legs
    const compounds = [
      { muscle: 'chest', name: 'Barbell Bench Press' },
      { muscle: 'back', name: 'Barbell Row' },
      { muscle: 'quads', name: 'Barbell Squat' },
      { muscle: 'hamstrings', name: 'Romanian Deadlift' },
      { muscle: 'shoulders', name: 'Overhead Press' }
    ];
    
    // Try to add each major compound or alternative
    compounds.forEach(({ muscle, name }) => {
      // First try to find the specific exercise by name
      let exercise = availableExercises.find(ex => 
        ex.name === name && 
        ex.equipment.some(equip => userProfile.availableEquipment.includes(equip))
      );
      
      // If not found, get best alternative compound
      if (!exercise) {
        exercise = getBestExerciseFor(muscle, true);
      }
      
      if (exercise) {
        workout.workout.exercises.push({
          ...exercise,
          sets: userProfile.experienceLevel === 'beginner' ? 3 : 4
        });
        targetedMuscles.add(muscle);
        
        // Also mark secondary muscles
        if (exercise.secondaryMuscleGroups) {
          exercise.secondaryMuscleGroups.forEach(m => targetedMuscles.add(m));
        }
      }
    });
    
    // Add isolation exercises for any muscle groups not hit yet
    const remainingMuscles = ['biceps', 'triceps', 'glutes', 'core'].filter(m => !targetedMuscles.has(m));
    
    remainingMuscles.forEach(muscle => {
      const exercise = getBestExerciseFor(muscle, false);
      if (exercise) {
        workout.workout.exercises.push({
          ...exercise,
          sets: 3
        });
        targetedMuscles.add(muscle);
      }
    });
    
    // Adjust sets based on training goal
    if (userProfile.trainingGoal === 'strength') {
      workout.workout.exercises.forEach(ex => {
        ex.sets = Math.min(ex.sets, 5); // Max 5 sets for strength
      });
    } else if (userProfile.trainingGoal === 'hypertrophy') {
      workout.workout.exercises.forEach(ex => {
        if (ex.exerciseType === 'compound') {
          ex.sets = 3; // 3 sets for compounds
        } else {
          ex.sets = 3; // 3 sets for isolation
        }
      });
    }
    
    // Calculate estimated duration
    const totalSets = workout.workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const avgTimePerSet = userProfile.trainingGoal === 'strength' ? 3 : 2; // minutes
    workout.estimatedDuration = totalSets * avgTimePerSet + 10; // Add 10 min for warmup
    
    setGeneratedWorkout(workout);
  };
  
  // Handle adding exercise to custom workout
  const handleAddExercise = () => {
    if (!selectedExercise) return;
    
    const exercise = availableExercises.find(ex => ex.id === selectedExercise || ex._id === selectedExercise);
    if (!exercise) return;
    
    // Add exercise to list
    const updatedWorkout = {
      ...customWorkout,
      exercises: [
        ...customWorkout.exercises,
        {
          ...exercise,
          sets: exerciseSets
        }
      ]
    };
    
    // Add muscle group if not already targeted
    if (!customWorkout.musclesTargeted.includes(exercise.primaryMuscleGroup)) {
      updatedWorkout.musclesTargeted = [
        ...customWorkout.musclesTargeted,
        exercise.primaryMuscleGroup
      ];
    }
    
    setCustomWorkout(updatedWorkout);
    setSelectedExercise('');
    setExerciseSets(3);
  };
  
  // Handle removing exercise from custom workout
  const handleRemoveExercise = (id) => {
    const updatedExercises = customWorkout.exercises.filter(ex => 
      ex.id !== id && ex._id !== id
    );
    
    // Recalculate targeted muscles
    const targetedMuscles = new Set();
    updatedExercises.forEach(ex => {
      targetedMuscles.add(ex.primaryMuscleGroup);
    });
    
    setCustomWorkout({
      musclesTargeted: [...targetedMuscles],
      exercises: updatedExercises
    });
  };
  
  // Submit the custom workout
  const handleSubmitCustom = () => {
    if (customWorkout.exercises.length === 0) return;
    
    // Format similar to generated workout for consistency
    const formattedWorkout = {
      musclesTargeted: customWorkout.musclesTargeted,
      estimatedDuration: customWorkout.exercises.reduce((sum, ex) => sum + (ex.sets * 2), 0) + 10,
      workout: {
        type: "straight_sets",
        exercises: customWorkout.exercises.map(ex => ({
          ...ex,
          primaryMuscleGroup: ex.primaryMuscleGroup || "chest", // Ensure primary muscle is set
          secondaryMuscleGroups: ex.secondaryMuscleGroups || [] // Ensure secondaryMuscleGroups exists
        }))
      }
    };
    
    onCustomWorkoutCreated(formattedWorkout);
  };
  
  // Use the generated workout
  const handleUseGenerated = () => {
    if (generatedWorkout) {
      onWorkoutGenerated(generatedWorkout);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Welcome to Your First Workout!</h2>
      <p className="text-gray-600 mb-6">
        Let's get started with your fitness journey. Choose one of the options below:
      </p>
      
      {isLoading && (
        <div className="mb-4 text-center text-gray-600">
          Loading exercise database...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
          {error}
        </div>
      )}
      
      {!option && !isLoading && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setOption('generate');
              generateDefaultWorkout();
            }}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Generate a Balanced First Workout
          </button>
          
          <button
            onClick={() => setOption('custom')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Log Exercises I Already Did
          </button>
          
          <button
            onClick={onSkip}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Skip (I'll Generate a Workout Later)
          </button>
        </div>
      )}
      
      {option === 'generate' && generatedWorkout && (
        <div>
          <h3 className="text-lg font-medium mb-3">Your First Workout Plan</h3>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {generatedWorkout.musclesTargeted.map(muscle => (
                <span 
                  key={muscle} 
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm capitalize"
                >
                  {muscle}
                </span>
              ))}
            </div>
            <p className="text-gray-600">
              Estimated duration: {generatedWorkout.estimatedDuration} minutes
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            {generatedWorkout.workout.exercises.map((exercise, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {exercise.primaryMuscleGroup} • {exercise.exerciseType}
                    </p>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded">
                    {exercise.sets} sets
                  </div>
                </div>
                {exercise.instructions && (
                  <p className="mt-2 text-sm text-gray-700">{exercise.instructions}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleUseGenerated}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Use This Workout
            </button>
            
            <button
              onClick={() => setOption(null)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
      
      {option === 'custom' && (
        <div>
          <h3 className="text-lg font-medium mb-3">Log Your Own Workout</h3>
          
          {/* Exercise database info */}
          <div className="mb-4 text-sm text-gray-600">
            {exercises.length > 0 ? (
              <p>Using {exercises.length} exercises from database</p>
            ) : (
              <p>Using local exercise database</p>
            )}
          </div>
          
          {/* Add exercise form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <label className="block text-gray-700 mb-2">Select Exercise</label>
              <select 
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select an exercise --</option>
                {availableExercises.map(ex => (
                  <option key={ex.id || ex._id} value={ex.id || ex._id}>
                    {ex.name} ({ex.primaryMuscleGroup})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-2">Number of Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={exerciseSets}
                onChange={(e) => setExerciseSets(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button
              onClick={handleAddExercise}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Exercise
            </button>
          </div>
          
          {/* Exercise list */}
          {customWorkout.exercises.length > 0 ? (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Your Exercises</h4>
              <div className="space-y-2">
                {customWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                    <div>
                      <span className="font-medium">{exercise.name}</span>
                      <span className="ml-2 text-sm text-gray-600 capitalize">
                        {exercise.sets} sets
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(exercise.id || exercise._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center text-gray-600">
              No exercises added yet. Add some exercises to your workout.
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleSubmitCustom}
              disabled={customWorkout.exercises.length === 0}
              className={`flex-1 py-3 rounded-lg font-medium ${
                customWorkout.exercises.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition-colors`}
            >
              Log This Workout
            </button>
            
            <button
              onClick={() => setOption(null)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstWorkout;