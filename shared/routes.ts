import { z } from 'zod';
import {
    theaters, plays, showtimes, tickets, favorites
} from './schema';

export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        field: z.string().optional(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
    unauthorized: z.object({
        message: z.string(),
    }),
};

export const api = {
    theaters: {
        list: {
            method: 'GET' as const,
            path: "/api/theaters" as const,
            responses: {
                200: z.array(z.custom<typeof theaters.$inferSelect>()),
            },
        },
        get: {
            method: 'GET' as const,
            path: "/api/theaters/:id" as const,
            responses: {
                200: z.custom<typeof theaters.$inferSelect>(),
                404: errorSchemas.notFound,
            },
        },
    },
    plays: {
        list: {
            method: 'GET' as const,
            path: '/api/plays' as const,
            input: z.object({
                theaterId: z.string().optional(),
                date: z.string().optional(),
                isForKids: z.string().optional(),
            }),
            responses: {
                200: z.array(z.custom<typeof plays.$inferSelect & { theater: typeof theaters.$inferSelect; showtime?: string }>()),
            },
        },
        get: {
            method: 'GET' as const,
            path: '/api/plays/:id' as const,
            responses: {
                200: z.custom<typeof plays.$inferSelect & { theater: typeof theaters.$inferSelect; showtimes: typeof showtimes.$inferSelect[] }>(),
                404: errorSchemas.notFound,
            },
        },
    },
    showtimes: {
        list: {
            method: 'GET' as const,
            path: '/api/showtimes' as const,
            input: z.object({
                date: z.string().optional(),
                playId: z.string().optional(),
            }).optional(),
            responses: {
                200: z.array(z.custom<typeof showtimes.$inferSelect & { play: typeof plays.$inferSelect & { theater: typeof theaters.$inferSelect } }>()),
            },
        },
    },
    tickets: {
        list: {
            method: 'GET' as const,
            path: '/api/tickets' as const,
            responses: {
                200: z.array(z.custom<typeof tickets.$inferSelect & {
                    showtime: typeof showtimes.$inferSelect & {
                        play: typeof plays.$inferSelect & {
                            theater: typeof theaters.$inferSelect
                            theatre?: typeof theaters.$inferSelect
                        };
                        showtimeAsDateTime?: string;
                    };
                    playDto?: typeof plays.$inferSelect & {
                        theater: typeof theaters.$inferSelect;
                        theatre?: typeof theaters.$inferSelect;
                    };
                }>()),
                401: errorSchemas.unauthorized,
            },
        },
        create: {
            method: 'POST' as const,
            path: '/api/tickets' as const,
            input: z.object({
                playId: z.number(),
                date: z.string(),
                seatInfo: z.string().optional(),
            }),
            responses: {
                201: z.custom<typeof tickets.$inferSelect>(),
                401: errorSchemas.unauthorized,
                400: errorSchemas.validation,
            },
        },
    },
    favorites: {
        list: {
            method: 'GET' as const,
            path: '/api/favorites' as const,
            responses: {
                200: z.array(z.custom<typeof favorites.$inferSelect & { play: typeof plays.$inferSelect & { theater: typeof theaters.$inferSelect } }>()),
                401: errorSchemas.unauthorized,
            },
        },
        toggle: {
            method: 'POST' as const,
            path: '/api/favorites/toggle' as const,
            input: z.object({
                playId: z.number(),
            }),
            responses: {
                200: z.object({ isFavorite: z.boolean() }),
                401: errorSchemas.unauthorized,
            },
        },
    },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
    let url = path;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, String(value));
            }
        });
    }
    return url;
}
