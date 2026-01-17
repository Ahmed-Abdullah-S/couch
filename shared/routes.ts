// Shared API route definitions
// This provides type-safe route paths for client-side usage

export const api = {
  auth: {
    register: { path: "/api/register" },
    login: { path: "/api/login" },
    logout: { path: "/api/logout" },
    me: { path: "/api/user" },
  },
  profile: {
    get: { path: "/api/profile" },
    update: { path: "/api/profile" },
  },
  coach: {
    get: { path: "/api/coach" },
    update: { path: "/api/coach" },
  },
  chat: {
    threads: { path: "/api/chat/threads" },
    thread: (id: number) => ({ path: `/api/chat/threads/${id}` }),
    messages: (threadId: number) => ({ path: `/api/chat/threads/${threadId}/messages` }),
    stream: { path: "/api/chat/stream" },
  },
  plans: {
    training: {
      get: { path: "/api/plans/training" },
      generate: { path: "/api/plans/training/generate" },
    },
    nutrition: {
      get: { path: "/api/plans/nutrition" },
      generate: { path: "/api/plans/nutrition/generate" },
    },
  },
  workouts: {
    list: { path: "/api/workouts" },
    create: { path: "/api/workouts" },
    get: (id: number) => ({ path: `/api/workouts/${id}` }),
  },
  progress: {
    list: { path: "/api/progress" },
    create: { path: "/api/progress" },
    latest: { path: "/api/progress/latest" },
  },
};

export type InsertUser = {
  username: string;
  password: string;
  email?: string;
};

export type InsertProfile = {
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number;
  weight?: number;
  goal?: string;
  experienceLevel?: string;
  activityLevel?: string;
  daysPerWeek?: number;
  sessionLength?: number;
  equipment?: string;
  injuries?: string;
  allergies?: string;
};

export type InsertCoachPersona = {
  name?: string;
  style?: string;
  tone?: string;
  language?: string;
};

export type InsertWorkoutLog = {
  name: string;
  duration?: number;
  notes?: string;
  exercises?: any;
};

export type InsertWorkoutSet = {
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  workoutLogId?: number;
};

export type InsertProgressLog = {
  date?: Date | string;
  weight?: number;
  bodyFat?: number;
  measurements?: any;
  photos?: any;
  notes?: string;
};
