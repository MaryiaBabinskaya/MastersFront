import { useQuery } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';

const PREMIERES_PATH = '/api/plays/premieres' as const;

export function usePlay(id: number) {
  return useQuery({
    queryKey: [api.plays.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.plays.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch play');
      return api.plays.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function monthlyRepertoireOptions(
  yearMonth: string,
  isForKids?: boolean,
  theaterId?: string,
) {
  return {
    queryKey: [api.plays.list.path, 'monthly', yearMonth, isForKids, theaterId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('month', yearMonth);
      if (isForKids !== undefined)
        params.append('isForKids', String(isForKids));
      if (theaterId && theaterId !== 'all')
        params.append('theaterId', theaterId);
      const url = `${api.plays.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch monthly repertoire');
      return api.plays.list.responses[200].parse(await res.json());
    },
    staleTime: 10 * 60 * 1000,
  };
}

export function useMonthlyRepertoire(
  yearMonth: string,
  isForKids?: boolean,
  theaterId?: string,
) {
  return useQuery({
    ...monthlyRepertoireOptions(yearMonth, isForKids, theaterId),
    placeholderData: (previousData: any) => previousData,
  });
}

export function usePremieres(
  fromMonth: string,
  isForKids?: boolean,
  theaterId?: string,
) {
  return useQuery({
    queryKey: [PREMIERES_PATH, fromMonth, isForKids, theaterId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('fromMonth', fromMonth);
      if (isForKids !== undefined)
        params.append('isForKids', String(isForKids));
      if (theaterId && theaterId !== 'all')
        params.append('theaterId', theaterId);

      const url = `${PREMIERES_PATH}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch premieres');
      return await res.json();
    },
    placeholderData: (previousData: any) => previousData,
    staleTime: 10 * 60 * 1000,
  });
}
