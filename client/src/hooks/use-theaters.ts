import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';

export function useTheaters() {
  return useQuery({
    queryKey: [api.theaters.list.path],
    queryFn: async () => {
      const res = await fetch(api.theaters.list.path);
      if (!res.ok) {
        throw new Error('Failed to fetch theaters');
      }
      return await res.json();
    },
  });
}
