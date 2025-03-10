// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutGenerator from './components/WorkoutGenerator';
import WorkoutDisplay from './components/WorkoutDisplay';
import WorkoutLogger from './components/WorkoutLogger';
import WorkoutHistory from './components/WorkoutHistory';
import UserProfile from './components/UserProfile';
import { getUserProfile, createUserProfile, updateUserProfile, getMuscleMetrics } from './services/apiService';

function App() {
  // User ID - in a real app, this would come from authentication
  const [userId, setUserId] = useState(null);
  
  // State for user profile
  const [userProfile, setUserProfile] = useState(null);
  
  // State for generated workout
  const [currentWorkout, setCurrentWorkout] = useState(null);
  
  // State for muscle metrics (from API)
  const [muscleMetrics, setMuscleMetrics] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  
  // Create or fetch user on component mount
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      try {
        // In a real app with auth, you would get the user ID from authentication
        // For now, we'll create a new user or use a hardcoded ID
        
        // Try to get the userId from localStorage
        const storedUserId = localStorage.getItem('workoutAppUserId');
        
        if (storedUserId) {
          // If we have a stored ID, try to fetch the user
          try {
            const userProfileData = await getUserProfile(storedUserId);
            setUserId(storedUserId);
            setUserProfile(userProfileData);
          } catch (error) {
            // If user fetch fails, create a new user
            console.log('Could not find user, creating new one');
            await createNewUser();
          }
        } else {
          // No stored ID, create a new user
          await createNewUser();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        setError('Failed to initialize app. Please refresh the page.');
        setIsLoading(false);
      }
    };
    
    const createNewUser = async () => {
      // Default user profile
      const defaultProfile = {
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
          legs: {
            minimumDose: 12,
            focusTarget: 18,
            recoveryRate: 5,
          },
          core: {
            minimumDose: 8,
            focusTarget: 12,
            recoveryRate: 9,
          }
        }
      };
      
      // Create new user
      const newUser = await createUserProfile(defaultProfile);
      
      // Save user ID to localStorage
      localStorage.setItem('workoutAppUserId', newUser._id);
      
      // Update state
      setUserId(newUser._id);
      setUserProfile(newUser);
    };
    
    initializeUser();
  }, []);
  
  // Fetch muscle metrics when userId changes
  useEffect(() => {
    const fetchMuscleMetrics = async () => {
      if (!userId) return;
      
      try {
        const metrics = await getMuscleMetrics(userId);
        setMuscleMetrics(metrics);
      } catch (error) {
        console.error('Error fetching muscle metrics:', error);
        // If no data, use default metrics
        setMuscleMetrics({
          chest: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          back: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          shoulders: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          biceps: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          triceps: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          legs: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 },
          core: { weeklyVolume: 0, lastTrainedDate: null, recoveryStatus: 100 }
        });
      }
    };
    
    fetchMuscleMetrics();
  }, [userId]);
  
  // Update muscle metrics when user profile changes
  useEffect(() => {
    if (userProfile && muscleMetrics) {
      // Update isFocused status based on user profile focus areas
      const updatedMetrics = { ...muscleMetrics };
      
      Object.keys(updatedMetrics).forEach(muscle => {
        // Update focus status
        updatedMetrics[muscle].isFocused = userProfile.focusAreas.includes(muscle);
        
        // Update volume needed for minimum
        if (userProfile.muscleGroupSettings[muscle]) {
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
    }
  }, [userProfile, muscleMetrics?.chest?.weeklyVolume]); // Only re-run when weekly volume changes
  
  const handleProfileUpdate = async (profile) => {
    if (!userId) return;
    
    try {
      // Update profile in database
      const updatedProfile = await updateUserProfile(userId, profile);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  
  const handleWorkoutGenerated = (workout) => {
    setCurrentWorkout(workout);
    setShowWorkoutLogger(false); // Hide logger when generating new workout
    
    // In a real app, you would scroll to the workout display
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  const handleLogWorkout = () => {
    setShowWorkoutLogger(true);
  };
  
  const handleWorkoutLogged = async () => {
    // Refresh muscle metrics
    try {
      const metrics = await getMuscleMetrics(userId);
      setMuscleMetrics(metrics);
    } catch (error) {
      console.error('Error refreshing muscle metrics:', error);
    }
    
    // Reset UI
    setShowWorkoutLogger(false);
    setCurrentWorkout(null);
    
    // Switch to dashboard to show updated metrics
    setActiveTab('dashboard');
    
    // Show success message
    alert('Workout logged successfully!');
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
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
        <div className="mb-8">
          {activeTab === 'dashboard' && muscleMetrics && (
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
                muscleMetrics={muscleMetrics || {}} 
                userProfile={userProfile || {}} 
                onWorkoutGenerated={handleWorkoutGenerated}
              />
              
              {currentWorkout && !showWorkoutLogger && (
                <div>
                  <WorkoutDisplay workout={currentWorkout} />
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
                <WorkoutLogger 
                  workout={currentWorkout}
                  userId={userId}
                  onWorkoutLogged={handleWorkoutLogged}
                />
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <WorkoutHistory userId={userId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;