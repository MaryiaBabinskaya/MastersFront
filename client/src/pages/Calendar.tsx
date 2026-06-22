import { useState, useMemo, useEffect, useRef } from "react";
import { useMonthlyRepertoire } from "@/hooks/use-plays";
import { format, addMonths, subMonths, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isSameMonth, parse } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { getSpectacles } from "@/lib/repertoire";
import { pl } from "date-fns/locale";
import { s, bgLayer1Style } from "./Calendar.styles";
import { getPlayFallback, getPlayPosterSrc } from "@/lib/play-image";

let _calendarReturnMonth: string | null = null;

export default function CalendarPage() {
    const [location, setLocation] = useLocation();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isForKids, setIsForKids] = useState(false);

    const [currentDate, setCurrentDate] = useState<Date>(() => {
        if (_calendarReturnMonth) {
            try {
                const parsed: Date = parse(_calendarReturnMonth, 'yyyy-MM', new Date());
                if (!isNaN(parsed.getTime())) return parsed;
            } catch { /* fall through */ }
        }
        return new Date();
    });

    const yearMonth: string = format(currentDate, 'yyyy-MM');
    const calendarCardRef = useRef<HTMLDivElement>(null);
    const [calendarCardHeight, setCalendarCardHeight] = useState<number | null>(null);

    useEffect(() => {
        _calendarReturnMonth = null;
    }, []);

    useEffect(() => {
        const newUrl = `/calendar?month=${yearMonth}`;
        if (!location.includes(`month=${yearMonth}`)) {
            setLocation(newUrl, { replace: true });
        }
    }, [yearMonth, location, setLocation]);

    const { data: monthlyItems, isLoading } = useMonthlyRepertoire(yearMonth);

    const safeMonthlyItems: any[] = Array.isArray(monthlyItems) ? monthlyItems : [];
    const plays: any[] = getSpectacles(safeMonthlyItems, isForKids);

    const calendarDays: Date[] = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    const playsPerDay: Map<string, number> = useMemo(() => {
        const counts = new Map<string, number>();
        plays.forEach((play: any) => {
            (play.showtimes || []).forEach((showtime: any) => {
                if (!showtime.showtimeAsDateTime) return;
                try {
                    const date = format(parseISO(showtime.showtimeAsDateTime), 'yyyy-MM-dd');
                    counts.set(date, (counts.get(date) || 0) + 1);
                } catch { /* skip invalid dates */ }
            });
        });
        return counts;
    }, [plays]);

    const selectedDayPlays: any[] = useMemo(() => {
        if (!selectedDate) return [];
        const dayPlays: any[] = [];
        plays.forEach((play: any) => {
            const dayShowtimes = (play.showtimes || []).filter((st: any) => {
                if (!st.showtimeAsDateTime) return false;
                try { return isSameDay(parseISO(st.showtimeAsDateTime), selectedDate); }
                catch { return false; }
            });
            if (dayShowtimes.length > 0) dayPlays.push({ ...play, showtimes: dayShowtimes });
        });

        dayPlays.sort((a: any, b: any) => {
            const earliest = (play: any): Date | null =>
                play.showtimes.reduce((acc: Date | null, st: any) => {
                    if (!st.showtimeAsDateTime) return acc;
                    try {
                        const d = parseISO(st.showtimeAsDateTime);
                        return acc === null || d < acc ? d : acc;
                    } catch { return acc; }
                }, null);

            const ea = earliest(a);
            const eb = earliest(b);
            if (ea && eb) return ea.getTime() - eb.getTime();
            if (ea) return -1;
            if (eb) return 1;
            return 0;
        });

        return dayPlays;
    }, [plays, selectedDate]);

    useEffect(() => {
        if (isLoading || !calendarCardRef.current) return;
        setCalendarCardHeight(calendarCardRef.current.offsetHeight);
    }, [calendarDays, isLoading]);

    const weekDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

    return (
        <div className={s.page}>
            <div className={s.bgLayer1} style={bgLayer1Style} />
            <div className={s.bgLayer2} />
            <div className={s.bgLayer3} />

            <main className={s.main}>
                <div className={s.header}>
                    <h1 className={s.title}>Kalendarz Repertuarowy</h1>
                    <Button
                        onClick={() => setIsForKids(!isForKids)}
                        className="btn-theater flex items-center gap-2 px-6 py-3"
                    >
                        <span className={s.kidsEmojiSpan}>{isForKids ? "🧸" : "🎭"}</span>
                        <span>{isForKids ? "Dla dzieci" : "Dla dorosłych"}</span>
                    </Button>
                </div>

                {isLoading ? (
                    <div className={s.loadingWrapper}>
                        <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
                    </div>
                ) : (
                    <div className={s.grid}>
                        <div className={s.calendarCol}>
                            <div className={s.calendarCard} ref={calendarCardRef}>
                                <div className={s.calendarNav}>
                                    <div className={s.calendarNavInner}>
                                        <Button onClick={() => setCurrentDate(subMonths(currentDate, 1))} variant="outline" size="icon">
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <h2 className={s.calendarNavTitle}>
                                            {format(currentDate, "LLLL yyyy", { locale: pl }).replace(/^\w/, c => c.toUpperCase())}
                                        </h2>
                                        <Button onClick={() => setCurrentDate(addMonths(currentDate, 1))} variant="outline" size="icon">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className={s.calendarBody}>
                                    <div className={s.weekdaysRow}>
                                        {weekDays.map(day => (
                                            <div key={day} className={s.weekdayLabel}>{day}</div>
                                        ))}
                                    </div>
                                    <div className={s.daysGrid}>
                                        {calendarDays.map(day => {
                                            const dateKey = format(day, 'yyyy-MM-dd');
                                            const playCount = playsPerDay.get(dateKey) || 0;
                                            const isCurrentMonth = isSameMonth(day, currentDate);
                                            const isSelected = !!(selectedDate && isSameDay(day, selectedDate));
                                            const isToday = isSameDay(day, new Date());

                                            return (
                                                <button
                                                    key={dateKey}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={cn(
                                                        s.dayBtnBase,
                                                        !isCurrentMonth ? s.dayBtnOtherMonth : s.dayBtnCurrentMonth,
                                                        isSelected && s.dayBtnSelected,
                                                        !isSelected && playCount > 0 && s.dayBtnHasEvents,
                                                        !isSelected && playCount === 0 && s.dayBtnEmpty,
                                                        isToday && !isSelected && s.dayBtnToday,
                                                    )}
                                                >
                                                    <span className={s.dayNumber}>{format(day, 'd')}</span>
                                                    {playCount > 0 && (
                                                        <span className={cn(s.dayCountBase, isSelected ? s.dayCountSelected : s.dayCountDefault)}>
                                                            {playCount} {isForKids ? "🧸" : "🎭"}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={s.sidebarCol}>
                            <div
                                className={s.sidebarCard}
                                style={selectedDayPlays.length > 5 && calendarCardHeight ? { height: calendarCardHeight } : undefined}
                            >
                                <div className={s.sidebarHeader}>
                                    <h3 className={s.sidebarTitle}>
                                        {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: pl }) : 'Wybierz dzień'}
                                    </h3>
                                    <p className={s.sidebarCount}>
                                        {selectedDayPlays.length} {selectedDayPlays.length === 1 ? 'spektakl' : 'spektakli'}
                                    </p>
                                </div>
                                <div className={s.sidebarBody}>
                                    {selectedDayPlays.length === 0 ? (
                                        <div className={s.sidebarEmpty}>Brak spektakli w tym dniu</div>
                                    ) : (
                                        selectedDayPlays.map((play: any) => {
                                            const theaterName = play.theater?.name || play.theatre?.name || '';
                                            const fallback = getPlayFallback(theaterName);
                                            const posterSrc = getPlayPosterSrc(play.imageUrl, theaterName);
                                            return (
                                            <Link key={play.id} href={`/play/${play.id}`} onClick={() => { _calendarReturnMonth = yearMonth; }}>
                                                <div className={s.eventCard}>
                                                    <div className={s.eventCardInner}>
                                                        <img
                                                            src={posterSrc}
                                                            alt={play.title}
                                                            className={s.eventPoster}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                        />
                                                        <div className={s.eventBody}>
                                                            <h4 className={s.eventTitle}>{play.title}</h4>
                                                            <p className={s.eventTheater}>
                                                                {play.theater?.name || play.theatre?.name}
                                                            </p>
                                                            <div className={s.eventTimes}>
                                                                {play.showtimes.map((st: any) => {
                                                                    if (!st.showtimeAsDateTime) return null;
                                                                    try {
                                                                        return (
                                                                            <span key={st.id} className={s.eventTimeBadge}>
                                                                                {format(parseISO(st.showtimeAsDateTime), 'HH:mm')}
                                                                            </span>
                                                                        );
                                                                    } catch { return null; }
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
