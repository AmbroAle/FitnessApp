export type Exercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
};

export type Metadata = {
  totalExercises: number;
  totalPages: number;
  currentPage: number;
  previousPage: string | null;
  nextPage: string | null;
};

export type ExerciseResponse = {
  success: boolean;
  metadata: Metadata;
  data: Exercise[];
};

export type Workout = {
  id: string;
  name: string;
};