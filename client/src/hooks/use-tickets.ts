import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { useAuth } from '@/hooks/use-auth';

export function useTickets() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [api.tickets.list.path],
    queryFn: async () => {
      const res = await fetch(api.tickets.list.path, {
        credentials: 'include',
      });

      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch tickets');

      return api.tickets.list.responses[200].parse(await res.json());
    },
    enabled: isAuthenticated,
  });
}
