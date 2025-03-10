// src/services/workoutGenerator.js

// Main workout generator function
// Update the generate workout function in src/services/workoutGenerator.js

// Main workout generator function with support for forced muscle groups
export function generateWorkout({
  userProfile,
  muscleMetrics,
  availableTime,
  recoveryFeedback,
  availableExercises,
  forceMuscleGroups = null, // NEW: Option to force specific muscle groups
  forceSetAllocations = null // NEW: Option to force specific set allocations
}) {
  // 1. Calculate priority score for each muscle group
  const muscleScores = calculatePriorityScores(muscleMetrics, userProfile, recoveryFeedback);
  
  // 2. Determine which muscle groups to include in workout
  // If forceMuscleGroups is provided, use those instead of calculating
  const selectedMuscleGroups = forceMuscleGroups || selectMuscleGroups(muscleScores, availableTime);
  
  // 3. Allocate sets for each selected muscle group
  // If forceSetAllocations is provided, use those instead of calculating
  const volumeAllocation = forceSetAllocations || 
                          allocateVolume(selectedMuscleGroups, muscleMetrics, availableTime);
  
  // 4. Select specific exercises for each muscle group
  // Convert volumeAllocation from an object of muscles->sets to the format expected by selectExercises
  const volumeAllocationArray = typeof volumeAllocation === 'object' && !Array.isArray(volumeAllocation) 
    ? Object.entries(volumeAllocation).map(([muscle, sets]) => ({ muscle, sets }))
    : volumeAllocation;
    
  const selectedExercises = selectExercises(volumeAllocationArray, availableExercises, userProfile);
  
  // 5. Organize exercises into optimal workout structure (supersets, etc.)
  const structuredWorkout = organizeWorkout(selectedExercises, userProfile.trainingGoal, availableTime);
  
  return {
    musclesTargeted: Array.isArray(selectedMuscleGroups) ? selectedMuscleGroups : Object.keys(volumeAllocation),
    estimatedDuration: calculateWorkoutDuration(structuredWorkout, userProfile.trainingGoal),
    workout: structuredWorkout
  };
}

// Calculate priority score for each muscle group
function calculatePriorityScores(muscleMetrics, userProfile, recoveryFeedback) {
  const scores = {};
  
  Object.entries(muscleMetrics).forEach(([muscle, metrics]) => {
    // Start with base score
    let score = 0;
    
    // Factor 1: Recovery status (0-100 scale)
    const recoveryMultiplier = getRecoveryMultiplier(recoveryFeedback[muscle]);
    score += metrics.recoveryStatus * recoveryMultiplier;
    
    // Factor 2: Time since last trained (days * 10)
    const daysSinceLastTrained = getDaysDifference(new Date(), metrics.lastTrainedDate);
    score += daysSinceLastTrained * 10;
    
    // Factor 3: Below minimum dose (big penalty)
    if (metrics.volumeNeededForMinimum > 0) {
      score += 200;
    }
    
    // Factor 4: Focus area (big bonus)
    if (metrics.isFocused) {
      score += 150;
    }
    
    scores[muscle] = Math.round(score);
  });
  
  return scores;
}

// Select which muscle groups to include based on priorities and available time
function selectMuscleGroups(muscleScores, availableTime) {
  // Sort muscles by priority score
  const sortedMuscles = Object.entries(muscleScores)
    .sort((a, b) => b[1] - a[1]) // Descending order
    .map(entry => entry[0]);
  
  let selectedMuscles = [];
  let estimatedSets = 0;
  
  // Rough estimate: 3 minutes per set including rest
  const maxSets = Math.floor(availableTime / 3);
  
  // Start with 4 sets for top priority, 3 for second, etc.
  // Add muscles until we reach estimated max sets
  for (const muscle of sortedMuscles) {
    if (estimatedSets >= maxSets) break;
    
    const setsToAdd = Math.min(
      5 - selectedMuscles.length, // Gradually decrease sets (5, 4, 3, etc.)
      maxSets - estimatedSets // Don't exceed max sets
    );
    
    if (setsToAdd <= 0) break;
    
    selectedMuscles.push(muscle);
    estimatedSets += setsToAdd;
  }
  
  return selectedMuscles;
}

// Allocate specific number of sets for each selected muscle group
function allocateVolume(selectedMuscleGroups, muscleMetrics, availableTime) {
  const allocation = {};
  let remainingTime = availableTime;
  
  // First pass: assign minimum sets to focus areas and below-minimum muscles
  selectedMuscleGroups.forEach(muscle => {
    const metrics = muscleMetrics[muscle];
    let setsAllocated = 0;
    
    if (metrics.isFocused) {
      // Focus areas get at least 4 sets
      setsAllocated = 4;
    } else if (metrics.volumeNeededForMinimum > 0) {
      // Below minimum areas get at least 3 sets
      setsAllocated = 3;
    } else {
      // Other muscles start with 2 sets
      setsAllocated = 2;
    }
    
    allocation[muscle] = setsAllocated;
    remainingTime -= setsAllocated * 3; // 3 min per set estimate
  });
  
  // Second pass: distribute any remaining time to focus areas first, then others
  while (remainingTime >= 3) { // As long as we have time for at least one more set
    // Find the muscle with highest priority that's not at max sets
    const focusedMuscles = selectedMuscleGroups.filter(muscle => 
      muscleMetrics[muscle].isFocused && allocation[muscle] < 6 // Cap at 6 sets per muscle
    );
    
    if (focusedMuscles.length > 0) {
      allocation[focusedMuscles[0]]++;
      remainingTime -= 3;
    } else {
      // If no focused muscles need more sets, add to other high priority muscles
      const otherMuscles = selectedMuscleGroups.filter(muscle => 
        allocation[muscle] < 5 // Cap other muscles at 5 sets
      );
      
      if (otherMuscles.length > 0) {
        allocation[otherMuscles[0]]++;
        remainingTime -= 3;
      } else {
        break; // All muscles at their caps
      }
    }
  }
  
  return allocation;
}

// Select specific exercises for each muscle group
// Update the selectExercises function in src/services/workoutGenerator.js

// Select specific exercises for each muscle group
function selectExercises(volumeAllocation, availableExercises, userProfile) {
  const selectedExercises = [];
  
  // Handle both array format (from allocateVolume) and object format (from forceSetAllocations)
  const processedAllocation = Array.isArray(volumeAllocation) 
    ? volumeAllocation 
    : Object.entries(volumeAllocation).map(([muscle, setCount]) => ({ muscle, setCount }));
  
  processedAllocation.forEach(item => {
    // Get the muscle and set count from the item, depending on format
    const muscle = item.muscle;
    const setCount = item.sets || item.setCount;
    
    if (!muscle || !setCount) return; // Skip invalid entries
    
    // Filter exercises for this muscle group
    const muscleExercises = availableExercises.filter(ex => 
      ex.primaryMuscleGroup === muscle &&
      ex.equipment.some(equip => userProfile.availableEquipment.includes(equip)) &&
      (ex.difficultyLevel === userProfile.experienceLevel || 
       // Fallback if no exercises match the experience level
       availableExercises.filter(e => 
         e.primaryMuscleGroup === muscle && 
         e.equipment.some(eq => userProfile.availableEquipment.includes(eq))
       ).length === 0)
    );
    
    // If no exercises match, try to find any exercise for this muscle
    const fallbackExercises = muscleExercises.length === 0 
      ? availableExercises.filter(ex => ex.primaryMuscleGroup === muscle)
      : [];
    
    const useExercises = muscleExercises.length > 0 ? muscleExercises : fallbackExercises;
    
    // Skip if no exercises available for this muscle
    if (useExercises.length === 0) {
      console.warn(`No exercises found for ${muscle}. Skipping.`);
      return;
    }
    
    // For muscle groups with multiple sets, try to include variety
    // At least one compound exercise if possible
    const compoundExercises = useExercises.filter(ex => ex.exerciseType === "compound");
    const isolationExercises = useExercises.filter(ex => ex.exerciseType === "isolation");
    
    let remainingSetCount = setCount;
    let exercisesToAdd = [];
    
    if (compoundExercises.length > 0) {
      // Start with a compound exercise
      exercisesToAdd.push({
        ...compoundExercises[0],
        sets: Math.min(3, remainingSetCount) // Up to 3 sets for the compound move
      });
      
      remainingSetCount -= exercisesToAdd[0].sets;
    }
    
    // Add isolation exercises with remaining sets
    while (remainingSetCount > 0 && isolationExercises.length > 0) {
      const exercise = isolationExercises.shift(); // Take the next isolation exercise
      const setsForThisExercise = Math.min(2, remainingSetCount); // Up to 2 sets per isolation
      
      exercisesToAdd.push({
        ...exercise,
        sets: setsForThisExercise
      });
      
      remainingSetCount -= setsForThisExercise;
    }
    
    // If we still have sets left, add more from compound
    if (remainingSetCount > 0 && compoundExercises.length > 1) {
      exercisesToAdd.push({
        ...compoundExercises[1],
        sets: remainingSetCount
      });
    } else if (remainingSetCount > 0 && compoundExercises.length === 1) {
      // Add more sets to the first compound exercise
      exercisesToAdd[0].sets += remainingSetCount;
    } else if (remainingSetCount > 0 && useExercises.length > 0) {
      // If all else fails, add any exercise
      exercisesToAdd.push({
        ...useExercises[0],
        sets: remainingSetCount
      });
    }
    
    selectedExercises.push(...exercisesToAdd);
  });
  
  return selectedExercises;
}

// Organize exercises into supersets based on time constraints
function organizeWorkout(exercises, trainingGoal, availableTime) {
  // Calculate if time is constrained
  const standardWorkoutTime = calculateStandardWorkoutTime(exercises, trainingGoal);
  const isTimeConstrained = standardWorkoutTime > availableTime;
  
  if (!isTimeConstrained) {
    // If we have plenty of time, just use straight sets
    return {
      type: "straight_sets",
      exercises: exercises
    };
  }
  
  // Time is constrained, create supersets
  // Updated antagonist pairs to include split leg muscles
  const antagonistPairs = {
    "chest": "back",
    "biceps": "triceps",
    "quads": "hamstrings", // Updated from "legs"
    "shoulders": "core",
    "glutes": "core"
  };
  
  // Updated non-overlapping pairs to include split leg muscles
  const nonOverlappingPairs = {
    "shoulders": "quads",
    "chest": "core",
    "back": "glutes",
    "biceps": "hamstrings",
    "triceps": "quads"
  };
  
  // Group exercises by muscle group
  const exercisesByMuscle = {};
  exercises.forEach(ex => {
    if (!exercisesByMuscle[ex.primaryMuscleGroup]) {
      exercisesByMuscle[ex.primaryMuscleGroup] = [];
    }
    exercisesByMuscle[ex.primaryMuscleGroup].push(ex);
  });
  
  const supersets = [];
  const usedExercises = new Set();
  
  // First try to create antagonist supersets
  Object.entries(antagonistPairs).forEach(([muscle1, muscle2]) => {
    if (exercisesByMuscle[muscle1] && exercisesByMuscle[muscle2]) {
      const ex1 = exercisesByMuscle[muscle1].find(ex => !usedExercises.has(ex.id));
      const ex2 = exercisesByMuscle[muscle2].find(ex => !usedExercises.has(ex.id));
      
      if (ex1 && ex2) {
        supersets.push({
          type: "antagonist",
          exercises: [ex1, ex2]
        });
        
        usedExercises.add(ex1.id);
        usedExercises.add(ex2.id);
      }
    }
  });
  
  // Then try non-overlapping supersets
  Object.entries(nonOverlappingPairs).forEach(([muscle1, muscle2]) => {
    if (exercisesByMuscle[muscle1] && exercisesByMuscle[muscle2]) {
      const ex1 = exercisesByMuscle[muscle1].find(ex => !usedExercises.has(ex.id));
      const ex2 = exercisesByMuscle[muscle2].find(ex => !usedExercises.has(ex.id));
      
      if (ex1 && ex2) {
        supersets.push({
          type: "non_overlapping",
          exercises: [ex1, ex2]
        });
        
        usedExercises.add(ex1.id);
        usedExercises.add(ex2.id);
      }
    }
  });
  
  // Add remaining exercises as straight sets
  exercises.forEach(ex => {
    if (!usedExercises.has(ex.id)) {
      supersets.push({
        type: "straight_set",
        exercises: [ex]
      });
    }
  });
  
  return {
    type: "supersets",
    sets: supersets
  };
}

// Helper functions
function getRecoveryMultiplier(recoveryFeedback) {
  switch (recoveryFeedback) {
    case "fully_recovered": return 1.0;
    case "somewhat_sore": return 0.7;
    case "very_sore": return 0.3;
    default: return 0.5;
  }
}

function getDaysDifference(date1, date2) {
  if (!date2) return 7; // If there's no last trained date, assume it's been a week
  return Math.ceil(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
}

function calculateWorkoutDuration(structuredWorkout, trainingGoal) {
  // Now calculates more precisely based on exercise count and training goal
  let totalSets = 0;
  let exerciseCount = 0;
  
  if (structuredWorkout.type === "straight_sets") {
    structuredWorkout.exercises.forEach(ex => {
      totalSets += ex.sets;
      exerciseCount++;
    });
  } else if (structuredWorkout.type === "supersets") {
    structuredWorkout.sets.forEach(set => {
      set.exercises.forEach(ex => {
        totalSets += ex.sets;
        exerciseCount++;
      });
    });
  }
  
  // Rest times depend on training goal
  let restTimeBetweenSets = 60; // seconds
  if (trainingGoal === "strength") restTimeBetweenSets = 180;
  else if (trainingGoal === "hypertrophy") restTimeBetweenSets = 90;
  
  // Setup time between exercises (changing equipment, position, etc.)
  const setupTimePerExercise = 60; // seconds
  
  // Estimate: 45 sec per set + rest between sets + setup time
  const totalWorkTime = totalSets * 45; // seconds
  const totalRestTime = totalSets * restTimeBetweenSets;
  const totalSetupTime = exerciseCount * setupTimePerExercise;
  
  // Calculate total workout time in minutes
  return Math.ceil((totalWorkTime + totalRestTime + totalSetupTime) / 60);
}

function calculateStandardWorkoutTime(exercises, trainingGoal) {
  let totalSets = 0;
  exercises.forEach(ex => totalSets += ex.sets);
  
  // Rest times depend on training goal
  let restTime = 60; // seconds
  if (trainingGoal === "strength") restTime = 180;
  else if (trainingGoal === "hypertrophy") restTime = 90;
  
  // Estimate: 45 sec per set + rest between sets
  return (totalSets * (45 + restTime)) / 60; // in minutes
}

// Export all the functions
export {
  calculatePriorityScores,
  selectMuscleGroups,
  allocateVolume,
  selectExercises,
  organizeWorkout
};