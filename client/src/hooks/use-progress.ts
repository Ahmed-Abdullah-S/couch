import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertProgressLog } from "@shared/routes";

export function useProgress() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: [api.progress.list.path],
    queryFn: async () => {
      const res = await fetch(api.progress.list.path);
      if (!res.ok) throw new Error("Failed to fetch progress logs");
      return await res.json();
    },
  });

  const logProgressMutation = useMutation({
    mutationFn: async (data: Omit<InsertProgressLog, "userId">) => {
      const res = await fetch(api.progress.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log progress");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
    },
  });

  return {
    logs,
    isLoading,
    logProgress: logProgressMutation.mutateAsync,
    isLogging: logProgressMutation.isPending,
  };
}
