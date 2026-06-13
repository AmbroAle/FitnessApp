export type Exercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
};

export type ExerciseDetail = {
  exerciseId: string;
  name: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  gifUrl: string;
  instructions: string[];
};

export type Workout = {
  id: string;
  name: string;
  createdAt: string;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  createdAt: string;
};