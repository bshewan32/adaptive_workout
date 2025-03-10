// src/components/WorkoutGenerator.jsx
import React, { useState, useEffect } from 'react';
import { generateWorkout } from '../services/workoutGenerator';
import { getAllExercises } from '../services/apiService';
import localExercises from '../data/exercises';

const WorkoutGenerator = ({ muscleMetrics, userProfile, onWorkoutGenerated }) => {
  const [availableTime, setAvailableTime] = useState(60);
  const [recoveryFeedback, setRecoveryFeedback] = useState({
    chest: 'fully_recovered',
    back: 'fully_recovered',
    shoulders: 'fully_recovered',
    biceps: 'fully_recovered',
    triceps: 'fully_recovered',
    quads: 'fully_recovered',
    hamstrings: 'fully_recovered',
    glutes: 'fully_recovered',
    core: 'fully_recovered'
  });
  
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get recommended workout directly from dashboard logic
  const getDashboardRecommendation = () => {
    // Calculate workout parameters based on muscleMetrics and userProfile
    const recommendedMuscles = suggestWorkout(muscleMetrics, userProfile);
    
    return {
      primaryFocus: recommendedMuscles.primaryFocus.map(item => item.muscle),
      secondaryFocus: recommendedMuscles.secondaryFocus.map(item => item.muscle),
      maintenance: recommendedMuscles.maintenance.map(item => item.muscle),
      setAllocations: {
        ...recommendedMuscles.primaryFocus.reduce((acc, item) => ({
          ...acc,
          [item.muscle]: item.sets
        }), {}),
        ...recommendedMuscles.secondaryFocus.reduce((acc, item) => ({
          ...acc,
          [item.muscle]: item.sets
        }), {}),
        ...recommendedMuscles.maintenance.reduce((acc, item) => ({
          ...acc,
          [item.muscle]: item.sets
        }), {})
      }
    };
  };
  
  // Generate a suggested workout based on metrics
// Generate a suggested workout based on metrics
function suggestWorkout(muscleMetrics, userProfile) {
  const workout = {
    primaryFocus: [],
    secondaryFocus: [],
    maintenance: []
  };
  
  // First, separate muscle groups into two categories:
  // 1. Those with zero weekly volume (highest priority)
  // 2. Those with some volume but still below minimum (second priority)
  
  const zeroVolumeGroups = [];
  const belowMinimumGroups = [];
  
  // Identify muscle groups that are below minimum and sort them into the two categories
  Object.entries(muscleMetrics)
    .forEach(([muscle, metrics]) => {
      if (metrics.volumeNeededForMinimum > 0) {
        // Check if this muscle group has received any volume this week
        if (metrics.weeklyVolume === 0) {
          zeroVolumeGroups.push({
            muscle,
            isFocused: metrics.isFocused,
            volumeNeeded: metrics.volumeNeededForMinimum,
            recoveryStatus: metrics.recoveryStatus
          });
        } else {
          belowMinimumGroups.push({
            muscle,
            isFocused: metrics.isFocused,
            percentComplete: metrics.weeklyVolume / (userProfile.muscleGroupSettings[muscle]?.minimumDose || 10) * 100,
            volumeNeeded: metrics.volumeNeededForMinimum,
            recoveryStatus: metrics.recoveryStatus
          });
        }
      }
    });
  
    // Sort both groups by focus (focused items first), then by recovery status or percent complete
    const sortedZeroVolume = zeroVolumeGroups.sort((a, b) => {
      // First prioritize by focus
      if (a.isFocused && !b.isFocused) return -1;
      if (!a.isFocused && b.isFocused) return 1;

      // Then by recovery status (more recovered first)
      return b.recoveryStatus - a.recoveryStatus;
    });

    const sortedBelowMinimum = belowMinimumGroups.sort((a, b) => {
      // First prioritize by focus
      if (a.isFocused && !b.isFocused) return -1;
      if (!a.isFocused && b.isFocused) return 1;

      // Then by percent complete (lowest first)
      return a.percentComplete - b.percentComplete;
    });

    // Combine the two lists, with zero volume groups first
    const muscleNeedsList = [...sortedZeroVolume, ...sortedBelowMinimum];

    // Limit primary focus to 2-3 muscle groups
    const primaryLimit = 3;

    // Select top priority muscles (max 3)
    const primaryMuscles = muscleNeedsList.slice(0, primaryLimit);

    // Add to primary focus with appropriate set counts
    primaryMuscles.forEach(item => {
      // Calculate appropriate sets
      // For zero volume muscles, allocate more sets
      const isZeroVolume = sortedZeroVolume.some(zero => zero.muscle === item.muscle);

      // Calculate appropriate sets - more for higher priority or zero volume
      const setCount = isZeroVolume ? 5 :
        (item.percentComplete < 30 ? 4 : 3);

      workout.primaryFocus.push({
        muscle: item.muscle,
        sets: setCount
      });
    });

    // Select next 1-2 muscles for secondary focus (if available)
    const secondaryLimit = 2;
    const secondaryMuscles = muscleNeedsList.slice(primaryLimit, primaryLimit + secondaryLimit);

    secondaryMuscles.forEach(item => {
      workout.secondaryFocus.push({
        muscle: item.muscle,
        sets: 3 // Fixed 3 sets for secondary focus
      });
    });

    // Add maintenance work for well-recovered muscles that are above minimum
    // but could use some additional work (max 1-2)
    const maintenanceCandidates = Object.entries(muscleMetrics)
      .filter(([muscle, metrics]) =>
        metrics.recoveryStatus > 90 && // Well recovered
        metrics.volumeNeededForMinimum === 0 && // Meeting minimum
        !workout.primaryFocus.some(m => m.muscle === muscle) && // Not already in primary
        !workout.secondaryFocus.some(m => m.muscle === muscle) // Not already in secondary
      )
      .sort((a, b) => b[1].recoveryStatus - a[1].recoveryStatus) // Most recovered first
      .slice(0, 1); // Just 1 maintenance muscle

    maintenanceCandidates.forEach(([muscle]) => {
      workout.maintenance.push({
        muscle,
        sets: 2 // Just 2 maintenance sets
      });
    });

    return workout;
  }

  // Fetch exercises when component mounts
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

  const handleRecoveryChange = (muscle, value) => {
    setRecoveryFeedback({
      ...recoveryFeedback,
      [muscle]: value
    });
  };

  const handleGenerateWorkout = () => {
    // Use the fetched exercises or fall back to local data if empty
    const exercisesToUse = exercises.length > 0 ? exercises : localExercises;

    const generatedWorkout = generateWorkout({
      userProfile,
      muscleMetrics,
      availableTime,
      recoveryFeedback,
      availableExercises: exercisesToUse
    });

    onWorkoutGenerated(generatedWorkout);
  };

  const handleGenerateRecommendedWorkout = () => {
    // Get dashboard recommendation
    const recommendation = getDashboardRecommendation();

    // Use the fetched exercises or fall back to local data if empty
    const exercisesToUse = exercises.length > 0 ? exercises : localExercises;

    // Create a custom workout using the recommended muscles and set allocations
    const allTargetedMuscles = [
      ...recommendation.primaryFocus,
      ...recommendation.secondaryFocus,
      ...recommendation.maintenance
    ];

    const customWorkout = generateWorkout({
      userProfile,
      muscleMetrics,
      availableTime,
      recoveryFeedback,
      availableExercises: exercisesToUse,
      forceMuscleGroups: allTargetedMuscles,
      forceSetAllocations: recommendation.setAllocations
    });
    
    onWorkoutGenerated(customWorkout);
  };
  
  // Get dashboard recommendation for preview
  const dashboardRecommendation = getDashboardRecommendation();
  
  // Get list of all muscle groups from user profile
  const muscleGroups = Object.keys(recoveryFeedback).sort();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generate New Workout</h2>
      
      {/* Dashboard Recommendation Preview */}
      <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
        <h3 className="font-medium text-purple-800 mb-2">Dashboard Recommendation</h3>
        
        {dashboardRecommendation.primaryFocus.length > 0 && (
          <div className="mb-2">
            <span className="font-medium">Primary Focus:</span>{" "}
            {dashboardRecommendation.primaryFocus.map(muscle => 
              `${muscle} (${dashboardRecommendation.setAllocations[muscle]} sets)`
            ).join(", ")}
          </div>
        )}
        
        {dashboardRecommendation.secondaryFocus.length > 0 && (
          <div className="mb-2">
            <span className="font-medium">Secondary Focus:</span>{" "}
            {dashboardRecommendation.secondaryFocus.map(muscle => 
              `${muscle} (${dashboardRecommendation.setAllocations[muscle]} sets)`
            ).join(", ")}
          </div>
        )}
        
        <button
          onClick={handleGenerateRecommendedWorkout}
          className="mt-2 w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Generate Recommended Workout
        </button>
      </div>
      
      <div className="mb-6 border-t pt-4">
        <h3 className="font-medium mb-3">Or customize your workout parameters:</h3>
      
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
        
        {/* Exercise database info */}
        <div className="mb-4 text-sm text-gray-600">
          {exercises.length > 0 ? (
            <p>Using {exercises.length} exercises from database</p>
          ) : (
            <p>Using local exercise database</p>
          )}
        </div>
        
        {/* Time available selector */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Available Time (minutes)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="20" 
              max="120" 
              step="5" 
              value={availableTime} 
              onChange={(e) => setAvailableTime(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-medium text-gray-700">{availableTime} min</span>
          </div>
        </div>
        
        {/* Recovery feedback */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">How recovered are your muscles?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {muscleGroups.map(muscle => (
              <div key={muscle} className="flex flex-col">
                <label className="capitalize mb-1">{muscle}</label>
                <select 
                  value={recoveryFeedback[muscle]} 
                  onChange={(e) => handleRecoveryChange(muscle, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="fully_recovered">Fully Recovered</option>
                  <option value="somewhat_sore">Somewhat Sore</option>
                  <option value="very_sore">Very Sore</option>
                </select>
              </div>
            ))}
          </div>
        </div>
        
        {/* Generate button */}
        <button 
          onClick={handleGenerateWorkout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          Generate Custom Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutGenerator;