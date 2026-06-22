import { useQuery } from '@tanstack/react-query';

import type {User} from "@shared/models/auth";

const AUTH_USER_QUERY_KEY = ['/api/auth/user'] as const;

async function fetchUser(): Promise<User | null> {
  const response = await fetch('/api/auth/user', {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.user || null;
}

async function logout(): Promise<void> {
  window.location.href = '/api/auth/logout';
}

export function useAuth() {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    isError,
    error,
    isAuthenticated: !!user,
    logout,
    refetchUser: refetch,
  };
}
