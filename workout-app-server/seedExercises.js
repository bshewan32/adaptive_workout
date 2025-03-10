// server/seedExercises.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('./models/exerciseModel');

// Load environment variables
dotenv.config();

// Exercise data - copy from your frontend exercises.js file
const exercises = [
  // CHEST EXERCISES
  {
    id: "chest-001",
    name: "Barbell Bench Press",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "shoulders"],
    exerciseType: "compound",
    equipment: ["barbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to chest, and press back up.",
    imageUrl: "/placeholder/bench-press.jpg",
    videoUrl: ""
  },
  {
    id: "chest-002",
    name: "Incline Dumbbell Press",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "shoulders"],
    exerciseType: "compound",
    equipment: ["dumbbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Set bench to 30-45 degree angle, press dumbbells from shoulder level to full extension.",
    imageUrl: "/placeholder/incline-db-press.jpg",
    videoUrl: ""
  },
  {
    id: "chest-003",
    name: "Cable Fly",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["cable"],
    difficultyLevel: "beginner",
    instructions: "Stand between cable stations, arms extended to sides, bring hands together in front of chest.",
    imageUrl: "/placeholder/cable-fly.jpg",
    videoUrl: ""
  },
  {
    id: "chest-004",
    name: "Push-Up",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "shoulders", "core"],
    exerciseType: "compound",
    equipment: ["bodyweight"],
    difficultyLevel: "beginner",
    instructions: "Start in plank position, lower body until chest nearly touches floor, push back up.",
    imageUrl: "/placeholder/push-up.jpg",
    videoUrl: ""
  },
  {
    id: "chest-005",
    name: "Dumbbell Fly",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["dumbbell", "bench"],
    difficultyLevel: "beginner",
    instructions: "Lie on bench with dumbbells extended above chest, lower weights in arc motion to sides, return to starting position.",
    imageUrl: "/placeholder/db-fly.jpg",
    videoUrl: ""
  },

  // BACK EXERCISES
  {
    id: "back-001",
    name: "Barbell Bent Row",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["core"],
    exerciseType: "compound",
    equipment: ["barbell"],
    difficultyLevel: "advanced",
    instructions: "Stand with feet shoulder-width apart, bend at hips and drive elbows back.",
    imageUrl: "/placeholder/bentrow.jpg",
    videoUrl: ""
  },
  {
    id: "back-002",
    name: "Pull-Up",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps"],
    exerciseType: "compound",
    equipment: ["bodyweight"],
    difficultyLevel: "intermediate",
    instructions: "Hang from bar with overhand grip, pull body up until chin clears bar, lower to starting position.",
    imageUrl: "/placeholder/pull-up.jpg",
    videoUrl: ""
  },
  {
    id: "back-003",
    name: "Seated Cable Row",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps"],
    exerciseType: "compound",
    equipment: ["cable"],
    difficultyLevel: "beginner",
    instructions: "Sit at cable machine with feet on platform, pull handle to torso keeping back straight.",
    imageUrl: "/placeholder/cable-row.jpg",
    videoUrl: ""
  },
  {
    id: "back-004",
    name: "Dumbbell Row",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps", "shoulders"],
    exerciseType: "compound",
    equipment: ["dumbbell", "bench"],
    difficultyLevel: "beginner",
    instructions: "Place one knee and hand on bench, pull dumbbell to hip with free hand, keeping back parallel to ground.",
    imageUrl: "/placeholder/db-row.jpg",
    videoUrl: ""
  },
  {
    id: "back-005",
    name: "Lat Pulldown",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps"],
    exerciseType: "compound",
    equipment: ["cable", "machine"],
    difficultyLevel: "beginner",
    instructions: "Sit at machine, grasp bar with wide grip, pull down to upper chest, control return to starting position.",
    imageUrl: "/placeholder/lat-pulldown.jpg",
    videoUrl: ""
  },
  {
    id: "back-006",
    name: "T-bar Row",
    primaryMuscleGroup: "back",
    secondaryMuscleGroups: ["biceps"],
    exerciseType: "compound",
    equipment: ["barbell", "machine"],
    difficultyLevel: "intermediate",
    instructions: "Sit at machine, grasp bar with wide grip, pull down to upper chest, control return to starting position.",
    imageUrl: "/placeholder/lat-pulldown.jpg",
    videoUrl: ""
  },

  // SHOULDER EXERCISES
  {
    id: "shoulders-001",
    name: "Overhead Press",
    primaryMuscleGroup: "shoulders",
    secondaryMuscleGroups: ["triceps"],
    exerciseType: "compound",
    equipment: ["barbell"],
    difficultyLevel: "intermediate",
    instructions: "Stand with feet shoulder-width apart, press barbell from shoulders to overhead extension.",
    imageUrl: "/placeholder/overhead-press.jpg",
    videoUrl: ""
  },
  {
    id: "shoulders-002",
    name: "Lateral Raise",
    primaryMuscleGroup: "shoulders",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["dumbbell"],
    difficultyLevel: "beginner",
    instructions: "Stand with dumbbells at sides, raise arms to sides until parallel with floor, lower slowly.",
    imageUrl: "/placeholder/lateral-raise.jpg",
    videoUrl: ""
  },
  {
    id: "shoulders-004",
    name: "Face Pull",
    primaryMuscleGroup: "shoulders",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["cable"],
    difficultyLevel: "beginner",
    instructions: "Stand facing cable machine, pull rope attachment to face with elbows high, squeeze shoulder blades.",
    imageUrl: "/placeholder/face-pull.jpg",
    videoUrl: ""
  },
    
  // BICEPS EXERCISES
  {
    id: "biceps-001",
    name: "Barbell Curl",
    primaryMuscleGroup: "biceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["barbell"],
    difficultyLevel: "beginner",
    instructions: "Stand with barbell in hands, curl weight while keeping upper arms stationary.",
    imageUrl: "/placeholder/barbell-curl.jpg",
    videoUrl: ""
  },
  {
    id: "biceps-002",
    name: "Hammer Curl",
    primaryMuscleGroup: "biceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["dumbbell"],
    difficultyLevel: "beginner",
    instructions: "Stand with dumbbells at sides, palms facing inward, curl weights while maintaining neutral grip.",
    imageUrl: "/placeholder/hammer-curl.jpg",
    videoUrl: ""
  },
  {
    id: "biceps-003",
    name: "Incline Dumbbell Curl",
    primaryMuscleGroup: "biceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["dumbbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Sit on incline bench, curl dumbbells from extended position, squeezing biceps at top.",
    imageUrl: "/placeholder/incline-curl.jpg",
    videoUrl: ""
  },
  {
    id: "biceps-004",
    name: "Cable Curl",
    primaryMuscleGroup: "biceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["cable"],
    difficultyLevel: "beginner",
    instructions: "Stand facing cable machine, curl bar or handle while keeping elbows at sides.",
    imageUrl: "/placeholder/cable-curl.jpg",
    videoUrl: ""
  },
  

  // TRICEPS EXERCISES
  {
    id: "triceps-001",
    name: "Triceps Pushdown",
    primaryMuscleGroup: "triceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["cable"],
    difficultyLevel: "beginner",
    instructions: "Stand facing cable machine, push handles down by extending elbows, keeping upper arms at sides.",
    imageUrl: "/placeholder/pushdown.jpg",
    videoUrl: ""
  },
  {
    id: "triceps-002",
    name: "Close-Grip Bench Press",
    primaryMuscleGroup: "triceps",
    secondaryMuscleGroups: ["chest", "shoulders"],
    exerciseType: "compound",
    equipment: ["barbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Lie on bench, grip bar with hands shoulder-width or closer, press while focusing on triceps.",
    imageUrl: "/placeholder/close-grip-bench.jpg",
    videoUrl: ""
  },
  {
    id: "triceps-003",
    name: "Overhead Triceps Extension",
    primaryMuscleGroup: "triceps",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["dumbbell", "cable"],
    difficultyLevel: "beginner",
    instructions: "Hold weight overhead with both hands, lower behind head by bending elbows, extend back up.",
    imageUrl: "/placeholder/overhead-extension.jpg",
    videoUrl: ""
  },
  

  // QUADS EXERCISES (formerly part of "legs")
  {
    name: "Barbell Squat",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "hamstrings", "core"],
    exerciseType: "compound",
    equipment: ["barbell"],
    difficultyLevel: "advanced",
    instructions: "Place bar on upper back, feet shoulder-width apart, bend knees and hips to lower, then stand back up."
  },
  {
    name: "Leg Extension",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["machine"],
    difficultyLevel: "beginner",
    instructions: "Sit in machine, extend knees to lift weight, lower with control."
  },
  {
    name: "Leg Press",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "core"],
    exerciseType: "compound",
    equipment: ["barbell"],
    difficultyLevel: "intermediate",
    instructions: "adjust machine weight, sit in machine, brace core and press with legs, lower and repeat."
  },
  {
    name: "Front Squat",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "core"],
    exerciseType: "compound",
    equipment: ["barbell"],
    difficultyLevel: "intermediate",
    instructions: "Hold barbell across front shoulders, squat down while keeping torso upright, stand back up."
  },
  {
    name: "Lunge",
    primaryMuscleGroup: "quads",
    secondaryMuscleGroups: ["glutes", "core"],
    exerciseType: "compound",
    equipment: ["barbell", "dumbbell", "bodyweight"],
    difficultyLevel: "intermediate",
    instructions: "Hold barbell across front shoulders, squat down while keeping torso upright, stand back up."
  },
  
  // HAMSTRING EXERCISES (formerly part of "legs")
  {
    name: "Romanian Deadlift",
    primaryMuscleGroup: "hamstrings",
    secondaryMuscleGroups: ["glutes", "back"],
    exerciseType: "compound",
    equipment: ["barbell", "dumbbell"],
    difficultyLevel: "intermediate",
    instructions: "Hold weight in front of thighs, hinge at hips while keeping back straight, lower weight, then return to standing."
  },
  {
    name: "Leg Curl",
    primaryMuscleGroup: "hamstrings",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["machine"],
    difficultyLevel: "beginner",
    instructions: "Lie face down on machine, curl weight by bending knees, return with control."
  },
  {
    name: "Nordic Hamstring Curl",
    primaryMuscleGroup: "hamstrings",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["bodyweight"],
    difficultyLevel: "advanced",
    instructions: "Kneel with ankles secured, lower torso forward with straight hips, using hamstrings to control descent."
  },
  
  // GLUTE EXERCISES (formerly part of "legs")
  {
    name: "Hip Thrust",
    primaryMuscleGroup: "glutes",
    secondaryMuscleGroups: ["hamstrings"],
    exerciseType: "compound",
    equipment: ["barbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Sit with upper back against bench, barbell across hips, thrust hips upward by squeezing glutes."
  },
  {
    name: "Bulgarian Split Squat",
    primaryMuscleGroup: "glutes",
    secondaryMuscleGroups: ["quads", "hamstrings"],
    exerciseType: "compound",
    equipment: ["dumbbell", "bench"],
    difficultyLevel: "intermediate",
    instructions: "Place one foot on bench behind you, lower into a split squat, push through front heel to return to start."
  },
  {
    name: "Glute Bridge",
    primaryMuscleGroup: "glutes",
    secondaryMuscleGroups: ["hamstrings"],
    exerciseType: "isolation",
    equipment: ["bodyweight"],
    difficultyLevel: "beginner",
    instructions: "Lie on back with knees bent, feet flat on floor, lift hips by squeezing glutes, lower with control."
  },

  // CORE EXERCISES
  {
    id: "core-001",
    name: "Plank",
    primaryMuscleGroup: "core",
    secondaryMuscleGroups: ["shoulders"],
    exerciseType: "isolation",
    equipment: ["bodyweight"],
    difficultyLevel: "beginner",
    instructions: "Hold push-up position with weight on forearms, keeping body in straight line from head to heels.",
    imageUrl: "/placeholder/plank.jpg",
    videoUrl: ""
  },
  {
    id: "core-002",
    name: "Sit up",
    primaryMuscleGroup: "core",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["bodyweight"],
    difficultyLevel: "beginner",
    instructions: "Sit with knees bent and torso leaned back, twist torso side to side, touching weight to floor beside hips.",
    imageUrl: "/placeholder/russian-twist.jpg",
    videoUrl: ""
  },
  {
    id: "core-003",
    name: "Hanging Leg Raise",
    primaryMuscleGroup: "core",
    secondaryMuscleGroups: [],
    exerciseType: "isolation",
    equipment: ["bodyweight"],
    difficultyLevel: "intermediate",
    instructions: "Hang from bar, lift legs by flexing hips and knees, lower with control.",
    imageUrl: "/placeholder/hanging-leg-raise.jpg",
    videoUrl: ""
  },
  {
    id: "core-005",
    name: "Ab Rollout",
    primaryMuscleGroup: "core",
    secondaryMuscleGroups: ["shoulders"],
    exerciseType: "isolation",
    equipment: ["ab wheel"],
    difficultyLevel: "advanced",
    instructions: "Kneel with ab wheel on floor, roll forward extending body, then use abs to pull back to starting position.",
    imageUrl: "/placeholder/ab-rollout.jpg",
    videoUrl: ""
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Clean existing exercises
    await Exercise.deleteMany({});
    console.log('Cleaned exercise collection');
    
    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`Added ${exercises.length} exercises to the database`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();