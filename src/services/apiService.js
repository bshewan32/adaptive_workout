// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// User API calls
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Workout API calls
export const getWorkouts = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/workouts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

export const getWorkoutById = async (workoutId) => {
  try {
    const response = await axios.get(`${API_URL}/workouts/${workoutId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workout:', error);
    throw error;
  }
};

export const createWorkout = async (workoutData) => {
  try {
    const response = await axios.post(`${API_URL}/workouts`, workoutData);
    return response.data;
  } catch (error) {
    console.error('Error creating workout:', error);
    throw error;
  }
};

export const updateWorkoutRecovery = async (workoutId, recoveryData) => {
  try {
    const response = await axios.patch(`${API_URL}/workouts/${workoutId}/recovery`, recoveryData);
    return response.data;
  } catch (error) {
    console.error('Error updating workout recovery:', error);
    throw error;
  }
};

export const getMuscleMetrics = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/workouts/metrics/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching muscle metrics:', error);
    throw error;
  }
};

// Exercise API calls
// src/services/apiService.js
// Add these functions to your apiService.js file

// Get all exercises from the database
export const getAllExercises = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/exercises');
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    // Fallback to local data if API fails
    return import('../data/exercises').then(module => module.default);
  }
};

// Get exercises by muscle group
export const getExercisesByMuscle = async (muscleGroup) => {
  try {
    const response = await fetch(`http://localhost:4000/api/exercises/muscle/${muscleGroup}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exercises by muscle');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises by muscle:', error);
    // Fallback to filtering local data
    const allExercises = await import('../data/exercises').then(module => module.default);
    return allExercises.filter(ex => 
      ex.primaryMuscleGroup === muscleGroup || 
      (ex.secondaryMuscleGroups && ex.secondaryMuscleGroups.includes(muscleGroup))
    );
  }
};

export const getExercisesByEquipment = async (equipment) => {
  try {
    const response = await axios.get(`${API_URL}/exercises/equipment/${equipment}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by equipment:', error);
    throw error;
  }
};

export const addExercise = async (exerciseData) => {
  try {
    const response = await axios.post(`${API_URL}/exercises`, exerciseData);
    return response.data;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};