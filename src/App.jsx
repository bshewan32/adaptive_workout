// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutGenerator from './components/WorkoutGenerator';
import WorkoutDisplay from './components/WorkoutDisplay';
import SimpleWorkoutLogger from './components/SimpleWorkoutLogger';
import SimpleWorkoutHistory from './components/SimpleWorkoutHistory';
import UserProfile from './components/UserProfile';
import FirstWorkout from './components/FirstWorkout';
import exercises from './data/exercises';

function App() {
  // State for user profile
  const [userProfile, setUserProfile] = useState({
    name: "User",
    experienceLevel: "intermediate",
    availableEquipment: ['barbell', 'dumbbell', 'bench', 'bodyweight'],
    trainingGoal: "hypertrophy",
    focusAreas: [],
    muscleGroupSettings: {
      chest: {
        minimumDose: 10,
        focusTarget: 16,
        recoveryRate: 8,
      },
      back: {
        minimumDose: 10,
        focusTarget: 16,
        recoveryRate: 8,
      },
      shoulders: {
        minimumDose: 10, 
        focusTarget: 15,
        recoveryRate: 7,
      },
      biceps: {
        minimumDose: 8,
        focusTarget: 14,
        recoveryRate: 8,
      },
      triceps: {
        minimumDose: 8,
        focusTarget: 12,
        recoveryRate: 8,
      },
      quads: {
        minimumDose: 8,
        focusTarget: 12,
        recoveryRate: 6,
      },
      hamstrings: {
        minimumDose: 8,
        focusTarget: 12,
        recoveryRate: 6,
      },
      glutes: {
        minimumDose: 8,
        focusTarget: 12,
        recoveryRate: 6,
      },
      core: {
        minimumDose: 8,
        focusTarget: 12,
        recoveryRate: 9,
      }
    }
  });
  
  // State for generated workout
  const [currentWorkout, setCurrentWorkout] = useState(null);
  
  // State for workout history
  const [workoutHistory, setWorkoutHistory] = useState([]);
  
  // State for first-time user
  const [showFirstWorkout, setShowFirstWorkout] = useState(true);
  
  // State for muscle metrics (for testing)
  const [muscleMetrics, setMuscleMetrics] = useState({
    chest: {
      weeklyVolume: 0, // Start with 0 volume for new users
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.chest.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    back: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.back.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    shoulders: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.shoulders.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    biceps: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.biceps.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    triceps: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.triceps.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    quads: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.quads.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    hamstrings: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.hamstrings.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    glutes: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.glutes.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
    core: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.core.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: false,
    },
  });
  
  // Check for existing workout history in localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('workoutHistory');
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      setWorkoutHistory(parsedHistory);
      
      // If there's workout history, don't show first workout
      if (parsedHistory.length > 0) {
        setShowFirstWorkout(false);
        
        // Update muscle metrics based on history
        updateMuscleMetricsFromHistory(parsedHistory);
      }
    }
  }, []);
  

// Add this debugging version of the function to your App.jsx
// You can temporarily replace your current updateMuscleMetricsFromHistory

// Updated function that properly handles the muscle groups
const updateMuscleMetricsFromHistory = (history) => {
  console.log("Updating metrics from history:", history);
  
  // Start with FRESH metrics (important: zero out all weekly volumes)
  const newMetrics = {
    chest: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.chest.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('chest'),
    },
    back: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.back.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('back'),
    },
    shoulders: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.shoulders.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('shoulders'),
    },
    biceps: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.biceps.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('biceps'),
    },
    triceps: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.triceps.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('triceps'),
    },
    quads: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.quads.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('quads'),
    },
    hamstrings: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.hamstrings.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('hamstrings'),
    },
    glutes: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.glutes.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('glutes'),
    },
    core: {
      weeklyVolume: 0,
      lastTrainedDate: null,
      recoveryStatus: 100,
      volumeNeededForMinimum: userProfile.muscleGroupSettings.core.minimumDose,
      volumeNeededForFocus: 0,
      isFocused: userProfile.focusAreas.includes('core'),
    },
  };
  
  // Process each workout
  history.forEach(workout => {
    console.log("Processing workout:", workout);
    
    // Ensure workout structure is correct
    if (!workout.exercises || !Array.isArray(workout.exercises)) {
      console.error("Missing or invalid exercises array in workout", workout);
      return; // Skip this workout
    }
    
    if (!workout.musclesTargeted || !Array.isArray(workout.musclesTargeted)) {
      console.error("Missing or invalid musclesTargeted array in workout", workout);
      return; // Skip this workout
    }
    
    const workoutDate = new Date(workout.date);
    const now = new Date();
    const daysDifference = Math.floor((now - workoutDate) / (1000 * 60 * 60 * 24));
    console.log("Days since workout:", daysDifference);
    
    // Only include workouts from the last 7 days for weekly volume
    if (daysDifference <= 7) {
      workout.musclesTargeted.forEach(muscle => {
        if (!newMetrics[muscle]) {
          console.error("Unknown muscle group:", muscle);
          return; // Skip this muscle
        }
        
        // Log the musclesTargeted we're processing
        console.log(`Processing targeted muscle: ${muscle}`);
        
        // Find the exercises for this muscle
        const primaryExercises = workout.exercises.filter(ex => ex.primaryMuscleGroup === muscle);
        console.log(`Primary exercises for ${muscle}:`, primaryExercises);
        
        // Calculate primary volume
        let primaryVolume = 0;
        primaryExercises.forEach(ex => {
          if (typeof ex.sets !== 'number') {
            console.error(`Invalid sets value for exercise:`, ex);
          } else {
            primaryVolume += ex.sets;
          }
        });
        
        // Find exercises where this is a secondary muscle
        const secondaryExercises = workout.exercises.filter(ex => {
          return ex.secondaryMuscleGroups && 
                 Array.isArray(ex.secondaryMuscleGroups) && 
                 ex.secondaryMuscleGroups.includes(muscle);
        });
        console.log(`Secondary exercises for ${muscle}:`, secondaryExercises);
        
        // Calculate secondary volume
        let secondaryVolume = 0;
        secondaryExercises.forEach(ex => {
          if (typeof ex.sets !== 'number') {
            console.error(`Invalid sets value for exercise:`, ex);
          } else {
            secondaryVolume += ex.sets * 0.5; // Half credit for secondary muscles
          }
        });
        
        // Add volumes
        const totalVolume = primaryVolume + secondaryVolume;
        console.log(`Total volume for ${muscle}: ${totalVolume} (${primaryVolume} primary + ${secondaryVolume} secondary)`);
        newMetrics[muscle].weeklyVolume += totalVolume;
      });
    }
    
    // Update last trained date (take the most recent)
    workout.musclesTargeted.forEach(muscle => {
      if (newMetrics[muscle]) {
        if (!newMetrics[muscle].lastTrainedDate || 
            workoutDate > new Date(newMetrics[muscle].lastTrainedDate)) {
          newMetrics[muscle].lastTrainedDate = workoutDate;
          
          // Update recovery status based on days since last trained
          if (daysDifference <= 1) {
            newMetrics[muscle].recoveryStatus = 70; // 1 day ago - 70% recovered
          } else if (daysDifference === 2) {
            newMetrics[muscle].recoveryStatus = 85; // 2 days ago - 85% recovered
          } else {
            newMetrics[muscle].recoveryStatus = 100; // 3+ days - fully recovered
          }
        }
      }
    });
  });
  
  // Calculate volume needed for minimum and focus
  Object.keys(newMetrics).forEach(muscle => {
    // Make sure the muscle exists in the userProfile settings
    if (userProfile.muscleGroupSettings[muscle]) {
      const minimumDose = userProfile.muscleGroupSettings[muscle].minimumDose;
      newMetrics[muscle].volumeNeededForMinimum = 
        newMetrics[muscle].weeklyVolume < minimumDose ? 
        minimumDose - newMetrics[muscle].weeklyVolume : 0;
        
      if (newMetrics[muscle].isFocused) {
        const focusTarget = userProfile.muscleGroupSettings[muscle].focusTarget;
        newMetrics[muscle].volumeNeededForFocus = 
          newMetrics[muscle].weeklyVolume < focusTarget ? 
          focusTarget - newMetrics[muscle].weeklyVolume : 0;
      }
    } else {
      console.error(`Missing muscle group settings for ${muscle}`);
    }
  });
  
  console.log("Calculated new metrics:", newMetrics);
  setMuscleMetrics(newMetrics);
};


  
  // Update muscle metrics when user profile changes
  useEffect(() => {
    // Update isFocused status based on user profile focus areas
    const updatedMetrics = { ...muscleMetrics };
    
    Object.keys(updatedMetrics).forEach(muscle => {
      // Update focus status
      updatedMetrics[muscle].isFocused = userProfile.focusAreas.includes(muscle);
      
      // Update volume needed for minimum
      if (userProfile.muscleGroupSettings && userProfile.muscleGroupSettings[muscle]) {
        const minimumDose = userProfile.muscleGroupSettings[muscle].minimumDose;
        updatedMetrics[muscle].volumeNeededForMinimum = 
          updatedMetrics[muscle].weeklyVolume < minimumDose ? 
          minimumDose - updatedMetrics[muscle].weeklyVolume : 0;
          
        // Update volume needed for focus
        if (updatedMetrics[muscle].isFocused) {
          const focusTarget = userProfile.muscleGroupSettings[muscle].focusTarget;
          updatedMetrics[muscle].volumeNeededForFocus = 
            updatedMetrics[muscle].weeklyVolume < focusTarget ? 
            focusTarget - updatedMetrics[muscle].weeklyVolume : 0;
        }
      }
    });
    
    setMuscleMetrics(updatedMetrics);
  }, [userProfile]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  
  const handleProfileUpdate = (profile) => {
    setUserProfile(profile);
  };
  
  const handleWorkoutGenerated = (workout) => {
    setCurrentWorkout(workout);
    setShowWorkoutLogger(false);
    // In a real app, you would scroll to the workout display
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  const handleLogWorkout = () => {
    setShowWorkoutLogger(true);
  };
  
  
// Replace the handleWorkoutLogged function with this simplified version:

const handleWorkoutLogged = () => {
  if (!currentWorkout) return;
  
  console.log("Logging workout:", currentWorkout);
  
  // Create workout history entry with detailed exercise data
  const newWorkout = {
    id: Date.now(),
    date: new Date(),
    musclesTargeted: currentWorkout.musclesTargeted,
    duration: currentWorkout.estimatedDuration,
    exercises: []
  };
  
  // Process exercises to ensure they have all required data
  if (currentWorkout.workout.type === "straight_sets") {
    newWorkout.exercises = currentWorkout.workout.exercises.map(ex => ({
      id: ex.id || `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ex.name,
      sets: ex.sets,
      primaryMuscleGroup: ex.primaryMuscleGroup,
      secondaryMuscleGroups: ex.secondaryMuscleGroups || [],
      exerciseType: ex.exerciseType || "compound"
    }));
  } else {
    // Handle superset workout format
    currentWorkout.workout.sets.forEach(set => {
      set.exercises.forEach(ex => {
        newWorkout.exercises.push({
          id: ex.id || `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ex.name,
          sets: ex.sets,
          primaryMuscleGroup: ex.primaryMuscleGroup,
          secondaryMuscleGroups: ex.secondaryMuscleGroups || [],
          exerciseType: ex.exerciseType || "compound"
        });
      });
    });
  }
  
  console.log("Processed workout data:", newWorkout);
  
  // Update workout history
  const updatedHistory = [...workoutHistory, newWorkout];
  setWorkoutHistory(updatedHistory);
  
  // Save to localStorage
  localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
  
  // DIRECT UPDATE TO METRICS - this is simpler and more reliable
  const updatedMetrics = { ...muscleMetrics };
  
  // Process this workout's impact on metrics
  newWorkout.exercises.forEach(exercise => {
    const primaryMuscle = exercise.primaryMuscleGroup;
    if (primaryMuscle && updatedMetrics[primaryMuscle]) {
      // Update volume for primary muscle
      updatedMetrics[primaryMuscle].weeklyVolume += exercise.sets;
      updatedMetrics[primaryMuscle].lastTrainedDate = new Date();
      updatedMetrics[primaryMuscle].recoveryStatus = 70; // Just worked out
      
      // Recalculate minimum and focus needs
      const minimumDose = userProfile.muscleGroupSettings[primaryMuscle].minimumDose;
      updatedMetrics[primaryMuscle].volumeNeededForMinimum = 
        updatedMetrics[primaryMuscle].weeklyVolume < minimumDose ? 
        minimumDose - updatedMetrics[primaryMuscle].weeklyVolume : 0;
        
      if (updatedMetrics[primaryMuscle].isFocused) {
        const focusTarget = userProfile.muscleGroupSettings[primaryMuscle].focusTarget;
        updatedMetrics[primaryMuscle].volumeNeededForFocus = 
          updatedMetrics[primaryMuscle].weeklyVolume < focusTarget ? 
          focusTarget - updatedMetrics[primaryMuscle].weeklyVolume : 0;
      }
    }
    
    // Process secondary muscles (if any)
    if (exercise.secondaryMuscleGroups && Array.isArray(exercise.secondaryMuscleGroups)) {
      exercise.secondaryMuscleGroups.forEach(muscle => {
        if (updatedMetrics[muscle]) {
          // Half volume for secondary impact
          updatedMetrics[muscle].weeklyVolume += exercise.sets * 0.5;
          
          // Update last trained only if not already updated by being a primary
          if (!updatedMetrics[muscle].lastTrainedDate || 
              updatedMetrics[muscle].lastTrainedDate < new Date()) {
            updatedMetrics[muscle].lastTrainedDate = new Date();
            updatedMetrics[muscle].recoveryStatus = 85; // Secondary impact = less recovery needed
          }
          
          // Recalculate minimum and focus needs
          const minimumDose = userProfile.muscleGroupSettings[muscle].minimumDose;
          updatedMetrics[muscle].volumeNeededForMinimum = 
            updatedMetrics[muscle].weeklyVolume < minimumDose ? 
            minimumDose - updatedMetrics[muscle].weeklyVolume : 0;
            
          if (updatedMetrics[muscle].isFocused) {
            const focusTarget = userProfile.muscleGroupSettings[muscle].focusTarget;
            updatedMetrics[muscle].volumeNeededForFocus = 
              updatedMetrics[muscle].weeklyVolume < focusTarget ? 
              focusTarget - updatedMetrics[muscle].weeklyVolume : 0;
          }
        }
      });
    }
  });
  
  setMuscleMetrics(updatedMetrics);
  
  // Reset UI
  setShowWorkoutLogger(false);
  setCurrentWorkout(null);
  
  // Switch to dashboard to show updated metrics
  setActiveTab('dashboard');
  
  // Don't show first workout anymore
  setShowFirstWorkout(false);
  
  // Show success message
  alert('Workout logged successfully!');
};

  const handleWorkoutUpdated = (updatedWorkout) => {
    setCurrentWorkout(updatedWorkout);
  };
  
  const handleSkipFirstWorkout = () => {
    setShowFirstWorkout(false);
    setActiveTab('workout');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Intelligent Workout Planner</h1>
        </div>
      </header>
      
      <nav className="bg-white shadow">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'dashboard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'workout' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
              onClick={() => setActiveTab('workout')}
            >
              Create Workout
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'history' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto p-4">
        {/* First workout flow for new users */}
        {showFirstWorkout ? (
          <div className="mb-8">
            <FirstWorkout 
              userProfile={userProfile}
              onWorkoutGenerated={workout => {
                handleWorkoutGenerated(workout);
                setShowFirstWorkout(false);
                setActiveTab('workout');
              }}
              onCustomWorkoutCreated={workout => {
                setCurrentWorkout(workout);
                handleWorkoutLogged();
              }}
              onSkip={handleSkipFirstWorkout}
            />
          </div>
        ) : (
          <div className="mb-8">
            {activeTab === 'dashboard' && (
              <WorkoutDashboard 
                muscleMetrics={muscleMetrics}
                userProfile={userProfile}
              />
            )}
            
            {activeTab === 'profile' && (
              <UserProfile 
                initialProfile={userProfile}
                onProfileUpdate={handleProfileUpdate}
              />
            )}
            
            {activeTab === 'workout' && (
              <div className="space-y-8">
                <WorkoutGenerator 
                  muscleMetrics={muscleMetrics} 
                  userProfile={userProfile} 
                  onWorkoutGenerated={handleWorkoutGenerated}
                />

                  {currentWorkout && !showWorkoutLogger && (
                    <div>
                      <WorkoutDisplay
                        workout={currentWorkout}
                        onWorkoutUpdated={handleWorkoutUpdated}
                      />
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleLogWorkout}
                          className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Complete & Log This Workout
                        </button>
                      </div>
                    </div>
                  )}
                
                {currentWorkout && showWorkoutLogger && (
                  <SimpleWorkoutLogger 
                    workout={currentWorkout}
                    onWorkoutLogged={handleWorkoutLogged}
                  />
                )}
              </div>
            )}
            
            {activeTab === 'history' && (
              <SimpleWorkoutHistory workouts={workoutHistory} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

// // src/App.jsx
// import { useState, useEffect } from 'react';
// import './App.css';
// import WorkoutDashboard from './components/WorkoutDashboard';
// import WorkoutGenerator from './components/WorkoutGenerator';
// import WorkoutDisplay from './components/WorkoutDisplay';
// import SimpleWorkoutLogger from './components/SimpleWorkoutLogger';
// import SimpleWorkoutHistory from './components/SimpleWorkoutHistory';
// import UserProfile from './components/UserProfile';
// import exercises from './data/exercises';

// function App() {
//   // State for user profile
//   const [userProfile, setUserProfile] = useState({
//     name: "User",
//     experienceLevel: "intermediate",
//     availableEquipment: ['barbell', 'dumbbell', 'bench', 'bodyweight'],
//     trainingGoal: "hypertrophy",
//     focusAreas: [],
//     muscleGroupSettings: {
//       chest: {
//         minimumDose: 10,
//         focusTarget: 16,
//         recoveryRate: 8,
//       },
//       back: {
//         minimumDose: 10,
//         focusTarget: 16,
//         recoveryRate: 8,
//       },
//       shoulders: {
//         minimumDose: 10, 
//         focusTarget: 15,
//         recoveryRate: 7,
//       },
//       biceps: {
//         minimumDose: 8,
//         focusTarget: 14,
//         recoveryRate: 8,
//       },
//       triceps: {
//         minimumDose: 8,
//         focusTarget: 12,
//         recoveryRate: 8,
//       },
//       legs: {
//         minimumDose: 12,
//         focusTarget: 18,
//         recoveryRate: 5,
//       },
//       core: {
//         minimumDose: 8,
//         focusTarget: 12,
//         recoveryRate: 9,
//       }
//     }
//   });
  
//   // State for generated workout
//   const [currentWorkout, setCurrentWorkout] = useState(null);
  
//   // State for muscle metrics (for testing)
//   const [muscleMetrics, setMuscleMetrics] = useState({
//     chest: {
//       weeklyVolume: 12,
//       lastTrainedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//       recoveryStatus: 90,
//       volumeNeededForMinimum: 0,
//       volumeNeededForFocus: 4,
//       isFocused: false,
//     },
//     back: {
//       weeklyVolume: 14,
//       lastTrainedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//       recoveryStatus: 85,
//       volumeNeededForMinimum: 0,
//       volumeNeededForFocus: 2,
//       isFocused: false,
//     },
//     shoulders: {
//       weeklyVolume: 8,
//       lastTrainedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
//       recoveryStatus: 100,
//       volumeNeededForMinimum: 2,
//       volumeNeededForFocus: 7,
//       isFocused: false,
//     },
//     biceps: {
//       weeklyVolume: 10,
//       lastTrainedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//       recoveryStatus: 80,
//       volumeNeededForMinimum: 0,
//       volumeNeededForFocus: 4,
//       isFocused: false,
//     },
//     triceps: {
//       weeklyVolume: 9,
//       lastTrainedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//       recoveryStatus: 85,
//       volumeNeededForMinimum: 0,
//       volumeNeededForFocus: 3,
//       isFocused: false,
//     },
//     legs: {
//       weeklyVolume: 6,
//       lastTrainedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
//       recoveryStatus: 100,
//       volumeNeededForMinimum: 6,
//       volumeNeededForFocus: 12,
//       isFocused: false,
//     },
//     core: {
//       weeklyVolume: 8,
//       lastTrainedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
//       recoveryStatus: 95,
//       volumeNeededForMinimum: 0,
//       volumeNeededForFocus: 4,
//       isFocused: false,
//     },
//   });
  
//   // Update muscle metrics when user profile changes
//   useEffect(() => {
//     // Update isFocused status based on user profile focus areas
//     const updatedMetrics = { ...muscleMetrics };
    
//     Object.keys(updatedMetrics).forEach(muscle => {
//       // Update focus status
//       updatedMetrics[muscle].isFocused = userProfile.focusAreas.includes(muscle);
      
//       // Update volume needed for minimum
//       if (userProfile.muscleGroupSettings && userProfile.muscleGroupSettings[muscle]) {
//         const minimumDose = userProfile.muscleGroupSettings[muscle].minimumDose;
//         updatedMetrics[muscle].volumeNeededForMinimum = 
//           updatedMetrics[muscle].weeklyVolume < minimumDose ? 
//           minimumDose - updatedMetrics[muscle].weeklyVolume : 0;
          
//         // Update volume needed for focus
//         if (updatedMetrics[muscle].isFocused) {
//           const focusTarget = userProfile.muscleGroupSettings[muscle].focusTarget;
//           updatedMetrics[muscle].volumeNeededForFocus = 
//             updatedMetrics[muscle].weeklyVolume < focusTarget ? 
//             focusTarget - updatedMetrics[muscle].weeklyVolume : 0;
//         }
//       }
//     });
    
//     setMuscleMetrics(updatedMetrics);
//   }, [userProfile]);
  
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  
//   const handleProfileUpdate = (profile) => {
//     setUserProfile(profile);
//   };
  
//   const handleWorkoutGenerated = (workout) => {
//     setCurrentWorkout(workout);
//     setShowWorkoutLogger(false);
//     // In a real app, you would scroll to the workout display
//     window.scrollTo({
//       top: document.body.scrollHeight,
//       behavior: 'smooth'
//     });
//   };
  
//   const handleLogWorkout = () => {
//     setShowWorkoutLogger(true);
//   };
  
//   const handleWorkoutLogged = () => {
//     // Reset UI
//     setShowWorkoutLogger(false);
//     setCurrentWorkout(null);
    
//     // Switch to dashboard to show updated metrics
//     setActiveTab('dashboard');
    
//     // Show success message
//     alert('Workout logged successfully!');
    
//     // Update muscle metrics to simulate the effect of logging a workout
//     // In a real app, this would come from the API
//     const newMetrics = { ...muscleMetrics };
//     if (currentWorkout) {
//       currentWorkout.musclesTargeted.forEach(muscle => {
//         if (newMetrics[muscle]) {
//           // Simulate adding volume
//           newMetrics[muscle].weeklyVolume += 3; // Add average 3 sets per muscle
//           newMetrics[muscle].lastTrainedDate = new Date();
//           newMetrics[muscle].recoveryStatus = 70; // Just worked out, so recovery is lower
          
//           // Update minimum and focus needs
//           const minimumDose = userProfile.muscleGroupSettings[muscle].minimumDose;
//           newMetrics[muscle].volumeNeededForMinimum = 
//             newMetrics[muscle].weeklyVolume < minimumDose ? 
//             minimumDose - newMetrics[muscle].weeklyVolume : 0;
            
//           if (newMetrics[muscle].isFocused) {
//             const focusTarget = userProfile.muscleGroupSettings[muscle].focusTarget;
//             newMetrics[muscle].volumeNeededForFocus = 
//               newMetrics[muscle].weeklyVolume < focusTarget ? 
//               focusTarget - newMetrics[muscle].weeklyVolume : 0;
//           }
//         }
//       });
      
//       setMuscleMetrics(newMetrics);
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-gray-800 text-white p-4">
//         <div className="container mx-auto">
//           <h1 className="text-2xl font-bold">Intelligent Workout Planner</h1>
//         </div>
//       </header>
      
//       <nav className="bg-white shadow">
//         <div className="container mx-auto">
//           <div className="flex overflow-x-auto">
//             <button 
//               className={`px-4 py-3 font-medium ${activeTab === 'dashboard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
//               onClick={() => setActiveTab('dashboard')}
//             >
//               Dashboard
//             </button>
//             <button 
//               className={`px-4 py-3 font-medium ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
//               onClick={() => setActiveTab('profile')}
//             >
//               Profile
//             </button>
//             <button 
//               className={`px-4 py-3 font-medium ${activeTab === 'workout' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
//               onClick={() => setActiveTab('workout')}
//             >
//               Create Workout
//             </button>
//             <button 
//               className={`px-4 py-3 font-medium ${activeTab === 'history' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-700'}`}
//               onClick={() => setActiveTab('history')}
//             >
//               History
//             </button>
//           </div>
//         </div>
//       </nav>
      
//       <main className="container mx-auto p-4">
//         <div className="mb-8">
//           {activeTab === 'dashboard' && (
//             <WorkoutDashboard 
//               muscleMetrics={muscleMetrics}
//               userProfile={userProfile}
//             />
//           )}
          
//           {activeTab === 'profile' && (
//             <UserProfile 
//               initialProfile={userProfile}
//               onProfileUpdate={handleProfileUpdate}
//             />
//           )}
          
//           {activeTab === 'workout' && (
//             <div className="space-y-8">
//               <WorkoutGenerator 
//                 muscleMetrics={muscleMetrics} 
//                 userProfile={userProfile} 
//                 onWorkoutGenerated={handleWorkoutGenerated}
//               />
              
//               {currentWorkout && !showWorkoutLogger && (
//                 <div>
//                   <WorkoutDisplay workout={currentWorkout} />
//                   <div className="mt-4 flex justify-center">
//                     <button
//                       onClick={handleLogWorkout}
//                       className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
//                     >
//                       Complete & Log This Workout
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               {currentWorkout && showWorkoutLogger && (
//                 <SimpleWorkoutLogger 
//                   workout={currentWorkout}
//                   onWorkoutLogged={handleWorkoutLogged}
//                 />
//               )}
//             </div>
//           )}
          
//           {activeTab === 'history' && (
//             <SimpleWorkoutHistory />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;