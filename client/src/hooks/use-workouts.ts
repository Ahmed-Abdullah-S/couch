import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertWorkoutLog, type InsertWorkoutSet } from "@shared/routes";

type CreateWorkoutInput = {
  name: string;
  duration?: number;
  notes?: string;
  sets: Omit<InsertWorkoutSet, "workoutLogId">[];
};

export function useWorkouts() {
  const queryClient = useQueryClient();

  const { data: workouts, isLoading } = useQuery({
    queryKey: [api.workouts.list.path],
    queryFn: async () => {
      const res = await fetch(api.workouts.list.path);
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return await res.json();
    },
  });

  const logWorkoutMutation = useMutation({
    mutationFn: async (data: CreateWorkoutInput) => {
      const res = await fetch(api.workouts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log workout");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workouts.list.path] });
    },
  });

  return {
    workouts,
    isLoading,
    logWorkout: logWorkoutMutation.mutateAsync,
    isLogging: logWorkoutMutation.isPending,
  };
}
