import { type Express } from "express";
import { type Server } from "http";
import { api } from "@shared/routes.ts";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";
import { authStorage } from "./auth/storage";
import multer from "multer";
import fs from "fs";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const POLISH_MONTHS: Record<string, number> = {};
for (let i = 0; i < 12; i++) {
    const d = new Date(2024, i, 1);
    POLISH_MONTHS[format(d, 'MMMM', { locale: pl }).toLowerCase()] = i;
    POLISH_MONTHS[format(d, 'LLLL', { locale: pl }).toLowerCase()] = i;
}

function parsePremiereDate(play: any): Date | null {
    if (play.premiereDate) {
        try {
            const date = new Date(play.premiereDate);
            if (!isNaN(date.getTime())) return date;
        } catch { /* fall through */ }
    }
    if (!play.additionalInfo) return null;

    const monthNameMatch = play.additionalInfo.match(/(?:Premiera|Data prapremiery):?\s*(\d{1,2})(?:,\s*\d{1,2})?\s+(\S+)\s+(\d{4})(?:\s*r\.?)?/i);
    if (monthNameMatch) {
        const [, day, monthName, year] = monthNameMatch;
        const month: number = POLISH_MONTHS[monthName.toLowerCase()];
        if (month !== undefined) return new Date(Number(year), month, Number(day));
    }

    const numericMatch = play.additionalInfo.match(/(?:Premiera|Data prapremiery):?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
    if (numericMatch) {
        const [, day, month, year] = numericMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    return null;
}

function getMonthStart(yearMonth: string): Date | null {
    const match: RegExpMatchArray | null = yearMonth.match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;

    const [, year, month] = match;
    return new Date(Number(year), Number(month) - 1, 1);
}

export async function registerRoutes(
    httpServer: Server,
    app: Express
): Promise<Server> {
    await setupAuth(app);
    registerAuthRoutes(app);
    app.get('/api/login', (_req: any, res) => {
        res.redirect('/account');
    });

    function generateNumericId(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    function findPlayByNumericId(allPlays: any[], playId: number): any {
        return allPlays.find((p: any) => {
            const idSource = p.source ? `${p.source}|${p.title}` : p.title;
            return generateNumericId(idSource) === playId;
        });
    }

    function extractBackendUserId(req: any): string {
        const userId: string = req.user.claims.sub;
        return userId.startsWith('backend-') ? userId.replace('backend-', '') : userId;
    }

    function transformExternalPlay(externalPlay: any): any {
        // Generate a consistent numeric ID from source URL + title for uniqueness
        const idSource = externalPlay.source
            ? `${externalPlay.source}|${externalPlay.title}`
            : externalPlay.title;
        const playId: number = generateNumericId(idSource);

        return {
            id: playId,
            theaterId: externalPlay.theatre?.id || 'TH-KRAKOW',
            title: externalPlay.title,
            slug: externalPlay.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description: externalPlay.description || '',
            director: externalPlay.director,
            imageUrl: externalPlay.imageUrl || 'https://placeholder.co/300x400?text=Play',
            rating: externalPlay.rating || 4.5,
            genre: externalPlay.genre || 'Spektakl',
            durationMinutes: externalPlay.durationMinutes,
            isForKids: externalPlay.isForKids || false,
            isPremiere: externalPlay.additionalInfo?.includes('Premiera') || externalPlay.additionalInfo?.includes('prepremiery') || false,
            isSpectacle: externalPlay.isSpectacle || false,
            scene: externalPlay.scene,
            category: externalPlay.category,
            source: externalPlay.source,
            additionalInfo: externalPlay.additionalInfo,
            detailsJson: externalPlay.detailsJson,
            showtime: externalPlay.showtime,
            theater: {
                id: externalPlay.theatre?.id || 'TH-KRAKOW',
                name: externalPlay.theatre?.name || 'Unknown Theater',
                slug: externalPlay.theatre?.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'unknown',
                description: externalPlay.theatre?.description || '',
                location: externalPlay.theatre?.location || '',
                imageUrl: externalPlay.theatre?.imageUrl || 'https://placeholder.co/600x400?text=Theater',
            }
        };
    }

    function transformExternalPlayWithShowtimes(externalPlay: any): any {
        const transformed: any = transformExternalPlay(externalPlay);

        const showtimes: any = Array.isArray(externalPlay.showtimes)
            ? externalPlay.showtimes.map((showtime: any) => ({
                id: showtime.id,
                playId: transformed.id,
                date: new Date(showtime.showtimeAsDateTime || showtime.showtime),
                priceMin: externalPlay.price ? Math.floor(externalPlay.price * 80) : 5000,
                priceMax: externalPlay.price ? Math.floor(externalPlay.price * 100) : 10000,
                ticketLink: showtime.ticketUrl || externalPlay.source || `https://bilety.example.pl/${transformed.slug}`,
            }))
            : [];

        return {
            ...transformed,
            showtimes,
        };
    }
    app.get(api.theaters.list.path, async (_req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch theaters' });

            const plays: any = await response.json();
            const theatersMap = new Map();

            plays.forEach((play: any) => {
                const theatre = play.theatre || play.theater;
                if (theatre && !theatersMap.has(theatre.id)) {
                    theatersMap.set(theatre.id, {
                        id: theatre.id,
                        name: theatre.name,
                        slug: theatre.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        description: theatre.description || '',
                        location: theatre.location || '',
                        imageUrl: theatre.imageUrl || 'https://placeholder.co/600x400?text=Theater',
                    });
                }
            });

            res.json(Array.from(theatersMap.values()));
        } catch (error) {
            console.error('Error fetching theaters:', error);
            res.status(500).json({ message: 'Failed to fetch theaters' });
        }
    });

    app.get(api.theaters.get.path, async (req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch theater' });

            const plays: any = await response.json();
            const theaterId: string = String(req.params.id);

            const play: any = plays.find((p: any) => {
                const theatre = p.theatre || p.theater;
                return String(theatre?.id) === theaterId;
            });
            if (!play) return res.status(404).json({ message: "Theater not found" });

            const theatre = play.theatre || play.theater;
            const theater = {
                id: theatre.id,
                name: theatre.name,
                slug: theatre.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                description: theatre.description || '',
                location: theatre.location || '',
                imageUrl: theatre.imageUrl || 'https://placeholder.co/600x400?text=Theater',
            };

            res.json(theater);
        } catch (error) {
            console.error('Error fetching theater:', error);
            res.status(500).json({ message: 'Failed to fetch theater' });
        }
    });
    app.get('/api/plays/premieres', async (req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch premieres' });

            const externalPlays: any = await response.json();
            const fromMonth: string | undefined = String(req.query.fromMonth);
            const fromDate: Date | null = fromMonth ? getMonthStart(fromMonth) : null;

            let premieres: any = externalPlays
                .filter((play: any) => {
                    const premiereDate: Date | null = parsePremiereDate(play);
                    if (!premiereDate) return false;
                    if (!fromDate) return true;
                    return premiereDate >= fromDate;
                })
                .map(transformExternalPlay);

            if (req.query.theaterId) {
                const theaterId: string = String(req.query.theaterId);
                premieres = premieres.filter((p: any) => String(p.theaterId) === theaterId);
            }

            if (req.query.isForKids === "true") {
                premieres = premieres.filter((p: any) => p.isForKids === true);
            } else if (req.query.isForKids === "false") {
                premieres = premieres.filter((p: any) => p.isForKids === false);
            }

            premieres.sort((a: any, b: any) => {
                const aPlay: any = findPlayByNumericId(externalPlays, a.id);
                const bPlay: any = findPlayByNumericId(externalPlays, b.id);
                const aDate: number = parsePremiereDate(aPlay)?.getTime() ?? Infinity;
                const bDate: number = parsePremiereDate(bPlay)?.getTime() ?? Infinity;
                return aDate - bDate;
            });

            res.json(premieres);
        } catch (error) {
            console.error('Error fetching premieres:', error);
            res.status(500).json({ message: 'Failed to fetch premieres' });
        }
    });
    app.get(api.plays.list.path, async (req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch plays' });

            const externalPlays: any = await response.json();

            if (req.query.month !== undefined && req.query.month !== null) {
                const yearMonth: string = String(req.query.month); // Format: "yyyy-MM"
                let playsWithShowtimes: any[] = [];

                externalPlays.forEach((play: any) => {
                    const transformedPlay: any = transformExternalPlay(play);

                    const showtimes: any[] = [];
                    if (play.showtimes && Array.isArray(play.showtimes)) {
                        play.showtimes.forEach((showtime: any) => {
                            const showtimeDate = new Date(showtime.showtimeAsDateTime || showtime.showtime);
                            const showtimeYearMonth = `${showtimeDate.getFullYear()}-${String(showtimeDate.getMonth() + 1).padStart(2, '0')}`;

                            if (showtimeYearMonth === yearMonth) {
                                showtimes.push({
                                    id: showtime.id,
                                    playId: transformedPlay.id,
                                    showtimeAsDateTime: showtime.showtimeAsDateTime || showtime.showtime,
                                    date: showtimeDate,
                                    priceMin: play.price ? Math.floor(play.price * 80) : 5000,
                                    priceMax: play.price ? Math.floor(play.price * 100) : 10000,
                                    ticketLink: showtime.ticketUrl || play.source || `https://bilety.example.pl/${transformedPlay.slug}`,
                                });
                            }
                        });
                    }

                    if (showtimes.length > 0) {
                        playsWithShowtimes.push({
                            ...transformedPlay,
                            showtimes,
                            theater: transformedPlay.theater,
                        });
                    }
                });

                if (req.query.isForKids === "true") {
                    playsWithShowtimes = playsWithShowtimes.filter((p: any) => p.isForKids === true);
                } else if (req.query.isForKids === "false") {
                    playsWithShowtimes = playsWithShowtimes.filter((p: any) => p.isForKids === false);
                }

                if (req.query.theaterId) {
                    const theaterId: string = String(req.query.theaterId);
                    playsWithShowtimes = playsWithShowtimes.filter((p: any) => String(p.theaterId) === theaterId);
                }

                res.json(playsWithShowtimes);
            } else {
                let plays: any = externalPlays.map(transformExternalPlay);

                if (req.query.theaterId) {
                    const theaterId: string = String(req.query.theaterId);
                    plays = plays.filter((p: any) => String(p.theaterId) === theaterId);
                }

                if (req.query.isForKids === "true") {
                    plays = plays.filter((p: any) => p.isForKids === true);
                } else if (req.query.isForKids === "false") {
                    plays = plays.filter((p: any) => p.isForKids === false);
                }

                if (req.query.isPremiere === "true") {
                    plays = plays.filter((p: any) => p.isPremiere === true);
                } else if (req.query.isPremiere === "false") {
                    plays = plays.filter((p: any) => p.isPremiere === false);
                }

                res.json(plays);
            }
        } catch (error) {
            console.error('Error fetching plays:', error);
            res.status(500).json({ message: 'Failed to fetch plays' });
        }
    });

    app.get(api.plays.get.path, async (req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch play' });

            const externalPlays: any = await response.json();
            const playId: number = Number(req.params.id);

            const externalPlay: any = findPlayByNumericId(externalPlays, playId);

            if (!externalPlay) return res.status(404).json({ message: "Play not found" });

            const play: any = transformExternalPlayWithShowtimes(externalPlay);
            res.json(play);
        } catch (error) {
            console.error('Error fetching play:', error);
            res.status(500).json({ message: 'Failed to fetch play' });
        }
    });
    app.get(api.showtimes.list.path, async (req, res) => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/plays');
            if (!response.ok) return res.status(500).json({ message: 'Failed to fetch showtimes' });

            const externalPlays: any = await response.json();
            let allShowtimes: any[] = [];

            externalPlays.forEach((play: any) => {
                if (play.showtimes && Array.isArray(play.showtimes)) {
                    play.showtimes.forEach((showtime: any) => {
                        const playWithTheater: any = transformExternalPlay(play);
                        allShowtimes.push({
                            id: showtime.id,
                            playId: playWithTheater.id,
                            date: new Date(showtime.showtimeAsDateTime || showtime.showtime),
                            priceMin: play.price ? Math.floor(play.price * 80) : 5000,
                            priceMax: play.price ? Math.floor(play.price * 100) : 10000,
                            ticketLink: showtime.ticketUrl || play.source || `https://bilety.example.pl/${playWithTheater.slug}`,
                            play: playWithTheater
                        });
                    });
                }
            });

            if (req.query.playId) {
                const playId: string = String(req.query.playId);
                allShowtimes = allShowtimes.filter((st: any) => String(st.playId) === playId);
            }

            if (req.query.date) {
                const filterDate = new Date(String(req.query.date));
                allShowtimes = allShowtimes.filter((st: any) => {
                    const showtimeDate = new Date(st.date);
                    return showtimeDate.getDate() === filterDate.getDate() &&
                        showtimeDate.getMonth() === filterDate.getMonth() &&
                        showtimeDate.getFullYear() === filterDate.getFullYear();
                });
            }

            res.json(allShowtimes);
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            res.status(500).json({ message: 'Failed to fetch showtimes' });
        }
    });
    app.get(api.tickets.list.path, isAuthenticated, async (req: any, res) => {
        try {
            const backendUserId = extractBackendUserId(req);
            const ticketsResponse: Response = await fetch(`http://localhost:8080/api/v1/tickets/user/${backendUserId}`);

            if (ticketsResponse.status === 404) {
                return res.json([]);
            }

            if (!ticketsResponse.ok) {
                return res.status(500).json({ message: 'Failed to fetch tickets' });
            }

            const springBootTickets: any = await ticketsResponse.json();

            let playsMap: Map<any, any> = new Map();
            try {
                const playsResponse: Response = await fetch('http://localhost:8080/api/v1/plays');
                if (playsResponse.ok) {
                    const plays: any = await playsResponse.json();
                    plays.forEach((play: any) => {
                        playsMap.set(play.id, play);
                    });
                }
            } catch (error) {
                console.error('Failed to fetch plays for ticket enrichment:', error);
            }

            const transformedTickets: any = springBootTickets.map((ticket: any) => {
                const fullPlay: any = playsMap.get(ticket.playId);

                let numericPlayId: any = ticket.playId;
                if (fullPlay && fullPlay.source) {
                    const idSource = `${fullPlay.source}|${fullPlay.title}`;
                    numericPlayId = generateNumericId(idSource);
                }

                return {
                    id: ticket.id,
                    userId: ticket.userId,
                    seatInfo: ticket.seatInfo,
                    status: ticket.status,
                    purchaseDate: ticket.purchaseDate,
                    showtime: {
                        date: ticket.playShowtime,
                        showtimeAsDateTime: ticket.playShowtime,
                        play: {
                            id: numericPlayId,
                            title: ticket.playTitle,
                            imageUrl: ticket.playImageUrl,
                            source: fullPlay?.source,
                            theater: {
                                name: ticket.theatreName
                            }
                        },
                        theater: {
                            name: ticket.theatreName
                        }
                    }
                };
            });

            res.json(transformedTickets);
        } catch (error: any) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ message: 'Failed to fetch tickets' });
        }
    });

    app.post(api.tickets.create.path, isAuthenticated, async (req: any, res) => {
        try {
            const input = api.tickets.create.input.parse(req.body);
            const backendUserId = extractBackendUserId(req);
            const { playId, date, seatInfo } = input;

            const playsResponse: Response = await fetch('http://localhost:8080/api/v1/plays');
            if (!playsResponse.ok) return res.status(500).json({ message: 'Failed to fetch plays from backend' });

            const allPlays: any = await playsResponse.json();
            const targetPlay: any = findPlayByNumericId(allPlays, playId);

            if (!targetPlay) {
                console.error('[TICKET CREATE] Play not found for playId:', playId);
                return res.status(404).json({ message: 'Play not found' });
            }

            const requestDate = new Date(date);
            const targetShowtime: any = targetPlay.showtimes?.find((st: any) => {
                const showtimeDate = new Date(st.showtimeAsDateTime || st.showtime);
                return Math.abs(showtimeDate.getTime() - requestDate.getTime()) < 60000; // Within 1 minute
            });

            if (!targetShowtime) {
                console.error('[TICKET CREATE] Showtime not found for date:', date, 'in play:', targetPlay.title);
                return res.status(404).json({ message: 'Showtime not found for this date' });
            }

            const purchaseResponse: Response = await fetch('http://localhost:8080/api/v1/tickets/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: Number(backendUserId),
                    playId: targetShowtime.id, // This is actually the showtime UUID
                    seatInfo: seatInfo || '',
                }),
            });

            if (!purchaseResponse.ok) {
                const errorText: string = await purchaseResponse.text();
                console.error('[TICKET CREATE] Purchase failed:', purchaseResponse.status, errorText);
                return res.status(purchaseResponse.status).json({ message: 'Failed to purchase ticket' });
            }

            const ticket: any = await purchaseResponse.json();

            res.status(201).json(ticket);
        } catch (err: any) {
            console.error('[TICKET CREATE] Error:', err);
            if (err instanceof z.ZodError) {
                console.error('[TICKET CREATE] Zod validation errors:', err.errors);
                return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    app.get(api.favorites.list.path, isAuthenticated, async (req, res) => {
        try {
            const userId = (req.user as any).claims.sub;
            const backendUserId = extractBackendUserId(req);
            const favoritesResponse: Response = await fetch(`http://localhost:8080/api/v1/users/${backendUserId}/favorites`);

            if (favoritesResponse.status === 404) {
                return res.json([]);
            }

            if (!favoritesResponse.ok) {
                return res.status(500).json({ message: 'Failed to fetch favorites' });
            }

            const backendFavorites: any = await favoritesResponse.json();

            const favoritesWithDetails: any = backendFavorites.map((play: any) => {
                const transformedPlay = transformExternalPlay(play);
                return {
                    id: play.id || generateNumericId(play.source || play.title),
                    userId: userId,
                    playId: transformedPlay.id,
                    play: transformedPlay
                };
            });

            res.json(favoritesWithDetails);
        } catch (error: any) {
            console.error('Error fetching favorites:', error);
            res.status(500).json({ message: 'Failed to fetch favorites' });
        }
    });

    app.post(api.favorites.toggle.path, isAuthenticated, async (req, res) => {
        try {
            const { playId } = api.favorites.toggle.input.parse(req.body);
            const backendUserId = extractBackendUserId(req);

            const playsResponse: Response = await fetch('http://localhost:8080/api/v1/plays');
            if (!playsResponse.ok) return res.status(500).json({ message: 'Failed to fetch plays from backend' });

            const allPlays: any = await playsResponse.json();
            const targetPlay: any = findPlayByNumericId(allPlays, playId);

            if (!targetPlay) {
                console.error('[FAVORITES] Play not found for playId:', playId);
                return res.status(404).json({ message: 'Play not found' });
            }

            const backendPlayId: any = targetPlay.source || targetPlay.title;

            const favoritesResponse: Response = await fetch(
                `http://localhost:8080/api/v1/users/${backendUserId}/favorites`
            );

            let isFavorited: boolean = false;
            if (favoritesResponse.ok) {
                const currentFavorites: any = await favoritesResponse.json();
                isFavorited = currentFavorites.some((fav: any) =>
                    fav.source === backendPlayId && fav.title === targetPlay.title
                );
            } else if (favoritesResponse.status === 404) {
                isFavorited = false;
            } else {
                return res.status(500).json({ message: 'Failed to fetch favorites' });
            }


            if (isFavorited) {
                const deleteResponse: Response = await fetch(
                    `http://localhost:8080/api/v1/users/${backendUserId}/favorites?playId=${encodeURIComponent(backendPlayId)}`,
                    { method: 'DELETE' }
                );

                if (!deleteResponse.ok) {
                    const errorText: string = await deleteResponse.text();
                    console.error('[FAVORITES] Delete failed:', deleteResponse.status, errorText);
                    return res.status(500).json({ message: 'Failed to remove favorite' });
                }

                res.json({ isFavorite: false });
            } else {
                const addResponse: Response = await fetch(
                    `http://localhost:8080/api/v1/users/${backendUserId}/favorites?playId=${encodeURIComponent(backendPlayId)}`,
                    { method: 'POST' }
                );

                if (!addResponse.ok) {
                    const errorText: string = await addResponse.text();
                    console.error('[FAVORITES] Add failed:', addResponse.status, errorText);
                    return res.status(500).json({ message: 'Failed to add favorite' });
                }

                res.json({ isFavorite: true });
            }
        } catch (err: any) {
            console.error('[FAVORITES] Error toggling favorite:', err);

            if (err instanceof z.ZodError) {
                console.error('[FAVORITES] Zod validation errors:', err.errors);
                return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
            }

            res.status(500).json({ message: 'Internal server error' });
        }
    });
    const upload = multer({
        storage: multer.diskStorage({
            destination: (_req: any, _file: any, cb: any) => {
                const uploadDir = 'uploads/avatars';
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (_req: any, file: any, cb: any) => {
                const ext = file.originalname.split('.').pop();
                const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                cb(null, filename);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (_req: any, file: any, cb: any) => {
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                cb(null, true);
            } else {
                cb(new Error('Only JPG and PNG files are allowed'));
            }
        }
    });

    app.post('/api/user/avatar', isAuthenticated, upload.single('avatar'), async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const backendUserId = extractBackendUserId(req);

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            const fallbackToLocal = async () => {
                const avatarUrl = `/uploads/avatars/${req.file.filename}`;
                const localUser = await authStorage.upsertUser({
                    id: userId,
                    createdAt: req.user.createdAt,
                    displayName: req.user.displayName,
                    email: req.user.email,
                    username: req.user.displayName,
                    avatarUrl: avatarUrl
                });
                res.json({ avatarUrl: avatarUrl, user: localUser });
            };

            try {
                const curlCommand = `curl -X POST "http://localhost:8080/api/v1/users/${backendUserId}/avatar" -F "avatar=@${req.file.path}" -H "accept: application/json"`;
                const { stdout, stderr } = await execAsync(curlCommand);

                if (stderr && stderr.includes('Total')) {
                    console.error('[AVATAR] Curl stderr:', stderr);
                    await fallbackToLocal();
                    return;
                }

                const backendUser = JSON.parse(stdout);

                const localUser = await authStorage.upsertUser({
                    id: userId,
                    createdAt: req.user.createdAt,
                    displayName: req.user.displayName,
                    email: req.user.email,
                    username: req.user.username,
                    avatarUrl: backendUser.avatarUrl
                });

                fs.unlinkSync(req.file.path);
                res.json({ avatarUrl: backendUser.avatarUrl, user: localUser });
            } catch (backendError: any) {
                console.error('[AVATAR] Backend error:', backendError);
                await fallbackToLocal();
            }
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            res.status(500).json({ error: 'Failed to upload avatar' });
        }
    });
    app.delete('/api/user/avatar', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const backendUserId = extractBackendUserId(req);

            try {
                const deleteResponse = await fetch(`http://localhost:8080/api/v1/users/${backendUserId}/avatar`, { method: 'DELETE' });
                if (!deleteResponse.ok) {
                    console.error('[AVATAR] Backend DELETE failed:', deleteResponse.status);
                }
            } catch (backendError: any) {
                console.error('[AVATAR] Backend DELETE error:', backendError);
            }

            const localUser = await authStorage.upsertUser({
                id: userId,
                createdAt: req.user.createdAt,
                displayName: req.user.displayName,
                email: req.user.email,
                username: req.user.username,
                avatarUrl: null
            });

            res.json({ message: 'Avatar reset to default', avatarUrl: null, user: localUser });
        } catch (error: any) {
            console.error('Avatar reset error:', error);
            res.status(500).json({ error: 'Failed to reset avatar' });
        }
    });
    app.use('/uploads', async (req, res) => {
        try {
            const springBootUrl = `http://localhost:8080${req.originalUrl}`;
            const response = await fetch(springBootUrl);
            if (!response.ok) return res.status(response.status).send('File not found');
            response.headers.forEach((value, key) => {
                res.setHeader(key, value);
            });
            res.send(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
            console.error('Error proxying upload:', error);
            res.status(500).send('Error loading file');
        }
    });
    app.get('/api/reviews/:playId', async (req: any, res) => {
        try {
            const playId = Number(req.params.playId);

            const playsResponse = await fetch('http://localhost:8080/api/v1/plays');
            if (!playsResponse.ok) return res.status(500).json({ message: 'Failed to fetch plays' });

            const allPlays: any = await playsResponse.json();
            const targetPlay = findPlayByNumericId(allPlays, playId);

            if (!targetPlay) {
                return res.json([]);
            }

            const backendPlayId = targetPlay.source || targetPlay.title;
            const currentUser = (req.user as any)?.id || (req.user as any)?.claims?.sub || null;
            const rawBackendUserId = currentUser ? (currentUser.startsWith('backend-') ? currentUser.replace('backend-', '') : currentUser) : null;
            const numericBackendUserId = rawBackendUserId && /^\d+$/.test(rawBackendUserId) ? rawBackendUserId : null;

            const reviewsUrl = numericBackendUserId
                ? `http://localhost:8080/api/v1/reviews/play?playId=${encodeURIComponent(backendPlayId)}&currentUserId=${numericBackendUserId}`
                : `http://localhost:8080/api/v1/reviews/play?playId=${encodeURIComponent(backendPlayId)}`;

            const reviewsResponse = await fetch(reviewsUrl);
            if (!reviewsResponse.ok) {
                console.error('[REVIEWS] Failed to fetch from backend:', reviewsResponse.status);
                return res.json([]);
            }

            const reviews = await reviewsResponse.json();
            // Local avatarUrl (maybe null if user reset to default, undefined if not logged in)
            const localAvatarUrl = req.user ? (req.user as any).avatarUrl : undefined;

            // Normalize and enrich: override userAvatarUrl with local value for current user's reviews
            const normalized = Array.isArray(reviews)
                ? reviews.map((r: any) => {
                    const isCurrentUser = numericBackendUserId && String(r.userId) === numericBackendUserId;
                    return {
                        ...r,
                        replies: r.replies ?? [],
                        ...(isCurrentUser && localAvatarUrl !== undefined ? { userAvatarUrl: localAvatarUrl } : {}),
                    };
                })
                : reviews;
            res.json(normalized);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({ message: 'Failed to fetch reviews' });
        }
    });

    app.post('/api/reviews', isAuthenticated, async (req, res) => {
        try {
            const backendUserId = extractBackendUserId(req);
            const { playId, content, rating, parentId } = req.body;

            if (!content || typeof content !== 'string' || content.trim().length === 0) {
                return res.status(400).json({ message: 'Content is required' });
            }

            if (rating !== undefined && (rating < 1 || rating > 5)) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }


            const playsResponse: Response = await fetch('http://localhost:8080/api/v1/plays');
            if (!playsResponse.ok) return res.status(500).json({ message: 'Failed to fetch plays from backend' });

            const allPlays: any = await playsResponse.json();
            const targetPlay: any = findPlayByNumericId(allPlays, playId);

            if (!targetPlay) {
                return res.status(404).json({ message: 'Play not found' });
            }

            const backendPlayId: any = targetPlay.source || targetPlay.title;

            const createResponse: Response = await fetch('http://localhost:8080/api/v1/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: Number(backendUserId),
                    playId: backendPlayId,
                    content: content.trim(),
                    rating: rating || null,
                    parentId: parentId || null,
                }),
            });

            if (!createResponse.ok) {
                const error: any = await createResponse.json();
                return res.status(500).json({ message: error.error || 'Failed to create review' });
            }

            const review: any = await createResponse.json();
            res.status(201).json(review);
        } catch (error: any) {
            console.error('Error creating review:', error);
            res.status(500).json({ message: 'Failed to create review' });
        }
    });

    app.delete('/api/reviews/:id', isAuthenticated, async (req, res) => {
        try {
            const backendUserId = extractBackendUserId(req);
            const reviewId: number = Number(req.params.id);

            const deleteResponse: Response = await fetch(
                `http://localhost:8080/api/v1/reviews/${reviewId}?userId=${backendUserId}`,
                { method: 'DELETE' }
            );

            if (deleteResponse.status === 404) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (!deleteResponse.ok) {
                const error: any = await deleteResponse.json();
                if (error.error && error.error.includes('your own')) {
                    return res.status(403).json({ message: 'You can only delete your own reviews' });
                }
                return res.status(500).json({ message: error.error || 'Failed to delete review' });
            }

            res.json({ message: 'Review deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting review:', error);
            res.status(500).json({ message: 'Failed to delete review' });
        }
    });

    app.post('/api/reviews/:id/like', isAuthenticated, async (req, res) => {
        try {
            const backendUserId = extractBackendUserId(req);
            const reviewId: number = Number(req.params.id);

            const likeResponse: Response = await fetch(
                `http://localhost:8080/api/v1/reviews/${reviewId}/like?userId=${backendUserId}`,
                { method: 'POST' }
            );

            if (!likeResponse.ok) {
                return res.status(500).json({ message: 'Failed to toggle like' });
            }

            const review: any = await likeResponse.json();
            res.json({
                isLiked: review.isLikedByCurrentUser,
                likesCount: review.likesCount
            });
        } catch (error: any) {
            console.error('Error toggling review like:', error);
            res.status(500).json({ message: 'Failed to toggle like' });
        }
    });

return httpServer;
}