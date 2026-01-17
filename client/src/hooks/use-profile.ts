import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertProfile } from "@shared/routes";

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return await res.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Omit<InsertProfile, "userId">) => {
      const res = await fetch(api.profile.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
