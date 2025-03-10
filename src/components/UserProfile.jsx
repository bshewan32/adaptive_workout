// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';

const muscleGroups = [
  'chest', 'back', 'shoulders', 'biceps', 
  'triceps', 'legs', 'core'
];

const equipment = [
  'barbell', 'dumbbell', 'kettlebell', 'cable',
  'machine', 'bands', 'bodyweight', 'bench'
];

// Default user profile settings
const defaultSettings = {
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

const UserProfile = ({ initialProfile, onProfileUpdate }) => {
  const [profile, setProfile] = useState(defaultSettings);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  // Initialize with provided profile data if available
  useEffect(() => {
    if (initialProfile) {
      // Merge with defaults to ensure all fields exist
      const mergedProfile = {
        ...defaultSettings,
        ...initialProfile,
        muscleGroupSettings: {
          ...defaultSettings.muscleGroupSettings,
          ...(initialProfile.muscleGroupSettings || {})
        }
      };
      setProfile(mergedProfile);
    }
  }, [initialProfile]);
  
  const handleInputChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };
  
  const handleEquipmentToggle = (item) => {
    const newEquipment = profile.availableEquipment.includes(item)
      ? profile.availableEquipment.filter(e => e !== item)
      : [...profile.availableEquipment, item];
      
    handleInputChange('availableEquipment', newEquipment);
  };
  
  const handleFocusToggle = (muscle) => {
    const newFocusAreas = profile.focusAreas.includes(muscle)
      ? profile.focusAreas.filter(m => m !== muscle)
      : [...profile.focusAreas, muscle];
      
    handleInputChange('focusAreas', newFocusAreas);
  };
  
  const handleMuscleSettingChange = (muscle, setting, value) => {
    setProfile({
      ...profile,
      muscleGroupSettings: {
        ...profile.muscleGroupSettings,
        [muscle]: {
          ...profile.muscleGroupSettings[muscle],
          [setting]: parseInt(value)
        }
      }
    });
  };
  
  const handleSubmit = () => {
    onProfileUpdate(profile);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your Training Profile</h2>
      
      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Experience Level */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Experience Level</label>
        <select 
          value={profile.experienceLevel}
          onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      {/* Training Goal */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Training Goal</label>
        <select 
          value={profile.trainingGoal}
          onChange={(e) => handleInputChange('trainingGoal', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="strength">Strength</option>
          <option value="hypertrophy">Hypertrophy (Muscle Growth)</option>
          <option value="endurance">Endurance</option>
          <option value="blend">Balanced Blend</option>
        </select>
      </div>
      
      {/* Available Equipment */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Available Equipment</label>
        <div className="flex flex-wrap gap-2">
          {equipment.map(item => (
            <button
              key={item}
              type="button"
              className={`px-3 py-1 rounded-full text-sm ${
                profile.availableEquipment.includes(item)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleEquipmentToggle(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      
      {/* Focus Areas */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Focus Areas</label>
        <p className="text-sm text-gray-600 mb-2">
          Select muscle groups you want to prioritize in your workouts
        </p>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map(muscle => (
            <button
              key={muscle}
              type="button"
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                profile.focusAreas.includes(muscle)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleFocusToggle(muscle)}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>
      
      {/* Advanced Settings Toggle */}
      <button
        type="button"
        className="flex items-center gap-2 text-gray-700 mb-4"
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
      >
        <span className="text-lg">{isAdvancedOpen ? '▼' : '►'}</span>
        <span>Advanced Settings</span>
      </button>
      
      {/* Advanced Settings Panel */}
      {isAdvancedOpen && (
        <div className="mb-6 border-t pt-4">
          <p className="text-sm text-gray-600 mb-4">
            Customize volume targets for each muscle group
          </p>
          
          {muscleGroups.map(muscle => (
            <div key={muscle} className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium capitalize mb-2">{muscle}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Minimum Weekly Sets</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={profile.muscleGroupSettings[muscle]?.minimumDose || 10}
                    onChange={(e) => handleMuscleSettingChange(muscle, 'minimumDose', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Focus Target (Sets)</label>
                  <input
                    type="number"
                    min="8"
                    max="25"
                    value={profile.muscleGroupSettings[muscle]?.focusTarget || 15}
                    onChange={(e) => handleMuscleSettingChange(muscle, 'focusTarget', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Save Button */}
      <button 
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
};

export default UserProfile;