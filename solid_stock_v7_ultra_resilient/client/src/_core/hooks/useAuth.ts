import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const isDevBypass = import.meta.env.VITE_AUTO_DEV_LOGIN === "true";
  
  // Mock user for development bypass
  const mockDevUser = useMemo(() => ({
    id: 999,
    openId: "dev-user-id",
    name: "Developer (Dev Mode)",
    email: "dev@example.com",
    role: "admin",
    loginMethod: "dev",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date()
  }), []);

  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !isDevBypass, // Disable query if bypass is active
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (isDevBypass) {
      console.warn("Logout ignored in development bypass mode.");
      window.location.href = "/";
      return;
    }
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils, isDevBypass]);

  const state = useMemo(() => {
    const userData = isDevBypass ? mockDevUser : (meQuery.data ?? null);
    
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(userData)
    );
    
    return {
      user: userData,
      loading: isDevBypass ? false : (meQuery.isLoading || logoutMutation.isPending),
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    isDevBypass,
    mockDevUser,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    
    // If not authenticated and redirect is requested
    const currentPath = window.location.pathname;
    if (currentPath !== "/" && currentPath !== "/404") {
      window.location.href = "/";
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    state.loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => isDevBypass ? Promise.resolve() : meQuery.refetch(),
    logout,
  };
}
