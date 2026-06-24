import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import { useFavorites } from "@/hooks/use-favorites";
import { useCurtainNavigation } from "@/components/CurtainTransition";
import { Loader2, Ticket, Star, User, LogOut, Settings, Mail, Calendar as CalendarIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { PlayCard } from "@/components/PlayCard";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { s } from "./Account.styles";
import { getPlayFallback, getPlayPosterSrc } from "@/lib/play-image";

export default function Account() {
    const { user, isLoading: authLoading, logout, refetchUser } = useAuth();
    const { data: tickets, isLoading: ticketsLoading } = useTickets();
    const { data: favorites, isLoading: favoritesLoading } = useFavorites();
    const { curtainEnabled, toggleCurtain } = useCurtainNavigation();
    const { toast } = useToast();

    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isResettingAvatar, setIsResettingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast({ title: "Błąd", description: "Proszę wybrać plik obrazu (JPG, PNG, itp.)", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Plik za duży", description: "Maksymalny rozmiar zdjęcia to 5MB", variant: "destructive" });
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await fetch("/api/user/avatar", { method: 'POST', body: formData, credentials: 'include' });
            if (response.ok) {
                toast({ title: "Sukces", description: "Avatar został zaktualizowany" });
                await refetchUser();
            } else {
                toast({ title: "Błąd uploadu", description: "Nie udało się wgrać avatara. Spróbuj ponownie.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Błąd uploadu", description: "Nie udało się wgrać avatara. Spróbuj ponownie.", variant: "destructive" });
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAvatarReset = async () => {
        setIsResettingAvatar(true);
        try {
            const response = await fetch('/api/user/avatar', { method: 'DELETE', credentials: 'include' });
            if (response.ok) {
                toast({ title: "Sukces", description: "Avatar został zresetowany do domyślnego" });
                await refetchUser();
            } else {
                toast({ title: "Błąd resetu", description: "Nie udało się zresetować avatara. Spróbuj ponownie.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Błąd resetu", description: "Nie udało się zresetować avatara. Spróbuj ponownie.", variant: "destructive" });
        } finally {
            setIsResettingAvatar(false);
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || !email.trim() || !password.trim()) {
            toast({ title: "Błąd", description: "Proszę wypełnić wszystkie pola", variant: "destructive" });
            return;
        }
        if (password.length < 6) {
            toast({ title: "Błąd", description: "Hasło musi mieć co najmniej 6 znaków", variant: "destructive" });
            return;
        }
        setIsRegistering(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, email, password }),
                credentials: "include",
            });
            const data: any = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (data.code === "BACKEND_UNAVAILABLE") {
                    toast({ title: "Serwis niedostępny", description: "Nie można połączyć się z serwerem. Sprawdź czy backend działa na porcie 8080.", variant: "destructive" });
                } else if (data.code === "NICKNAME_TAKEN" || data.error?.toLowerCase().includes("nickname") || response.status === 409) {
                    toast({ title: "Nickname jest zajęty", description: "Ten nickname jest już używany. Wybierz inny nickname.", variant: "destructive" });
                } else if (data.code === "EMAIL_TAKEN" || data.error?.toLowerCase().includes("email")) {
                    toast({ title: "Email jest zajęty", description: "Ten email jest już zarejestrowany w systemie.", variant: "destructive" });
                } else {
                    toast({ title: "Błąd rejestracji", description: data.error || `Błąd ${response.status}. Sprawdź czy backend działa.`, variant: "destructive" });
                }
                return;
            }
            toast({ title: "Konto utworzone!", description: "Zarejestrowano pomyślnie. Możesz się teraz zalogować." });
            setAuthMode("login");
        } catch (error: any) {
            toast({ title: "Błąd rejestracji", description: error.message || "Nie udało się zarejestrować. Spróbuj ponownie.", variant: "destructive" });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleLoginInternal = async () => {
        if (!nickname.trim() || !email.trim() || !password.trim()) return;
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, email, password }),
                credentials: "include",
            });
            const data: any = await response.json();
            if (!response.ok) {
                if (data.code === "USER_NOT_FOUND") {
                    toast({ title: "Konto nie istnieje", description: "Nie znaleziono konta z tym emailem. Przejdź do rejestracji, aby utworzyć konto.", variant: "destructive" });
                } else if (data.code === "INVALID_CREDENTIALS") {
                    toast({ title: "Nieprawidłowe dane", description: "Nickname nie pasuje do podanego emaila.", variant: "destructive" });
                } else if (data.code === "BACKEND_UNAVAILABLE") {
                    toast({ title: "Serwis niedostępny", description: "Nie można połączyć się z serwerem. Spróbuj ponownie później.", variant: "destructive" });
                } else {
                    toast({ title: "Błąd logowania", description: data.error || "Nie udało się zalogować. Spróbuj ponownie.", variant: "destructive" });
                }
                return;
            }
            toast({ title: "Sukces", description: "Zalogowano pomyślnie" });
            await refetchUser();
        } catch {
            toast({ title: "Błąd", description: "Nie udało się zalogować. Spróbuj ponownie.", variant: "destructive" });
        }
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || !email.trim() || !password.trim()) {
            toast({ title: "Błąd", description: "Proszę wypełnić wszystkie pola", variant: "destructive" });
            return;
        }
        setIsLoggingIn(true);
        try {
            await handleLoginInternal();
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (authLoading) {
        return (
            <div className={s.loadingPage}>
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!user) {
        const isLogin = authMode === "login";
        return (
            <div className={s.authPage}>
                <div className={s.authCardWrapper}>
                    <div className={s.authCard}>
                        <div className={s.authCardHeader}>
                            <div className={s.authAvatarBadge}>
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <h2 className={s.authTitle}>{isLogin ? "Logowanie" : "Rejestracja"}</h2>
                            <p className={s.authSubtitle}>
                                {isLogin ? "Wprowadź swoje dane, aby kontynuować" : "Utwórz nowe konto"}
                            </p>
                        </div>

                        <form onSubmit={isLogin ? handleLogin : handleRegister} className={s.authForm}>
                            <div>
                                <Label htmlFor="nickname" className={s.formLabel}>Nickname</Label>
                                <Input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Wpisz swój nickname"
                                    className={s.formInput}
                                    disabled={isLoggingIn || isRegistering}
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className={s.formLabel}>Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Wpisz swój email"
                                    className={s.formInput}
                                    disabled={isLoggingIn || isRegistering}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password" className={s.formLabel}>Hasło</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Wpisz swoje hasło"
                                    className={s.formInput}
                                    disabled={isLoggingIn || isRegistering}
                                />
                                {!isLogin && password.length > 0 && password.length < 6 && (
                                    <p className="text-xs text-red-500 mt-1">Hasło musi mieć minimum 6 znaków.</p>
                                )}
                            </div>

                            <div className={s.formActions}>
                                {isLogin ? (
                                    <Button type="submit" className={s.loginBtn} disabled={isLoggingIn}>
                                        {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logowanie...</> : "Zaloguj się"}
                                    </Button>
                                ) : (
                                    <Button type="submit" className={s.loginBtn} disabled={isRegistering}>
                                        {isRegistering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejestracja...</> : "Zarejestruj się"}
                                    </Button>
                                )}
                            </div>
                        </form>

                        <p className={s.authHint}>
                            {isLogin ? (
                                <>Nie masz konta?{" "}
                                    <span className={s.authSwitchLink} onClick={() => { setAuthMode("register"); setNickname(""); setEmail(""); setPassword(""); }}>
                                        Zarejestruj się
                                    </span>
                                </>
                            ) : (
                                <>Masz już konto?{" "}
                                    <span className={s.authSwitchLink} onClick={() => { setAuthMode("login"); setNickname(""); setEmail(""); setPassword(""); }}>
                                        Zaloguj się
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={s.page}>
            <main className={s.main}>
                <div className={s.layout}>

                    <div className={s.sidebar}>
                        <div className={s.card}>
                            <div className={s.cardInner}>
                                <div className={s.avatarWrapper}>
                                    <div className={s.avatarInner}>
                                        <img
                                            src={user.avatarUrl || '/img/logoUSER.png'}
                                            alt={user.displayName || "User"}
                                            className={s.avatarImg}
                                        />
                                    </div>

                                    <img
                                        src="/img/rama1.png"
                                        alt=""
                                        aria-hidden="true"
                                        className={s.frameImg}
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className={s.avatarOverlay}
                                    >
                                        <div className={s.uploadOverlayContent}>
                                            {isUploadingAvatar ? (
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mx-auto mb-2" />
                                                    <span className={s.uploadLabel}>Zmień avatar</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className={s.fileInput} />
                                </div>

                                <h2 className={s.displayName}>{user.displayName}</h2>
                                <p className={s.emailText}>{user.email}</p>

                                <div className={s.profileActions}>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className={s.settingsBtn}>
                                                <Settings className="w-4 h-4" /> Ustawienia
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className={s.settingsDialog}>
                                            <DialogHeader>
                                                <DialogTitle className={s.settingsDialogTitle}>
                                                    <Settings className="w-5 h-5" /> Ustawienia
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Dostosuj ustawienia aplikacji do swoich preferencji
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className={s.settingsBody}>
                                                <div className={s.settingsSwitchRow}>
                                                    <div className={s.settingsSwitchLabelGroup}>
                                                        <Label htmlFor="curtain-toggle" className={s.settingsLabel}>
                                                            Animacja kurtyny
                                                        </Label>
                                                        <p className={s.settingsDescription}>
                                                            Włącz lub wyłącz animację teatralnej kurtyny przy przechodzeniu między stronami
                                                        </p>
                                                    </div>
                                                    <Switch id="curtain-toggle" checked={curtainEnabled} onCheckedChange={toggleCurtain} />
                                                </div>

                                                <div className={s.settingsDivider}>
                                                    <div className={s.settingsGroup}>
                                                        <Label className={s.settingsAvatarLabel}>Avatar użytkownika</Label>
                                                        <p className={s.settingsAvatarDescription}>
                                                            Resetuj avatar do domyślnego logo użytkownika
                                                        </p>
                                                        <Button
                                                            onClick={handleAvatarReset}
                                                            disabled={isResettingAvatar}
                                                            variant="outline"
                                                            className={s.resetAvatarBtn}
                                                        >
                                                            {isResettingAvatar
                                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetowanie...</>
                                                                : "Przywróć domyślny avatar"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button variant="destructive" className={s.logoutBtn} onClick={() => logout()}>
                                        <LogOut className="w-4 h-4" /> Wyloguj się
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className={s.card}>
                            <h3 className={s.infoCardTitle}>
                                <User className="w-5 h-5" /> Informacje o koncie
                            </h3>
                            <div className={s.infoList}>
                                <div className={s.infoItem}>
                                    <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                                    <div>
                                        <p className={s.infoItemLabel}>Email</p>
                                        <p className={s.infoItemValue}>{user.email || "Nie podano"}</p>
                                    </div>
                                </div>
                                {user.createdAt && (
                                    <div className={s.infoItem}>
                                        <CalendarIcon className="w-4 h-4 text-stone-400 mt-0.5" />
                                        <div>
                                            <p className={s.infoItemLabel}>Data rejestracji</p>
                                            <p className={s.infoItemValue}>
                                                {format(new Date(user.createdAt), "d MMMM yyyy", { locale: pl })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={s.contentArea}>

                        <section>
                            <h3 className={s.sectionTitle}>
                                <User className="w-6 h-6" /> Moje Konto
                            </h3>
                            <div className={s.statsGrid}>
                                <div className={s.statCard}>
                                    <div className={s.statCardInner}>
                                        <Ticket className="w-8 h-8 text-yellow-700" />
                                        <div>
                                            <p className={s.statNumber}>
                                                {tickets?.filter(ticket => {
                                                    const date = ticket.showtime?.showtimeAsDateTime || ticket.showtime?.date;
                                                    if (!date) return true;
                                                    const ticketDate = new Date(date);
                                                    const now = new Date();
                                                    return ticketDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                }).length || 0}
                                            </p>
                                            <p className={s.statLabel}>Bilety</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={s.statCard}>
                                    <div className={s.statCardInner}>
                                        <Star className="w-8 h-8 text-yellow-700" />
                                        <div>
                                            <p className={s.statNumber}>{favorites?.length || 0}</p>
                                            <p className={s.statLabel}>Ulubione</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className={s.sectionTitle}>
                                <Ticket className="w-6 h-6" /> Moje Bilety
                            </h3>
                            {ticketsLoading ? (
                                <Loader2 className="animate-spin text-stone-400" />
                            ) : !tickets || tickets.length === 0 ? (
                                <div className={s.ticketsEmpty}>Nie masz jeszcze żadnych biletów.</div>
                            ) : (
                                <div className={s.ticketGrid}>
                                    {tickets
                                        .filter(ticket => {
                                            const date = ticket.showtime?.showtimeAsDateTime || ticket.showtime?.date;
                                            if (!date) return true;
                                            const ticketDate = new Date(date);
                                            const now = new Date();
                                            return ticketDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        })
                                        .sort((a, b) => {
                                            const dateA: string | Date = a.showtime?.showtimeAsDateTime || a.showtime?.date;
                                            const dateB: string | Date = b.showtime?.showtimeAsDateTime || b.showtime?.date;
                                            if (dateA && dateB) return new Date(dateA).getTime() - new Date(dateB).getTime();
                                            if (dateA) return -1;
                                            if (dateB) return 1;
                                            return 0;
                                        })
                                        .map(ticket => {
                                            const play = ticket.playDto || ticket.showtime?.play;
                                            const theater = play?.theatre || play?.theater;
                                            const showtimeDate = ticket.showtime?.showtimeAsDateTime || ticket.showtime?.date;
                                            const theaterName = theater?.name || '';
                                            const fallback = getPlayFallback(theaterName);
                                            const posterSrc = getPlayPosterSrc(play?.imageUrl, theaterName);
                                            return (
                                                <div key={ticket.id} className={s.ticketCard}>
                                                    <div className={s.ticketBody}>
                                                        <div className={s.ticketPoster}>
                                                            {play && (
                                                                <img src={posterSrc} className={s.avatarImg} alt={play.title} onError={(e) => { (e.target as HTMLImageElement).src = fallback; }} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className={s.ticketTitle}>{play?.title || 'Spektakl'}</h4>
                                                            <p className={s.ticketTheater}>{theater?.name || 'Teatr'}</p>
                                                            <div className={s.ticketDate}>
                                                                {showtimeDate && (
                                                                    <span className={s.ticketDateSpan}>
                                                                        Data: {format(new Date(showtimeDate), "d MMMM yyyy, HH:mm", { locale: pl })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={s.ticketActions}>
                                                        <span className={s.ticketBadge}>
                                                            {ticket.status === 'active' ? 'Aktywny' : ticket.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </section>

                        <section>
                            <h3 className={s.sectionTitle}>
                                <Star className="w-6 h-6" /> Ulubione Spektakle
                            </h3>
                            {favoritesLoading ? (
                                <Loader2 className="animate-spin text-stone-400" />
                            ) : !favorites || favorites.length === 0 ? (
                                <div className={s.favoritesEmpty}>Twoja lista ulubionych jest pusta.</div>
                            ) : (
                                <div className={s.favoritesGrid}>
                                    {favorites.map(fav => (
                                        <PlayCard key={fav.id} play={fav.play} isFavorite={true} />
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
