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

export function useChat(threadId?: number) {
  const queryClient = useQueryClient();

  const { data: threads, isLoading: isLoadingThreads } = useQuery({
    queryKey: [api.chat.threads.path],
    queryFn: async () => {
      const res = await fetch(api.chat.threads.path);
      if (!res.ok) throw new Error("Failed to fetch threads");
      return await res.json();
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [api.chat.messages(threadId || 0).path],
    queryFn: async () => {
      if (!threadId) return [];
      const res = await fetch(api.chat.messages(threadId).path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return await res.json();
    },
    enabled: !!threadId,
  });

  const createThreadMutation = useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch(api.chat.threads.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create thread");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.threads.path] });
    },
  });

  return {
    threads,
    messages,
    isLoading: isLoadingThreads || isLoadingMessages,
    createThread: createThreadMutation.mutateAsync,
  };
}
