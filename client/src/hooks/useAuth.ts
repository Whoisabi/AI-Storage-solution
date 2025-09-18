import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear all queries and redirect to home
      queryClient.clear();
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear and redirect even if request fails
      queryClient.clear();
      navigate("/");
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isError: !!error,
    logout,
  };
}
