import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTheaters } from "@/hooks/use-theaters";
import { useMonthlyRepertoire, usePremieres, monthlyRepertoireOptions } from "@/hooks/use-plays";
import { useFavorites } from "@/hooks/use-favorites";
import { PlayCard } from "@/components/PlayCard";
import { Loader2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PlayWithTheater } from "@shared/schema";
import { getSpectacles } from "@/lib/repertoire";
import { s, filterSectionStyle, premieresTextureStyle } from "./Home.styles";
import { getPlayFallback, getPlayPosterSrc } from "@/lib/play-image";

const MONTHS: string[] = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const INITIAL_PREMIERES_COUNT = 3;

function getTheaterImage(theaterName: string): string {
    const name = theaterName.toLowerCase();
    if (name.includes("bagatela")) return "/img/Bagatela.png";
    if (name.includes("słowacki") || name.includes("slowacki") || name.includes("teatr w krakowie")) return "/img/Slowak.png";
    if (name.includes("groteska")) return "/img/Groteska.png";
    if (name.includes("stary")) return "/img/Stary.png";
    if (name.includes("akademicki") || name.includes("studencki") || name.includes("ast kraków") || name.includes(" ast") || name === "ast") return "/img/AST.png";
    if (name.includes("łaźnia") || name.includes("laznia")) return "/img/LazniaNowa.png";
    if (name.includes("nowy") || name.includes("proxima")) return "/img/proxima.png";
    if (name.includes("stu")) return "/img/stu.png";
    if (name.includes("opera")) return "/img/KrakowskaOpera.png";
    if (name.includes("barakah")) return "/img/BARABAKAN.png";
    if (name.includes("kto")) return "/img/TeatrKTO.png";
    if (name.includes("ludowy")) return "/img/ludowy.png";
    if (name.includes("variete") || name.includes("variet")) return "/img/Variete.png";
    return "";
}

function getTheaterUrl(theaterName: string, fallbackUrl: string): string {
    const name = theaterName.toLowerCase();
    if (name.includes("bagatela")) return "https://bagatela.pl/";
    if (name.includes("groteska")) return "https://www.groteska.pl/";
    if (name.includes("stary")) return "https://stary.pl/";
    if (name.includes("słowacki") || name.includes("slowacki") || name.includes("teatr w krakowie")) return "https://teatrwkrakowie.pl/";
    if (name.includes("akademicki") || name.includes("studencki") || name.includes("ast kraków") || name.includes(" ast") || name === "ast") return "https://krakow.ast.krakow.pl/teatr-ast/repertuar/";
    if (name.includes("łaźnia") || name.includes("laznia")) return "https://www.laznianowa.pl/";
    if (name.includes("nowy") || name.includes("proxima")) return "https://teatrnowy.com.pl/";
    if (name.includes("stu")) return "https://scenastu.pl/";
    if (name.includes("opera")) return "https://opera.krakow.pl/";
    if (name.includes("barakah")) return "https://teatrbarakah.com/";
    if (name.includes("kto")) return "https://teatrkto.pl/";
    if (name.includes("ludowy")) return "https://ludowy.pl/";
    if (name.includes("variete")) return "https://www.teatrvariete.pl/";
    return fallbackUrl || "https://teatrwkrakowie.pl/";
}

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

    const monthNameMatch: any = play.additionalInfo.match(/(?:Premiera|Data prapremiery):?\s*(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s*\r)?/i);
    if (monthNameMatch) {
        const [, day, monthName, year] = monthNameMatch;
        const month: number = POLISH_MONTHS[monthName.toLowerCase()];
        if (month !== undefined) return new Date(Number(year), month, Number(day));
    }

    const numericMatch: any = play.additionalInfo.match(/(?:Premiera|Data prapremiery):?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
    if (numericMatch) {
        const [, day, month, year] = numericMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    return null;
}

export default function Home() {
    const [, setLocation] = useLocation();
    const [isKidsMode, setIsKidsMode] = useState(false);
    const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);
    const [premiereStartIndex, setPremiereStartIndex] = useState(0);

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const [selectedMonth, setSelectedMonthState] = useState<string>(() => {
        const params = new URLSearchParams(window.location.search);
        const monthParam = params.get('month');
        if (monthParam && MONTHS.includes(monthParam)) return monthParam;
        return MONTHS[currentMonthIndex];
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('month') !== selectedMonth) {
            params.set('month', selectedMonth);
            setLocation(`/?${params.toString()}`, { replace: true });
        }
    }, [selectedMonth, setLocation]);

    const selectedMonthIndex = Math.max(0, MONTHS.indexOf(selectedMonth));
    const yearMonth = `${currentYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}`;

    const { data: theaters, isLoading: theatersLoading, error: theatersError } = useTheaters();
    const queryClient = useQueryClient();
    const { data: monthlyItems, isPending: playsLoading, error: playsError } = useMonthlyRepertoire(yearMonth);
    const { data: premiereItems, isLoading: premieresLoading, error: premieresError } = usePremieres(yearMonth);

    useEffect(() => {
        [-1, 1].forEach((delta) => {
            const mi = selectedMonthIndex + delta;
            if (mi < 0 || mi > 11) return;
            const ym = `${currentYear}-${String(mi + 1).padStart(2, "0")}`;
            void queryClient.prefetchQuery(monthlyRepertoireOptions(ym));
        });
    }, [yearMonth, queryClient, selectedMonthIndex, currentYear]);
    const { data: favorites } = useFavorites();

    const safeTheaters: any[] = Array.isArray(theaters) ? theaters : [];
    const safeMonthlyItems: any[] = Array.isArray(monthlyItems) ? monthlyItems : [];
    const safePremiereItems: any[] = Array.isArray(premiereItems) ? premiereItems : [];
    const safeFavorites: any[] = Array.isArray(favorites) ? favorites : [];

    const safePlays: any[] = getSpectacles(safeMonthlyItems, isKidsMode);
    const allPremieres: any[] = getSpectacles(safePremiereItems, isKidsMode);

    const safePremieres: any[] = allPremieres.filter((play: any) => {
        const premiereDate = parsePremiereDate(play);
        if (!premiereDate) return false;
        return premiereDate.getMonth() === selectedMonthIndex && premiereDate.getFullYear() === currentYear;
    });

    const favoriteIds = new Set(safeFavorites.map((f: any) => f.playId));

    const playsByTheater: any[] = safeTheaters
        .filter((theater: any) =>
            selectedTheaters.length === 0 || selectedTheaters.includes(String(theater.id))
        )
        .map((theater: any) => ({
            ...theater,
            plays: safePlays.filter((p: any) => String(p.theaterId) === String(theater.id)),
        }))
        .filter((t: any) => t.plays.length > 0);

    if (theatersError || playsError || premieresError) {
        return (
            <div className={s.errorPage}>
                <div className={s.errorCard}>
                    <h1 className={s.errorTitle}>Błąd ładowania danych</h1>
                    <div className={s.errorBox}>
                        <pre className={s.errorPre}>
                            {String(theatersError || playsError || premieresError)}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={s.page}>
            <section
                className={s.filterSection}
                style={filterSectionStyle}
            >
                <div className={s.filterContainer}>
                    <div className={s.monthSelectWrapper}>
                        <span className={s.filterMonthLabel}>Repertuar na</span>
                        <Select value={selectedMonth} onValueChange={setSelectedMonthState}>
                            <SelectTrigger
                                className={s.monthSelectTrigger}
                                style={{ overflow: 'visible' }}
                            >
                                <SelectValue style={{ overflow: 'visible' }}>
                                    <span
                                        className={s.monthSelectSpan}
                                        style={{ letterSpacing: selectedMonth.length <= 3 ? '0.1em' : '0.2em' }}
                                    >
                                        {selectedMonth.toUpperCase()}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className={s.monthSelectContent}>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m} value={m} className={s.monthSelectItem}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className={s.filterRow}>
                        <div className={s.theaterFilterCol}>
                            <span className={s.theaterFilterLabel}>Teatr</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={s.theaterFilterBtn}>
                                        <span>
                                            {selectedTheaters.length === 0
                                                ? "Wszystkie teatry"
                                                : selectedTheaters.length === 1
                                                    ? safeTheaters.find(t => String(t.id) === selectedTheaters[0])?.name
                                                    : `Wybrano ${selectedTheaters.length} teatrów`}
                                        </span>
                                        <span className={s.filterDropdownArrow}>▼</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className={s.theaterFilterPopover} align="center">
                                    <div className={s.theaterFilterSpace}>
                                        <div className={s.theaterFilterHeader}>
                                            <span className={s.theaterFilterHeaderTitle}>Wybierz teatry</span>
                                            {selectedTheaters.length > 0 && (
                                                <button onClick={() => setSelectedTheaters([])} className={s.theaterFilterClear}>
                                                    Wyczyść
                                                </button>
                                            )}
                                        </div>
                                        {safeTheaters.map((theater: any) => {
                                            const isSelected = selectedTheaters.includes(String(theater.id));
                                            return (
                                                <label key={theater.id} className={s.theaterLabel}>
                                                    <div className={cn(s.theaterCheckboxBase, isSelected ? s.theaterCheckboxChecked : s.theaterCheckboxUnchecked)}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            if (isSelected) {
                                                                setSelectedTheaters(selectedTheaters.filter(id => id !== String(theater.id)));
                                                            } else {
                                                                setSelectedTheaters([...selectedTheaters, String(theater.id)]);
                                                            }
                                                        }}
                                                        className={s.theaterCheckboxHidden}
                                                    />
                                                    <span className={s.theaterNameLabel}>{theater.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className={s.kidsModeCol}>
                            <span className={s.kidsModeLabel}>Aktywny tryb:</span>
                            <Button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsKidsMode(!isKidsMode); }}
                                type="button"
                                className={cn(s.kidsModeBtnBase, s.kidsModeBtnInactive)}
                            >
                                <span className={s.kidsEmojiSpan}>{isKidsMode ? "🧸" : "🎭"}</span>
                                <span className={s.kidsLabelSpan}>
                                    {isKidsMode ? "Dla dzieci" : "Dla dorosłych"}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <main className={s.main}>
                {playsLoading || theatersLoading ? (
                    <div className={s.loadingWrapper}>
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    </div>
                ) : !playsByTheater || playsByTheater.length === 0 ? (
                    <div className={s.emptyWrapper}>
                        <div className={s.emptyInner}>
                            <img src="/img/rama1.png" alt="" aria-hidden="true" className={s.emptyFrameImg} />
                            <div className={s.emptyTextWrapper}>
                                <h3 className={s.emptyText}>
                                    Kurtyna opadła...<br />
                                    Brak spektakli dla wybranych filtrów
                                </h3>
                            </div>
                        </div>
                    </div>
                ) : (
                    playsByTheater.map((theater: any) => (
                        <section key={theater.id} className={s.theaterSection}>
                            <div className={s.theaterLeft}>
                                <div className={s.theaterLeftInner}>
                                    <div className={s.theaterImgWrapper}>
                                        <img
                                            src={getTheaterImage(theater.name)}
                                            alt={theater.name}
                                            className={s.theaterImg}
                                        />
                                    </div>
                                    <a href={getTheaterUrl(theater.name, theater.url)} target="_blank" rel="noopener noreferrer">
                                        <h2 className={s.theaterTitle}>{theater.name}</h2>
                                    </a>
                                </div>
                            </div>
                            <div className={s.theaterPlaysCol}>
                                <div className={s.playsGrid}>
                                    {theater.plays.map((play: PlayWithTheater) => (
                                        <PlayCard key={play.id} play={play} isFavorite={favoriteIds.has(play.id)} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))
                )}
            </main>

            {!premieresLoading && safePremieres.length > 0 && (
                <section className={s.premieresSection}>
                    <div className={s.premieresTexture} style={premieresTextureStyle} />
                    <div className={s.premieresContainer}>
                        <h2 className={s.premieresTitle}>Nadchodzące premiery</h2>
                        <div className={s.premieresRow}>
                            <button
                                onClick={() => setPremiereStartIndex(
                                    premiereStartIndex === 0
                                        ? Math.max(0, safePremieres.length - INITIAL_PREMIERES_COUNT)
                                        : premiereStartIndex - 1
                                )}
                                className={s.premieresNavBtn}
                                aria-label="Pokaż poprzednią premierę"
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>

                            {safePremieres.slice(premiereStartIndex, premiereStartIndex + INITIAL_PREMIERES_COUNT).map((play: any) => {
                                const theaterN = play.theater?.name || '';
                                const fallbackPremiere = getPlayFallback(theaterN);
                                const premiereSrc = getPlayPosterSrc(play.imageUrl, theaterN);
                                return (
                                <Link key={play.id} href={`/play/${play.id || 'unknown'}`}>
                                    <div className={s.premiereCard}>
                                        <div className={s.premiereImageWrapper}>
                                            <div className={s.premiereImageInner}>
                                                <img src={premiereSrc} alt={play.title} className={s.premiereImage} onError={(e) => { (e.target as HTMLImageElement).src = fallbackPremiere; }} />
                                            </div>
                                            <img
                                                src="/img/rama1.png"
                                                alt=""
                                                aria-hidden="true"
                                                className={s.frameImg}
                                            />
                                        </div>
                                        <div className={s.premiereTextArea}>
                                            <div className={s.premiereTheaterLabel}>
                                                {play.theater?.name || 'Unknown Theater'}
                                            </div>
                                            <h3 className={s.premiereTitle}>{play.title}</h3>
                                            {(() => {
                                                const premiereDate = parsePremiereDate(play);
                                                if (!premiereDate) return null;
                                                const day = String(premiereDate.getDate()).padStart(2, '0');
                                                const month = String(premiereDate.getMonth() + 1).padStart(2, '0');
                                                return (
                                                    <p className={s.premiereDate}>
                                                        Premiera: {day}.{month}.{premiereDate.getFullYear()}
                                                    </p>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                                );
                            })}

                            <button
                                onClick={() => setPremiereStartIndex(
                                    premiereStartIndex >= safePremieres.length - INITIAL_PREMIERES_COUNT
                                        ? 0
                                        : premiereStartIndex + 1
                                )}
                                className={s.premieresNavBtn}
                                aria-label="Pokaż następną premierę"
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
