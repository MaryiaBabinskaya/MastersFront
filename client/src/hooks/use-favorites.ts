import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

const FAVORITES_QUERY_KEY = [api.favorites.list.path] as const;
type ToggleFavoriteRequest = z.infer<typeof api.favorites.toggle.input>;

export function useFavorites() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path, {
        credentials: 'include',
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch favorites');

      const data = await res.json();
      return api.favorites.list.responses[200].parse(data);
    },
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ToggleFavoriteRequest) => {
      const res = await fetch(api.favorites.toggle.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (res.status === 401) throw new Error('Please log in to add favorites');
      if (!res.ok) throw new Error('Failed to toggle favorite');

      return api.favorites.toggle.responses[200].parse(await res.json());
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });

      toast({
        title: data.isFavorite
          ? 'Dodano do ulubionych'
          : 'Usunięto z ulubionych',
        description: data.isFavorite
          ? 'Spektakl został dodany do Twojej listy.'
          : 'Spektakl został usunięty z listy.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Błąd',
        description:
          error.message === 'Please log in to add favorites'
            ? 'Zaloguj się, aby dodać do ulubionych.'
            : 'Nie udało się zmienić statusu ulubionego.',
        variant: 'destructive',
      });
    },
  });
}
