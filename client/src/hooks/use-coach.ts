import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCoachPersona } from "@shared/routes";

export function useCoach() {
  const queryClient = useQueryClient();

  const { data: coach, isLoading } = useQuery({
    queryKey: [api.coach.get.path],
    queryFn: async () => {
      const res = await fetch(api.coach.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch coach");
      return await res.json();
    },
  });

  const updateCoachMutation = useMutation({
    mutationFn: async (data: Omit<InsertCoachPersona, "userId">) => {
      const res = await fetch(api.coach.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update coach persona");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coach.get.path] });
    },
  });

  return {
    coach,
    isLoading,
    updateCoach: updateCoachMutation.mutateAsync,
    isUpdating: updateCoachMutation.isPending,
  };
}

export function useChat() {
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: [api.coach.history.path],
    queryFn: async () => {
      const res = await fetch(api.coach.history.path);
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return await res.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(api.coach.chat.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coach.history.path] });
    },
  });

  return {
    history,
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
}
