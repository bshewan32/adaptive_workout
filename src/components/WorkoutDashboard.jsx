// src/components/WorkoutDashboard.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle } from 'lucide-react';

const WorkoutDashboard = ({ muscleMetrics, userProfile }) => {
  // Prepare data for chart
  const chartData = Object.entries(muscleMetrics).map(([muscle, metrics]) => ({
    name: muscle,
    weeklyVolume: metrics.weeklyVolume || 0,
    minimumDose: userProfile?.muscleGroupSettings?.[muscle]?.minimumDose || 10,
    focusTarget: userProfile?.muscleGroupSettings?.[muscle]?.focusTarget || 15,
    focus: metrics.isFocused || false,
    recoveryLevel: metrics.recoveryStatus || 100,
    lastWorked: metrics.lastTrainedDate 
      ? formatLastWorked(new Date(metrics.lastTrainedDate)) 
      : 'Not yet'
  }));

  // Get focused muscles
  const focusedMuscles = Object.entries(muscleMetrics)
    .filter(([_, metrics]) => metrics.isFocused)
    .map(([muscle]) => muscle);

  // Get muscles below minimum dose
  const belowMinimumMuscles = Object.entries(muscleMetrics)
    .filter(([muscle, metrics]) => 
      metrics.volumeNeededForMinimum > 0 && 
      userProfile?.muscleGroupSettings?.[muscle]?.minimumDose > 0
    )
    .map(([muscle]) => muscle);

  // Get muscles approaching minimum (at least 60% of minimum but not complete)
  const approachingMinimumMuscles = Object.entries(muscleMetrics)
    .filter(([muscle, metrics]) => {
      const minimum = userProfile?.muscleGroupSettings?.[muscle]?.minimumDose || 0;
      return metrics.volumeNeededForMinimum === 0 &&
        metrics.weeklyVolume > 0 &&
        metrics.weeklyVolume >= minimum * 0.6 &&
        metrics.weeklyVolume < minimum;
    })
    .map(([muscle]) => muscle);

  // Get muscles meeting minimum dose
  const meetingMinimumMuscles = Object.entries(muscleMetrics)
    .filter(([muscle, metrics]) => 
      metrics.volumeNeededForMinimum === 0 && 
      metrics.weeklyVolume > 0 &&
      !approachingMinimumMuscles.includes(muscle)
    )
    .map(([muscle]) => muscle);

  // Format the "last worked" text
  function formatLastWorked(date) {
    if (!date) return 'Not yet';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  // Helper function to get recovery color
  const getRecoveryColor = (level) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 70) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  // Generate a suggested workout based on metrics
// Replace the suggestWorkout function in WorkoutDashboard.jsx with this improved version

// Generate a suggested workout based on metrics
const suggestWorkout = () => {
  const workout = {
    primaryFocus: [],
    secondaryFocus: [],
    maintenance: []
  };
  
  // Get all muscles that need work, sorted by priority
  const muscleNeedsList = Object.entries(muscleMetrics)
    .map(([muscle, metrics]) => ({
      muscle,
      isFocused: metrics.isFocused,
      percentComplete: metrics.weeklyVolume / userProfile.muscleGroupSettings[muscle].minimumDose * 100,
      volumeNeeded: metrics.volumeNeededForMinimum,
      recoveryStatus: metrics.recoveryStatus
    }))
    .filter(item => item.volumeNeeded > 0) // Only include muscles below minimum
    .sort((a, b) => {
      // First, prioritize by focus
      if (a.isFocused && !b.isFocused) return -1;
      if (!a.isFocused && b.isFocused) return 1;
      
      // Then by percent complete (lowest first)
      return a.percentComplete - b.percentComplete;
    });
  
  console.log("Muscles sorted by priority:", muscleNeedsList);
  
  // Limit primary focus to 2-3 muscle groups
  const primaryLimit = 3;
  
  // Select top priority muscles (max 3)
  const primaryMuscles = muscleNeedsList.slice(0, primaryLimit);
  
  // Add to primary focus with appropriate set counts
  primaryMuscles.forEach(item => {
    // Calculate appropriate sets - more for higher priority or less complete
    const setCount = item.percentComplete < 30 ? 5 : 
                     item.percentComplete < 50 ? 4 : 3;
    
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
    .filter(([_, metrics]) => 
      metrics.recoveryStatus > 90 && // Well recovered
      metrics.volumeNeededForMinimum === 0 && // Meeting minimum
      !workout.primaryFocus.some(m => m.muscle === _) && // Not already in primary
      !workout.secondaryFocus.some(m => m.muscle === _) // Not already in secondary
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
};
  
  const suggestedWorkout = suggestWorkout();

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Training Dashboard</h2>
      
      {/* Focus Areas */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Current Focus Areas</h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2">
            {Object.keys(muscleMetrics).map(muscle => (
              <div 
                key={muscle}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  muscleMetrics[muscle].isFocused 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                {muscleMetrics[muscle].isFocused && 
                  <CheckCircle className="inline-block ml-1" size={16} />
                }
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Focus areas receive priority in workout planning, even if it means other muscle groups
            only receive their minimum effective dose.
          </p>
        </div>
      </div>
      
      {/* Weekly Training Volume */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Weekly Training Volume vs. Minimum Effective Dose</h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="flex items-center">
              <div className="w-4 h-1 bg-red-500 mr-2"></div>
              <p className="text-sm">Minimum effective dose</p>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-purple-500 mr-2"></div>
              <p className="text-sm">Focus target (for prioritized muscles)</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Sets', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow-sm">
                      <p className="font-semibold">{data.name.charAt(0).toUpperCase() + data.name.slice(1)} {data.focus && "🔍"}</p>
                      <p>Current: {data.weeklyVolume} sets</p>
                      <p>Minimum: {data.minimumDose} sets</p>
                      {data.focus && <p>Focus target: {data.focusTarget} sets</p>}
                      <p className={
                        data.focus 
                          ? (data.weeklyVolume >= data.focusTarget ? "text-green-600" : "text-purple-600")
                          : (data.weeklyVolume >= data.minimumDose ? "text-green-600" : "text-red-600")
                      }>
                        {data.focus 
                          ? (data.weeklyVolume >= data.focusTarget 
                              ? "Meeting focus target ✓" 
                              : `${data.focusTarget - data.weeklyVolume} more sets needed`)
                          : (data.weeklyVolume >= data.minimumDose 
                              ? "Meeting minimum ✓" 
                              : "Below minimum ✗")
                        }
                      </p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar 
                dataKey="weeklyVolume" 
                fill="#8884d8" 
                shape={(props) => {
                  const { x, y, width, height, value, payload } = props;
                  const isBelowMinimum = value < payload.minimumDose;
                  const isFocus = payload.focus;
                  return (
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill={isBelowMinimum ? "#ff8884" : (isFocus ? "#9c5dc0" : "#8884d8")}
                      stroke="#fff"
                    />
                  );
                }}
              />
              {/* Minimum dose and focus target reference lines */}
              {chartData.map((item, index) => {
                const barWidth = 30; 
                const barGap = 55; 
                return (
                  <React.Fragment key={`lines-${item.name}`}>
                    {/* Minimum dose line */}
                    <line 
                      key={`min-line-${item.name}`}
                      x1={index * barGap + 40} 
                      y1={200 - (item.minimumDose * 10)} 
                      x2={index * barGap + 40 + barWidth} 
                      y2={200 - (item.minimumDose * 10)}
                      stroke="#FF0000"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    {/* Focus target line (only for focus muscles) */}
                    {item.focus && (
                      <line 
                        key={`focus-line-${item.name}`}
                        x1={index * barGap + 40} 
                        y1={200 - (item.focusTarget * 10)} 
                        x2={index * barGap + 40 + barWidth} 
                        y2={200 - (item.focusTarget * 10)}
                        stroke="#9c5dc0"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recovery Status */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Recovery Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(muscleMetrics).map(([muscle, metrics]) => (
            <div key={muscle} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-medium capitalize">{muscle}</h4>
                <p className="text-sm text-gray-500">Last worked: {formatLastWorked(metrics.lastTrainedDate ? new Date(metrics.lastTrainedDate) : null)}</p>
              </div>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${getRecoveryColor(metrics.recoveryStatus)}`}></div>
                <span className="font-semibold">{metrics.recoveryStatus}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next Workout Recommendation */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Next Workout Recommendation</h3>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {/* Focus areas section */}
          {focusedMuscles.length > 0 && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mb-4">
              <p className="font-medium">
                Focus on: <span className="text-purple-700 capitalize">
                  {focusedMuscles.join(', ')}
                </span> (user-selected priority)
              </p>
              <p className="text-sm text-gray-600">
                We'll incorporate extra volume for {focusedMuscles.length > 1 ? 'these areas' : 'this area'} in your next workout
              </p>
            </div>
          )}
          
          {/* Priority muscles section */}
          {belowMinimumMuscles.length > 0 && (
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <p>
                Priority (below minimum dose): <span className="font-semibold capitalize">
                  {belowMinimumMuscles.join(', ')}
                </span>
              </p>
            </div>
          )}
          
          {/* Approaching minimum section */}
          {approachingMinimumMuscles.length > 0 && (
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <p>
                Approaching minimum (needs attention): <span className="font-semibold capitalize">
                  {approachingMinimumMuscles.join(', ')}
                </span>
              </p>
            </div>
          )}
          
          {/* Meeting minimum section */}
          {meetingMinimumMuscles.length > 0 && (
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <p>
                Meeting minimum dose: <span className="font-semibold capitalize">
                  {meetingMinimumMuscles.join(', ')}
                </span>
              </p>
            </div>
          )}
          
          {/* Suggested workout section - dynamically generated */}
          <div className="mt-6 bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">Suggested workout for today:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {suggestedWorkout.primaryFocus.length > 0 && (
                <li>
                  <span className="font-medium">Primary focus:</span> {' '}
                  {suggestedWorkout.primaryFocus.map(item => 
                    `${item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)} (${item.sets} sets)`
                  ).join(', ')}
                </li>
              )}
              
              {suggestedWorkout.secondaryFocus.length > 0 && (
                <li>
                  <span className="font-medium">Secondary focus:</span> {' '}
                  {suggestedWorkout.secondaryFocus.map(item => 
                    `${item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)} (${item.sets} sets)`
                  ).join(', ')}
                </li>
              )}
              
              {suggestedWorkout.maintenance.length > 0 && (
                <li>
                  <span className="font-medium">Maintenance:</span> {' '}
                  {suggestedWorkout.maintenance.map(item => 
                    `${item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)} (${item.sets} sets)`
                  ).join(', ')}
                </li>
              )}
              
              <li>
                {60}-minute workout with {
                  suggestedWorkout.primaryFocus.length > 0 ? 
                  `progressive overload on ${suggestedWorkout.primaryFocus[0].muscle}` : 
                  'balanced volume'
                }
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDashboard;