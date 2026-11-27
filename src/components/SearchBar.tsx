import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Minus,
  Plane,
  Plus,
  Send,
  Car,
  Home,
  Sparkles,
  Users,
} from 'lucide-react';
import { DESTINATION_SUGGESTIONS, ServiceType } from '../data/rotasData';

export interface SearchQueryState {
  service: ServiceType;
  destination: string;
  origin: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
}

interface SearchBarProps {
  query: SearchQueryState;
  onQueryChange: (next: SearchQueryState) => void;
  onSearchSubmit: (query: SearchQueryState) => void;
  onInteractionChange: (active: boolean) => void;
  introReady: boolean;
}

const SERVICE_TABS: { id: ServiceType; label: string; icon: typeof Home }[] = [
  { id: 'alojamento', label: 'Alojamento', icon: Home },
  { id: 'voos', label: 'Voos', icon: Plane },
  { id: 'pacotes', label: 'Pacotes', icon: Sparkles },
  { id: 'experiencias', label: 'Experiências', icon: Compass },
  { id: 'transportes', label: 'Transportes', icon: Car },
];

const WEEKDAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShortDate(d: Date | null, placeholder: string): string {
  if (!d) return placeholder;
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS_PT[d.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

export function SearchBar({
  query,
  onQueryChange,
  onSearchSubmit,
  onInteractionChange,
  introReady,
}: SearchBarProps) {
  const [activePopover, setActivePopover] = useState<
    null | 'destination' | 'calendar' | 'guests'
  >(null);
  const [calendarStep, setCalendarStep] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = query.checkIn ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    onInteractionChange(activePopover !== null);
  }, [activePopover, onInteractionChange]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopover(null);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const daysInCalendar = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    // Monday-first offset: Sun (0) -> 6, Mon (1) -> 0, ...
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewMonth]);

  const handleDateClick = (day: Date) => {
    const normalized = startOfDay(day);
    if (normalized < today) return;

    if (
      calendarStep === 'checkIn' ||
      !query.checkIn ||
      (query.checkIn && query.checkOut)
    ) {
      onQueryChange({
        ...query,
        checkIn: normalized,
        checkOut: null,
      });
      setCalendarStep('checkOut');
      return;
    }

    if (normalized <= query.checkIn) {
      onQueryChange({
        ...query,
        checkIn: normalized,
        checkOut: null,
      });
      setCalendarStep('checkOut');
      return;
    }

    // Valid check-out selected -> highlight & auto-open guest selector
    onQueryChange({
      ...query,
      checkOut: normalized,
    });
    setCalendarStep('checkIn');
    setTimeout(() => {
      setActivePopover('guests');
    }, 240);
  };

  const totalTravellers = query.adults + query.children;

  const fieldLabels = useMemo(() => {
    switch (query.service) {
      case 'voos':
        return {
          col1Label: 'Origem & Destino',
          col1Placeholder: 'Lisboa → São Tomé',
          col2Label: 'Partida',
          col3Label: 'Regresso',
          col4Label: 'Passageiros',
        };
      case 'pacotes':
        return {
          col1Label: 'Rota ou Ilha',
          col1Placeholder: 'São Tomé & Príncipe',
          col2Label: 'Início',
          col3Label: 'Fim',
          col4Label: 'Viajantes',
        };
      case 'experiencias':
        return {
          col1Label: 'Ilha ou Experiência',
          col1Placeholder: 'Cacau, Obô, Vela...',
          col2Label: 'Data inicial',
          col3Label: 'Até',
          col4Label: 'Participantes',
        };
      case 'transportes':
        return {
          col1Label: 'Local de recolha',
          col1Placeholder: 'Aeroporto de São Tomé',
          col2Label: 'Levantamento',
          col3Label: 'Devolução',
          col4Label: 'Passageiros',
        };
      default:
        return {
          col1Label: 'Destino',
          col1Placeholder: 'Para onde deseja viajar?',
          col2Label: 'Check-in',
          col3Label: 'Check-out',
          col4Label: 'Viajantes',
        };
    }
  }, [query.service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePopover(null);
    onSearchSubmit(query);
  };

  return (
    <div
      id="pesquisa"
      ref={containerRef}
      className="relative z-30 w-full mx-auto px-5"
      style={{
        maxWidth: 'min(940px, 100%)',
        transform: introReady ? 'translate3d(0, 0, 0)' : 'translate3d(0, 30px, 0)',
        opacity: introReady ? 1 : 0,
        transition:
          'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 420ms, opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1) 420ms',
      }}
    >
      {/* Animated Service Selector Strip */}
      <div className="flex items-center justify-center mb-3">
        <div
          role="tablist"
          aria-label="Serviços de viagem"
          className="inline-flex items-center gap-0.5 sm:gap-1 p-1 rounded-full bg-[#1d1a1c]/42 backdrop-blur-md border border-white/20 overflow-x-auto max-w-full"
        >
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = query.service === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  onQueryChange({ ...query, service: tab.id });
                  onInteractionChange(true);
                }}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-[12.5px] sm:text-[13px] font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors duration-200 ${
                  isActive ? 'text-[#1d1a1c]' : 'text-white/90 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="edenServicePill"
                    transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                  />
                )}
                <Icon className="relative z-10 w-3.5 h-3.5" strokeWidth={1.9} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Floating Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto rounded-[24px] sm:rounded-[26px] border border-white/65"
        style={{
          width: 'min(900px, 100%)',
          backgroundColor: 'rgba(255, 255, 255, 0.93)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 18px 60px rgba(120, 70, 60, 0.16)',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-[1.45fr_0.95fr_0.95fr_1fr_auto] items-center min-h-[82px] sm:h-[90px] px-3 sm:px-4 py-3 sm:py-0 gap-2 sm:gap-0">
          {/* Field 1: Destino */}
          <div className="col-span-2 sm:col-span-1 relative sm:pr-4 sm:border-r sm:border-[#1d1a1c]/10">
            <label
              htmlFor="eden-search-destination"
              className="block text-[11px] font-semibold tracking-[0.04em] text-[#8a7f83] px-2.5 mb-0.5"
            >
              {fieldLabels.col1Label}
            </label>
            <div className="flex items-center gap-2 px-2.5">
              <MapPin className="w-4 h-4 text-[#f39419] shrink-0" strokeWidth={2} />
              <input
                id="eden-search-destination"
                type="text"
                value={query.destination}
                onFocus={() => setActivePopover('destination')}
                onChange={(e) =>
                  onQueryChange({ ...query, destination: e.target.value })
                }
                placeholder={fieldLabels.col1Placeholder}
                autoComplete="off"
                className="w-full bg-transparent text-[14.5px] font-semibold text-[#1d1a1c] placeholder:text-[#8a7f83] placeholder:font-normal focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Field 2: Check-in */}
          <button
            type="button"
            onClick={() => {
              setCalendarStep('checkIn');
              setActivePopover((prev) => (prev === 'calendar' ? null : 'calendar'));
            }}
            className={`text-left px-2.5 sm:px-4 py-2 rounded-2xl transition-colors sm:border-r sm:border-[#1d1a1c]/10 ${
              activePopover === 'calendar' && calendarStep === 'checkIn'
                ? 'bg-[#f7d9c6]/45'
                : 'hover:bg-[#f7d9c6]/25'
            }`}
          >
            <span className="block text-[11px] font-semibold tracking-[0.04em] text-[#8a7f83] mb-0.5">
              {fieldLabels.col2Label}
            </span>
            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1a1c] tabular-nums whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#5c5156] shrink-0" strokeWidth={1.8} />
              <span className={query.checkIn ? 'text-[#1d1a1c]' : 'text-[#8a7f83] font-normal'}>
                {formatShortDate(query.checkIn, 'Escolher')}
              </span>
            </span>
          </button>

          {/* Field 3: Check-out */}
          <button
            type="button"
            onClick={() => {
              setCalendarStep(query.checkIn ? 'checkOut' : 'checkIn');
              setActivePopover((prev) => (prev === 'calendar' ? null : 'calendar'));
            }}
            className={`text-left px-2.5 sm:px-4 py-2 rounded-2xl transition-colors sm:border-r sm:border-[#1d1a1c]/10 ${
              activePopover === 'calendar' && calendarStep === 'checkOut'
                ? 'bg-[#f7d9c6]/45'
                : 'hover:bg-[#f7d9c6]/25'
            }`}
          >
            <span className="block text-[11px] font-semibold tracking-[0.04em] text-[#8a7f83] mb-0.5">
              {fieldLabels.col3Label}
            </span>
            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1a1c] tabular-nums whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#5c5156] shrink-0" strokeWidth={1.8} />
              <span className={query.checkOut ? 'text-[#1d1a1c]' : 'text-[#8a7f83] font-normal'}>
                {formatShortDate(query.checkOut, 'Escolher')}
              </span>
            </span>
          </button>

          {/* Field 4: Viajantes */}
          <button
            type="button"
            onClick={() =>
              setActivePopover((prev) => (prev === 'guests' ? null : 'guests'))
            }
            className={`col-span-2 sm:col-span-1 text-left px-2.5 sm:px-4 py-2 rounded-2xl transition-colors ${
              activePopover === 'guests'
                ? 'bg-[#f7d9c6]/45'
                : 'hover:bg-[#f7d9c6]/25'
            }`}
          >
            <span className="block text-[11px] font-semibold tracking-[0.04em] text-[#8a7f83] mb-0.5">
              {fieldLabels.col4Label}
            </span>
            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d1a1c] tabular-nums whitespace-nowrap">
              <Users className="w-3.5 h-3.5 text-[#5c5156] shrink-0" strokeWidth={1.8} />
              <span>
                {totalTravellers}{' '}
                {totalTravellers === 1 ? 'viajante' : 'viajantes'}
              </span>
            </span>
          </button>

          {/* Search Submit Button */}
          <div className="col-span-2 sm:col-span-1 sm:pl-2 flex justify-end">
            <button
              type="submit"
              aria-label="Pesquisar viagem demonstrativa"
              className="group w-full sm:w-[58px] h-[48px] sm:h-[58px] rounded-[18px] bg-[#1d1a1c] text-white flex items-center justify-center gap-2 shadow-[0_10px_28px_rgba(29,26,28,0.28)] transition-all duration-300 hover:scale-[1.03] sm:hover:scale-110 sm:hover:-rotate-[8deg] hover:bg-[#2c2629] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419] focus-visible:ring-offset-2"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <Send
                className="w-[19px] h-[19px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
              />
              <span className="sm:hidden text-[14px] font-semibold">
                Explorar opções
              </span>
            </button>
          </div>
        </div>

        {/* POPOVERS */}
        <AnimatePresence>
          {activePopover === 'destination' && (
            <motion.div
              key="dest-popover"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 sm:right-auto sm:w-[360px] top-[calc(100%+12px)] rounded-[22px] bg-[#fffaf6]/98 backdrop-blur-xl border border-[#1d1a1c]/10 shadow-[0_24px_65px_rgba(58,34,26,0.2)] p-3 z-50"
            >
              <div className="px-2.5 pt-1 pb-2 text-[11px] font-semibold tracking-[0.05em] text-[#8a7f83]">
                Destinos sugeridos
              </div>
              <div className="space-y-1">
                {DESTINATION_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onQueryChange({ ...query, destination: item.label });
                      setCalendarStep('checkIn');
                      setActivePopover('calendar');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f7d9c6]/50 transition-colors flex items-start gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#f7d9c6]/70 text-[#1d1a1c] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-[14px] font-semibold text-[#1d1a1c]">
                        {item.label}
                      </div>
                      <div className="text-[12px] text-[#5c5156]">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activePopover === 'calendar' && (
            <motion.div
              key="calendar-popover"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] top-[calc(100%+12px)] rounded-[24px] bg-[#fffaf6]/98 backdrop-blur-xl border border-[#1d1a1c]/10 shadow-[0_24px_65px_rgba(58,34,26,0.22)] p-4 sm:p-5 z-50"
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  onClick={() =>
                    setViewMonth(
                      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                    )
                  }
                  className="w-9 h-9 rounded-full hover:bg-[#f7d9c6]/60 flex items-center justify-center text-[#1d1a1c] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className="font-editorial text-[19px] text-[#1d1a1c]">
                    {MONTHS_PT[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                  </div>
                  <div className="text-[11px] text-[#8a7f83]">
                    {calendarStep === 'checkIn' || !query.checkIn
                      ? 'Selecione a data de entrada'
                      : 'Selecione a data de saída'}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Mês seguinte"
                  onClick={() =>
                    setViewMonth(
                      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                    )
                  }
                  className="w-9 h-9 rounded-full hover:bg-[#f7d9c6]/60 flex items-center justify-center text-[#1d1a1c] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Monday-first Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {WEEKDAYS_PT.map((dayName) => (
                  <div
                    key={dayName}
                    className="text-[11px] font-semibold text-[#8a7f83] py-1"
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {daysInCalendar.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-9" />;
                  }

                  const disabled = day < today;
                  const isStart = isSameDay(day, query.checkIn);
                  const isEnd = isSameDay(day, query.checkOut);
                  const previewEnd =
                    !query.checkOut &&
                    query.checkIn &&
                    hoverDate &&
                    hoverDate > query.checkIn
                      ? hoverDate
                      : query.checkOut;

                  const inRange =
                    Boolean(query.checkIn && previewEnd) &&
                    day > query.checkIn! &&
                    day < previewEnd!;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onMouseEnter={() => setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      onClick={() => handleDateClick(day)}
                      className={`h-9 w-full text-[13px] font-medium tabular-nums transition-colors relative flex items-center justify-center ${
                        disabled
                          ? 'text-[#8a7f83]/35 cursor-not-allowed'
                          : isStart || isEnd
                            ? 'bg-[#1d1a1c] text-white rounded-full font-semibold shadow-sm'
                            : inRange
                              ? 'bg-[#f7d9c6]/85 text-[#1d1a1c] rounded-md'
                              : 'text-[#1d1a1c] hover:bg-[#f7d9c6]/50 rounded-full'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1d1a1c]/8 flex items-center justify-between text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    onQueryChange({ ...query, checkIn: null, checkOut: null });
                    setCalendarStep('checkIn');
                  }}
                  className="text-[#5c5156] hover:text-[#1d1a1c] underline underline-offset-2"
                >
                  Limpar datas
                </button>
                <span className="text-[#8a7f83] tabular-nums">
                  {query.checkIn && query.checkOut
                    ? `${formatShortDate(query.checkIn, '')} — ${formatShortDate(query.checkOut, '')}`
                    : 'Intervalo flexível'}
                </span>
              </div>
            </motion.div>
          )}

          {activePopover === 'guests' && (
            <motion.div
              key="guests-popover"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 left-0 sm:left-auto sm:w-[320px] top-[calc(100%+12px)] rounded-[24px] bg-[#fffaf6]/98 backdrop-blur-xl border border-[#1d1a1c]/10 shadow-[0_24px_65px_rgba(58,34,26,0.22)] p-5 z-50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14.5px] font-semibold text-[#1d1a1c]">
                      Adultos
                    </div>
                    <div className="text-[12px] text-[#8a7f83]">13 anos ou mais</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Diminuir adultos"
                      disabled={query.adults <= 1}
                      onClick={() =>
                        onQueryChange({
                          ...query,
                          adults: Math.max(1, query.adults - 1),
                        })
                      }
                      className="w-9 h-9 rounded-full border border-[#1d1a1c]/18 flex items-center justify-center text-[#1d1a1c] hover:bg-[#f7d9c6]/60 disabled:opacity-35 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-[15px] font-semibold tabular-nums">
                      {query.adults}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar adultos"
                      disabled={query.adults >= 10}
                      onClick={() =>
                        onQueryChange({
                          ...query,
                          adults: Math.min(10, query.adults + 1),
                        })
                      }
                      className="w-9 h-9 rounded-full border border-[#1d1a1c]/18 flex items-center justify-center text-[#1d1a1c] hover:bg-[#f7d9c6]/60 disabled:opacity-35 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[#1d1a1c]/8" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14.5px] font-semibold text-[#1d1a1c]">
                      Crianças
                    </div>
                    <div className="text-[12px] text-[#8a7f83]">2 a 12 anos</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Diminuir crianças"
                      disabled={query.children <= 0}
                      onClick={() =>
                        onQueryChange({
                          ...query,
                          children: Math.max(0, query.children - 1),
                        })
                      }
                      className="w-9 h-9 rounded-full border border-[#1d1a1c]/18 flex items-center justify-center text-[#1d1a1c] hover:bg-[#f7d9c6]/60 disabled:opacity-35 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-[15px] font-semibold tabular-nums">
                      {query.children}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar crianças"
                      disabled={query.children >= 8}
                      onClick={() =>
                        onQueryChange({
                          ...query,
                          children: Math.min(8, query.children + 1),
                        })
                      }
                      className="w-9 h-9 rounded-full border border-[#1d1a1c]/18 flex items-center justify-center text-[#1d1a1c] hover:bg-[#f7d9c6]/60 disabled:opacity-35 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-4 py-2 rounded-full bg-[#1d1a1c] text-white text-[13px] font-medium hover:bg-[#2d272a] transition-colors"
                  >
                    Confirmar ({totalTravellers})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
