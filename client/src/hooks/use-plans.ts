import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTrainingPlan() {
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: [api.plans.training.get.path],
    queryFn: async () => {
      const res = await fetch(api.plans.training.get.path);
      if (!res.ok) throw new Error("Failed to fetch training plan");
      return await res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.plans.training.generate.path, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate training plan");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plans.training.get.path] });
    },
  });

  return {
    plan,
    isLoading,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}

export function useNutritionPlan() {
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: [api.plans.nutrition.get.path],
    queryFn: async () => {
      const res = await fetch(api.plans.nutrition.get.path);
      if (!res.ok) throw new Error("Failed to fetch nutrition plan");
      return await res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.plans.nutrition.generate.path, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate nutrition plan");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plans.nutrition.get.path] });
    },
  });

  return {
    plan,
    isLoading,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
