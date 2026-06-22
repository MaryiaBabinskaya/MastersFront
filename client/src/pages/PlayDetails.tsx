import { useRoute } from "wouter";
import { useMemo, useState, type MouseEvent } from "react";
import { usePlay } from "@/hooks/use-plays";
import { Loader2, Calendar, MapPin, Clock, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useToggleFavorite, useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { s } from "./PlayDetails.styles";
import { getPlayFallback, getPlayPosterSrc } from "@/lib/play-image";

type Contributor = { role: string; name: string; profileUrl?: string };
type CastMember = { name: string; role?: string; profileUrl?: string; imageUrl?: string };
type PlayDetailsJson = { contributors?: Contributor[]; cast?: CastMember[]; galleryImages?: string[] };

export default function PlayDetails() {
    const [, params] = useRoute("/play/:id");
    const rawId: string | undefined = params?.id;
    const playId: number = Number(rawId);
    const isValidPlayId: boolean = Number.isInteger(playId) && playId > 0;

    const { data: play, isLoading } = usePlay(isValidPlayId ? playId : 0);
    const { user } = useAuth();
    const { toast } = useToast();
    const toggleFav = useToggleFavorite();
    const { data: favorites } = useFavorites();

    const [selectedShowtime, setSelectedShowtime] = useState<any>(null);
    const [ticketCount, setTicketCount] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const isFavorite: boolean = favorites?.some((fav: any) => fav.playId === playId) ?? false;

    const handleToggleFavorite = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (playId) toggleFav.mutate({ playId });
    };

    const details: PlayDetailsJson | null = useMemo<PlayDetailsJson | null>(() => {
        if (!play) return null;
        const detailsJson: any = (play as any).detailsJson;
        if (!detailsJson) return null;
        try {
            const parsed: any = typeof detailsJson === "string" ? JSON.parse(detailsJson) : detailsJson;

            if (parsed.contributors && Array.isArray(parsed.contributors)) {
                parsed.contributors = parsed.contributors.map((item: any) => {
                    if (typeof item === "string") {
                        const colonIndex = item.indexOf(":");
                        if (colonIndex > 0) return { role: item.substring(0, colonIndex).trim(), name: item.substring(colonIndex + 1).trim() };
                        return { role: "", name: item };
                    }
                    return item;
                });
            }

            if (parsed.cast && Array.isArray(parsed.cast)) {
                parsed.cast = parsed.cast.map((item: any) => (typeof item === "string" ? { name: item } : item));
            }

            return parsed;
        } catch {
            return null;
        }
    }, [play]);

    const showtimes: any[] = useMemo(() => {
        const allShowtimes: any[] = (play as any)?.showtimes ?? [];
        const now = new Date();
        return allShowtimes.filter((st: any) => {
            const date = new Date(st.date || st.showtimeAsDateTime || st.showtime);
            return date > now;
        });
    }, [play]);

    const handleBuyTicket = async () => {
        if (!selectedShowtime || !ticketCount) return;
        const count = Number(ticketCount);
        if (count < 1) return;

        const externalUrl = selectedShowtime.ticketUrl || selectedShowtime.ticketLink || selectedShowtime.ticketlink;
        const showtimeDate = new Date(selectedShowtime.date || selectedShowtime.showtimeAsDateTime || selectedShowtime.showtime);

        if (!user) {
            toast({
                title: "Wymagane logowanie",
                description: "Zaloguj się, aby kupić bilet.",
                variant: "destructive",
            });
            return;
        }

        try {
            const promises = Array.from({ length: count }, (_, i) =>
                fetch('/api/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playId, date: showtimeDate.toISOString(), seatInfo: `Miejsce ${i + 1}` }),
                    credentials: 'include',
                }).then(async (res) => {
                    if (!res.ok) {
                        const error: any = await res.json();
                        throw new Error(error.message || 'Failed to create ticket');
                    }
                    return res.json();
                })
            );

            await Promise.all(promises);
            setDialogOpen(false);
            setTicketCount("");

            if (externalUrl) window.open(externalUrl, '_blank');

            setSelectedShowtime(null);
            window.location.reload();
        } catch (error) {
            alert("Błąd podczas tworzenia biletu: " + (error as any).message);
        }
    };

    if (!isValidPlayId) {
        return (
            <div className={s.centeredPage}>
                <div className={s.errorContent}>
                    <h1 className={s.errorTitle}>Nieprawidłowy identyfikator</h1>
                    <p className={s.errorSubtext}>ID spektaklu: {rawId}</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={s.centeredPage}>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!play) {
        return (
            <div className={s.centeredPage}>
                <div className={s.errorContent}>
                    <h1 className={s.errorTitle}>Spektakl nie został znaleziony</h1>
                    <p className={s.errorSubtext}>ID: {playId}</p>
                </div>
            </div>
        );
    }

    const playData: any = play as any;
    const theatre: any = playData.theatre || playData.theater;
    const theaterName = theatre?.name || '';
    const fallback = getPlayFallback(theaterName);
    const posterSrc = getPlayPosterSrc(play.imageUrl, theaterName);

    return (
        <div className={s.page}>
            <div className={s.hero}>
                <img src={posterSrc} alt={play.title} className={s.heroImage} onError={(e) => { (e.target as HTMLImageElement).src = fallback; }} />
                <div className={s.heroGradient} />

                <div className={s.heroBottom}>
                    <div className={s.heroInner}>
                        <div className={s.posterCol}>
                            <div className={s.posterFrame}>
                                <div className={s.posterImageInner}>
                                    <img src={posterSrc} alt={play.title} className={s.posterImage} onError={(e) => { (e.target as HTMLImageElement).src = fallback; }} />
                                </div>
                                <img src="/img/rama1.png" alt="" aria-hidden="true" className={s.frameImg} />
                                <button onClick={handleToggleFavorite} className={s.favBtn}>
                                    <Star className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-yellow-500 text-yellow-500" : "text-stone-300 hover:text-white")} />
                                </button>
                            </div>
                        </div>

                        <div className={s.heroMeta}>
                            <div className={s.heroTheaterName}>{theatre?.name}</div>
                            <h1 className={s.heroTitle}>{play.title}</h1>
                            <div className={s.heroDetails}>
                                {playData.scene && (
                                    <div className={s.heroScene}>
                                        Scena: <span className={s.sceneValue}>{playData.scene}</span>
                                    </div>
                                )}
                                {playData.duration && (
                                    <div className={s.heroDuration}>
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        {playData.duration}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={s.content}>
                <div className={s.contentGrid}>
                    <div className={s.mainCol}>
                        <div className={s.descCard}>
                            <h3 className={s.descTitle}>O spektaklu</h3>
                            <p className={s.descText}>{play.description}</p>
                        </div>

                        {(playData.premiereDate || playData.duration || playData.additionalInfo) && (
                            <div className={s.infoCard}>
                                <h4 className={s.infoTitle}>
                                    <Info className="w-5 h-5" /> Dodatkowe informacje
                                </h4>
                                <div className={s.infoContent}>
                                    {(playData.premiereDate || playData.duration) && (
                                        <div className={s.infoDateGroup}>
                                            {playData.premiereDate && (
                                                <p className={s.infoText}>
                                                    <span className={s.infoLabel}>Premiera: </span>
                                                    {format(new Date(playData.premiereDate), "d MMMM yyyy", { locale: pl })}
                                                </p>
                                            )}
                                            {playData.duration && (
                                                <p className={s.infoText}>
                                                    <span className={s.infoLabel}>Czas trwania: </span>{playData.duration}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {playData.additionalInfo && (
                                        <p className={cn(s.infoText, "whitespace-pre-line", (playData.premiereDate || playData.duration) && s.infoAdditional)}>
                                            {playData.additionalInfo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {details?.contributors && details.contributors.length > 0 && (
                            <div className={s.creditsCard}>
                                <h4 className={s.creditsTitle}>Twórcy</h4>
                                <div className={s.creditsBody}>
                                    {details.contributors.map((contributor: Contributor, idx: number) => (
                                        <div key={`${contributor.role}-${idx}`} className={s.creditRow}>
                                            <span className={s.creditRole}>{contributor.role}:</span>
                                            <span className={s.creditName}>{contributor.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {details?.cast && details.cast.length > 0 && (
                            <div className={s.creditsCard}>
                                <h4 className={s.creditsTitle}>Obsada</h4>
                                <div className={s.creditsBody}>
                                    {details.cast.map((actor: CastMember, idx: number) => (
                                        <div key={`${actor.name}-${idx}`} className={s.creditRow}>
                                            <span className={s.actorName}>{actor.name}</span>
                                            {actor.role && <span className={s.creditRole}>{actor.role}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <ReviewsSection playId={Number(playId)} />
                    </div>

                    <div className={s.sidebar}>
                        <div className={s.sidebarCard}>
                            <h3 className={s.sidebarTitle}>
                                <Calendar className="w-6 h-6" /> Terminarz
                            </h3>

                            {showtimes.length === 0 ? (
                                <p className={s.showtimeEmpty}>Brak zaplanowanych spektakli.</p>
                            ) : (
                                <div className={s.showtimeList}>
                                    {showtimes.map((st: any) => {
                                        const date = new Date(st.date || st.showtimeAsDateTime || st.showtime);
                                        const ticketUrl = st.ticketUrl || st.ticketLink || st.ticketlink;

                                        return (
                                            <div key={st.id} className={s.showtimeItem}>
                                                <div className={s.showtimeDateCol}>
                                                    <span className={s.showtimeDateLabel}>
                                                        {format(date, "d MMMM", { locale: pl })}
                                                    </span>
                                                    <span className={s.showtimeTimeLabel}>
                                                        {format(date, "HH:mm")}
                                                    </span>
                                                </div>

                                                <Dialog
                                                    open={dialogOpen && selectedShowtime?.id === st.id}
                                                    onOpenChange={(open: boolean) => {
                                                        setDialogOpen(open);
                                                        if (open) setSelectedShowtime(st);
                                                        if (!open) { setSelectedShowtime(null); setTicketCount(""); }
                                                    }}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className={s.buyTicketBtn}>
                                                            Kup bilet
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className={s.ticketDialog}>
                                                        <DialogHeader>
                                                            <DialogTitle>Kupno biletu</DialogTitle>
                                                            <DialogDescription>
                                                                {play.title} - {format(date, "d MMMM HH:mm", { locale: pl })}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {ticketUrl ? (
                                                            <div className={s.ticketDialogBody}>
                                                                <div className={s.ticketFormGroup}>
                                                                    <Label htmlFor="ticketCount">Ilość biletów</Label>
                                                                    <Input
                                                                        id="ticketCount"
                                                                        type="number"
                                                                        min="1"
                                                                        placeholder="np. 2"
                                                                        value={ticketCount}
                                                                        onChange={(e) => setTicketCount(e.target.value)}
                                                                        className={s.ticketCountInput}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={s.noTicketsWrapper}>
                                                                <p className={s.noTicketsText}>Niestety nie ma biletów</p>
                                                            </div>
                                                        )}

                                                        <DialogFooter>
                                                            {ticketUrl && (
                                                                <Button
                                                                    onClick={handleBuyTicket}
                                                                    disabled={!ticketCount || Number(ticketCount) < 1}
                                                                    className={s.confirmTicketBtn}
                                                                >
                                                                    Potwierdź i kup bilety →
                                                                </Button>
                                                            )}
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className={s.theaterBlock}>
                                <div className={s.theaterDetails}>
                                    <div className={s.theaterInfo}>
                                        <MapPin className="w-5 h-5 shrink-0 mt-1 text-primary" />
                                        <div>
                                            <span className={s.theaterName}>{theatre?.name}</span>
                                            {theatre?.url && (
                                                <a href={theatre.url} target="_blank" rel="noopener noreferrer" className={s.theaterLink}>
                                                    Strona teatru →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {(playData.scene || theatre?.name) && (
                                        <div className={s.mapWrapper}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                className="border-0"
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                                    (playData.scene || theatre.name) + ", Kraków, Polska"
                                                )}&output=embed&z=15`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
