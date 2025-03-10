// src/components/WorkoutHistory.jsx
import React, { useState, useEffect } from 'react';
import { getWorkouts, updateWorkoutRecovery } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const WorkoutHistory = ({ userId }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [recoveryFeedback, setRecoveryFeedback] = useState({
    chest: 'fully_recovered',
    back: 'fully_recovered',
    shoulders: 'fully_recovered',
    biceps: 'fully_recovered',
    triceps: 'fully_recovered',
    legs: 'fully_recovered',
    core: 'fully_recovered'
  });
  
  useEffect(() => {
    if (userId) {
      fetchWorkouts();
    }
  }, [userId]);
  
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = await getWorkouts(userId);
      setWorkouts(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load workout history');
      setLoading(false);
      console.error('Error fetching workouts:', error);
    }
  };
  
  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    if (workout.recoveryFeedback) {
      setRecoveryFeedback(workout.recoveryFeedback);
    } else {
      // Reset to default
      setRecoveryFeedback({
        chest: 'fully_recovered',
        back: 'fully_recovered',
        shoulders: 'fully_recovered',
        biceps: 'fully_recovered',
        triceps: 'fully_recovered',
        legs: 'fully_recovered',
        core: 'fully_recovered'
      });
    }
  };
  
  const handleRecoveryChange = (muscle, value) => {
    setRecoveryFeedback({
      ...recoveryFeedback,
      [muscle]: value
    });
  };
  
  const handleRecoverySave = async () => {
    if (!selectedWorkout) return;
    
    try {
      await updateWorkoutRecovery(selectedWorkout._id, recoveryFeedback);
      
      // Update local state
      const updatedWorkouts = workouts.map(workout => 
        workout._id === selectedWorkout._id
          ? { ...workout, recoveryFeedback }
          : workout
      );
      
      setWorkouts(updatedWorkouts);
      setSelectedWorkout({
        ...selectedWorkout,
        recoveryFeedback
      });
      
      alert('Recovery feedback saved!');
    } catch (error) {
      console.error('Error saving recovery feedback:', error);
      alert('Failed to save recovery feedback');
    }
  };
  
  // Transform workout data for volume chart
  const getVolumeChartData = () => {
    // Group by date (day)
    const volumeByDate = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date).toLocaleDateString();
      
      if (!volumeByDate[date]) {
        volumeByDate[date] = {
          date,
          chest: 0,
          back: 0,
          shoulders: 0,
          biceps: 0,
          triceps: 0,
          legs: 0,
          core: 0,
          total: 0
        };
      }
      
      // Count sets for each exercise
      workout.exercises.forEach(exercise => {
        const muscleGroup = exercise.exerciseId?.primaryMuscleGroup;
        if (!muscleGroup) return;
        
        const sets = exercise.sets.length;
        volumeByDate[date][muscleGroup] += sets;
        volumeByDate[date].total += sets;
      });
    });
    
    // Convert to array and sort by date
    return Object.values(volumeByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading workout history...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Workout History</h2>
      
      {workouts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workout history yet. Start logging your workouts!
        </div>
      ) : (
        <div className="space-y-8">
          {/* Volume Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Training Volume</h3>
            <div className="h-64 bg-gray-50 p-4 rounded">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVolumeChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Sets', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="chest" fill="#8884d8" name="Chest" />
                  <Bar dataKey="back" fill="#82ca9d" name="Back" />
                  <Bar dataKey="shoulders" fill="#ffc658" name="Shoulders" />
                  <Bar dataKey="legs" fill="#ff8042" name="Legs" />
                  <Bar dataKey="arms" fill="#0088fe" name="Arms" />
                  <Bar dataKey="core" fill="#00C49F" name="Core" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Workout List */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Recent Workouts</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {workouts.map(workout => (
                <div 
                  key={workout._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-shadow hover:shadow-md ${
                    selectedWorkout?._id === workout._id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleWorkoutSelect(workout)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {formatDate(workout.date)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {workout.duration} min • {workout.exercises.length} exercises
                      </p>
                    </div>
                    {workout.rating && (
                      <div className="text-yellow-500">
                        {'★'.repeat(workout.rating)}
                        {'☆'.repeat(5 - workout.rating)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {workout.exercises.slice(0, 3).map(ex => ex.exerciseId?.name).join(', ')}
                      {workout.exercises.length > 3 ? '...' : ''}
                    </p>
                  </div>
                  
                  {workout.recoveryFeedback && (
                    <div className="mt-2 flex gap-1">
                      {Object.entries(workout.recoveryFeedback).some(([_, status]) => status !== 'fully_recovered') && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Recovery Tracked
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected Workout Detail */}
          {selectedWorkout && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-3">
                Workout Details - {formatDate(selectedWorkout.date)}
              </h3>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Exercises</h4>
                <div className="space-y-2">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{exercise.exerciseId?.name}</div>
                      <div className="text-sm text-gray-600">
                        {exercise.sets.map((set, setIndex) => (
                          <span key={setIndex} className="mr-3">
                            Set {setIndex + 1}: {set.weight > 0 ? `${set.weight}kg × ` : ''}{set.reps} reps
                            {set.rpe ? ` @ RPE ${set.rpe}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recovery Feedback */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Recovery Feedback</h4>
                <p className="text-sm text-gray-600 mb-3">
                  How are your muscles feeling after this workout?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(recoveryFeedback).map(muscle => (
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
                
                <button
                  onClick={handleRecoverySave}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Save Recovery Feedback
                </button>
              </div>
              
              {/* Notes */}
              {selectedWorkout.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded">
                    {selectedWorkout.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;