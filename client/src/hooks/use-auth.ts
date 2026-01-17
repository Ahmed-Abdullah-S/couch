import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";

// Helper function to get user-friendly error messages
function getErrorMessage(status: number, type: "login" | "register"): string {
  switch (status) {
    case 400:
      return type === "login" 
        ? "Invalid username or password" 
        : "Invalid registration data. Please check your input.";
    case 401:
      return "Invalid username or password";
    case 409:
      return "Username already exists. Please choose another one.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return type === "login" ? "Login failed. Please try again." : "Registration failed. Please try again.";
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        const res = await fetch(api.auth.login.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
          const errorMessage = data.message || data.error || getErrorMessage(res.status, "login");
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (error: any) {
        // Re-throw if it's already an Error with message
        if (error instanceof Error) {
          throw error;
        }
        // Handle network errors
        throw new Error("Network error. Please check your connection and try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        // Client-side validation
        if (!credentials.username || !credentials.password) {
          throw new Error("Username and password are required");
        }
        if (credentials.username.length < 3) {
          throw new Error("Username must be at least 3 characters long");
        }
        if (credentials.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        const res = await fetch(api.auth.register.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // If response is not JSON, use status text
          data = { message: res.statusText || "Registration failed" };
        }
        
        if (!res.ok) {
          // Prioritize message field, then error field, then fallback
          const errorMessage = data.message || data.error || getErrorMessage(res.status, "register");
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (error: any) {
        // Re-throw if it's already an Error with message
        if (error instanceof Error) {
          throw error;
        }
        // Handle network errors
        throw new Error("Network error. Please check your connection and try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      // Redirect will be handled by the component using this hook
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isPending: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
  };
}
