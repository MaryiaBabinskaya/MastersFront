import { useState, useMemo, useEffect } from "react";
import { useMonthlyRepertoire } from "@/hooks/use-plays";
import {
    format, addMonths, subMonths, parseISO,
    startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, startOfWeek, endOfWeek, isSameMonth, parse,
} from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { getEvents } from "@/lib/repertoire";
import { s } from "./TheaterPlotka.styles";

let _plotkaReturnMonth: string | null = null;

export default function TheaterPlotkaPage() {
    const [location, setLocation] = useLocation();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const [currentDate, setCurrentDate] = useState(() => {
        if (_plotkaReturnMonth) {
            try {
                const parsed: Date = parse(_plotkaReturnMonth, 'yyyy-MM', new Date());
                if (!isNaN(parsed.getTime())) return parsed;
            } catch { /* fall through */ }
        }
        return new Date();
    });

    const yearMonth: string = format(currentDate, 'yyyy-MM');

    useEffect(() => {
        _plotkaReturnMonth = null;
    }, []);

    useEffect(() => {
        const newUrl = `/plotka?month=${yearMonth}`;
        if (!location.includes(`month=${yearMonth}`)) {
            setLocation(newUrl, { replace: true });
        }
    }, [yearMonth, location, setLocation]);

    const { data: monthlyItems, isLoading } = useMonthlyRepertoire(yearMonth, undefined);

    const safeMonthlyItems = Array.isArray(monthlyItems) ? monthlyItems : [];
    const events = getEvents(safeMonthlyItems);

    const calendarDays: Date[] = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    const eventsPerDay: Map<string, number> = useMemo(() => {
        const counts = new Map<string, number>();
        events.forEach((event: any) => {
            (event.showtimes || []).forEach((showtime: any) => {
                if (!showtime.showtimeAsDateTime) return;
                try {
                    const date = format(parseISO(showtime.showtimeAsDateTime), 'yyyy-MM-dd');
                    counts.set(date, (counts.get(date) || 0) + 1);
                } catch { /* skip invalid dates */ }
            });
        });
        return counts;
    }, [events]);

    const selectedDayEvents: any[] = useMemo(() => {
        if (!selectedDate) return [];
        const dayEvents: any[] = [];

        events.forEach((event: any) => {
            const dayShowtimes = (event.showtimes || []).filter((st: any) => {
                if (!st.showtimeAsDateTime) return false;
                try { return isSameDay(parseISO(st.showtimeAsDateTime), selectedDate); }
                catch { return false; }
            });
            if (dayShowtimes.length > 0) dayEvents.push({ ...event, showtimes: dayShowtimes });
        });

        dayEvents.sort((a: any, b: any) => {
            const earliest = (ev: any): Date | null =>
                ev.showtimes.reduce((acc: Date | null, st: any): Date | null => {
                    if (!st.showtimeAsDateTime) return acc;
                    try {
                        const d = parseISO(st.showtimeAsDateTime);
                        return !acc || d < acc ? d : acc;
                    } catch { return acc; }
                }, null);

            const ea = earliest(a);
            const eb = earliest(b);
            if (ea && eb) return ea.getTime() - eb.getTime();
            if (!ea) return 1;
            if (!eb) return -1;
            return 0;
        });

        return dayEvents;
    }, [events, selectedDate]);

    const weekDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

    return (
        <div className={s.page}>
            <main className={s.main}>
                <h1 className={s.title}>Teatralna Plotka</h1>

                {isLoading ? (
                    <div className={s.loadingWrapper}>
                        <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
                    </div>
                ) : (
                    <div className={s.grid}>
                        <div className={s.calendarCol}>
                            <div className={s.calendarCard}>
                                <div className={s.calendarNav}>
                                    <div className={s.calendarNavInner}>
                                        <Button variant="ghost" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={s.calendarNavBtn}>
                                            <ChevronLeft className="w-6 h-6" />
                                        </Button>
                                        <h2 className={s.calendarNavTitle}>
                                            {format(currentDate, 'LLLL yyyy', { locale: pl })}
                                        </h2>
                                        <Button variant="ghost" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={s.calendarNavBtn}>
                                            <ChevronRight className="w-6 h-6" />
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
                                        {calendarDays.map((day: Date) => {
                                            const dateKey = format(day, 'yyyy-MM-dd');
                                            const eventCount = eventsPerDay.get(dateKey) || 0;
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
                                                        !isSelected && eventCount > 0 && s.dayBtnHasEvents,
                                                        !isSelected && eventCount === 0 && s.dayBtnEmpty,
                                                        isToday && !isSelected && s.dayBtnToday,
                                                    )}
                                                >
                                                    <span className={s.dayNumber}>{format(day, 'd')}</span>
                                                    {eventCount > 0 && (
                                                        <span className={cn(s.dayCountBase, isSelected ? s.dayCountSelected : s.dayCountDefault)}>
                                                            {eventCount} 🎪
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
                            <div className={s.sidebarCard}>
                                <div className={s.sidebarHeader}>
                                    <h3 className={s.sidebarTitle}>
                                        {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: pl }) : 'Wybierz dzień'}
                                    </h3>
                                    <p className={s.sidebarCount}>
                                        {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'wydarzenie' : 'wydarzeń'}
                                    </p>
                                </div>
                                <div className={s.sidebarBody}>
                                    {selectedDayEvents.length === 0 ? (
                                        <div className={s.sidebarEmpty}>Brak wydarzeń w tym dniu</div>
                                    ) : (
                                        selectedDayEvents.map((event: any) => (
                                            <Link key={event.id} href={`/play/${event.id}`} onClick={() => { _plotkaReturnMonth = yearMonth; }}>
                                                <div className={s.eventCard}>
                                                    <div className={s.eventCardInner}>
                                                        <img
                                                            src={event.imageUrl}
                                                            alt={event.title}
                                                            className={s.eventPoster}
                                                        />
                                                        <div className={s.eventBody}>
                                                            <h4 className={s.eventTitle}>{event.title}</h4>
                                                            <p className={s.eventTheater}>
                                                                {event.theater?.name || event.theatre?.name}
                                                            </p>
                                                            <div className={s.eventTimes}>
                                                                {event.showtimes.map((st: any) => (
                                                                    <span key={st.id} className={s.eventTimeBadge}>
                                                                        {format(parseISO(st.showtimeAsDateTime), 'HH:mm')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
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
