import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Heart,
  Info,
  MapPin,
  Minus,
  Plus,
  Users,
} from 'lucide-react';
import { ACCOMMODATIONS, AccommodationItem } from '../data/rotasData';
import { SearchQueryState } from './SearchBar';

interface PropertyDetailViewProps {
  item: AccommodationItem;
  sourceRect: DOMRect | null;
  searchQuery: SearchQueryState;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectSimilar: (item: AccommodationItem, rect: DOMRect) => void;
  onRequestClose: () => void;
  onTransitionStateChange: (hiddenCardId: string | null) => void;
}

interface FloatingCloneState {
  src: string;
  from: { left: number; top: number; width: number; height: number; radius: number };
  to: { left: number; top: number; width: number; height: number; radius: number };
  duration: number;
  phase: 'open' | 'close';
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function PropertyDetailView({
  item,
  sourceRect,
  searchQuery,
  favorites,
  onToggleFavorite,
  onSelectSimilar,
  onRequestClose,
  onTransitionStateChange,
}: PropertyDetailViewProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [heroLanded, setHeroLanded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [clone, setClone] = useState<FloatingCloneState | null>(null);
  const [poppingFav, setPoppingFav] = useState(false);

  // Local demonstration booking controls
  const [checkInStr, setCheckInStr] = useState<string>(() =>
    toInputDate(searchQuery.checkIn ?? addDays(new Date(), 14))
  );
  const [checkOutStr, setCheckOutStr] = useState<string>(() =>
    toInputDate(searchQuery.checkOut ?? addDays(new Date(), 18))
  );
  const [adults, setAdults] = useState<number>(Math.min(searchQuery.adults, item.maxGuests));
  const [children, setChildren] = useState<number>(searchQuery.children);
  const [simulatedBooking, setSimulatedBooking] = useState(false);

  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const cloneElRef = useRef<HTMLDivElement | null>(null);

  const isFav = favorites.includes(item.id);
  const similarItems = useMemo(
    () =>
      item.similarIds
        .map((id) => ACCOMMODATIONS.find((a) => a.id === id))
        .filter((x): x is AccommodationItem => Boolean(x)),
    [item.similarIds]
  );

  // Reset gallery & simulation state when switching items
  useEffect(() => {
    setActivePhotoIndex(0);
    setSimulatedBooking(false);
    setAdults(Math.min(Math.max(1, searchQuery.adults), item.maxGuests));
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  }, [item.id, item.maxGuests, searchQuery.adults]);

  // Escape key closes smoothly
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Launch shared-element open FLIP animation (900ms, easeInOutCubic, 12px -> 10px)
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetEl = mainImageRef.current;

    if (prefersReduced || !sourceRect || !targetEl) {
      setHeroLanded(true);
      setContentVisible(true);
      onTransitionStateChange(null);
      return;
    }

    setHeroLanded(false);
    setContentVisible(false);
    onTransitionStateChange(item.id);

    const targetRect = targetEl.getBoundingClientRect();

    setClone({
      src: item.image,
      from: {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        radius: 12,
      },
      to: {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        radius: 10,
      },
      duration: 900,
      phase: 'open',
    });

    // Reveal surrounding editorial content slightly before landing
    const revealTimer = window.setTimeout(() => {
      setContentVisible(true);
    }, 180);

    return () => window.clearTimeout(revealTimer);
  }, [item.id, item.image, sourceRect, onTransitionStateChange]);

  // Drive floating clone animation cleanly via Web Animations API
  useEffect(() => {
    if (!clone || !cloneElRef.current) return;
    const el = cloneElRef.current;

    const anim = el.animate(
      [
        {
          left: `${clone.from.left}px`,
          top: `${clone.from.top}px`,
          width: `${clone.from.width}px`,
          height: `${clone.from.height}px`,
          borderRadius: `${clone.from.radius}px`,
        },
        {
          left: `${clone.to.left}px`,
          top: `${clone.to.top}px`,
          width: `${clone.to.width}px`,
          height: `${clone.to.height}px`,
          borderRadius: `${clone.to.radius}px`,
        },
      ],
      {
        duration: clone.duration,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      if (clone.phase === 'open') {
        setHeroLanded(true);
        setClone(null);
        onTransitionStateChange(null);
      } else {
        setClone(null);
        onTransitionStateChange(null);
        onRequestClose();
      }
    };

    return () => {
      anim.cancel();
    };
  }, [clone, onRequestClose, onTransitionStateChange]);

  // Return FLIP transition: fly main image back to original card
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetCardEl = document.querySelector<HTMLElement>(
      `[data-stay-card-id="${item.id}"]`
    );
    const currentMainEl = mainImageRef.current;

    if (prefersReduced || !targetCardEl || !currentMainEl) {
      onTransitionStateChange(null);
      onRequestClose();
      return;
    }

    const fromRect = currentMainEl.getBoundingClientRect();
    const backRect = targetCardEl.getBoundingClientRect();

    // Only fly back if card rect is reasonably within viewport
    const isCardVisible =
      backRect.width > 0 &&
      backRect.height > 0 &&
      backRect.bottom > -120 &&
      backRect.top < window.innerHeight + 120;

    if (!isCardVisible) {
      onTransitionStateChange(null);
      onRequestClose();
      return;
    }

    setContentVisible(false);
    setHeroLanded(false);
    onTransitionStateChange(item.id);

    setClone({
      src: item.gallery[activePhotoIndex] ?? item.image,
      from: {
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
        radius: 10,
      },
      to: {
        left: backRect.left,
        top: backRect.top,
        width: backRect.width,
        height: backRect.height,
        radius: 12,
      },
      duration: 780,
      phase: 'close',
    });
  };

  // Calculate demonstration nights & subtotal
  const nights = useMemo(() => {
    const start = new Date(checkInStr);
    const end = new Date(checkOutStr);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) && diff > 0 ? diff : 4;
  }, [checkInStr, checkOutStr]);

  const demoStayTotal = nights * item.demoPricePerNight;
  const demoEcoContribution = nights * 12;
  const demoGrandTotal = demoStayTotal + demoEcoContribution;

  const staggerStyle = (step: number) => ({
    opacity: contentVisible && !isClosing ? 1 : 0,
    transform:
      contentVisible && !isClosing
        ? 'translate3d(0, 0px, 0)'
        : 'translate3d(0, 26px, 0)',
    transition: `opacity 680ms cubic-bezier(0.16, 1, 0.3, 1) ${
      step * 70
    }ms, transform 760ms cubic-bezier(0.16, 1, 0.3, 1) ${step * 70}ms`,
  });

  return (
    <>
      {/* Full-Screen Detail Layer */}
      <div
        ref={detailScrollRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes demonstrativos de ${item.title}`}
        className="fixed inset-0 z-40 overflow-y-auto transition-opacity duration-500"
        style={{
          backgroundColor: isClosing ? 'rgba(255,255,255,0)' : '#ffffff',
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
      >
        {/* Warm Peach Upper Band (~290px) */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[290px] pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: '#f7d9c6',
            opacity: isClosing ? 0 : 1,
          }}
        />

        {/* Detail Content Wrapper */}
        <div
          className="relative z-10 pt-[96px] pb-24"
          style={{
            paddingLeft: 'clamp(20px, 9.5vw, 170px)',
            paddingRight: 'clamp(20px, 9.5vw, 170px)',
          }}
        >
          {/* Breadcrumbs + Return Action */}
          <div
            style={staggerStyle(0)}
            className="flex flex-wrap items-center justify-between gap-4 mb-7"
          >
            <nav
              aria-label="Navegação estrutural"
              className="flex items-center flex-wrap gap-1.5 text-[13px] text-[#5c5156]"
            >
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 font-semibold text-[#1d1a1c] hover:text-[#f39419] transition-colors mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span aria-hidden="true" className="text-[#8a7f83]">
                ·
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="hover:text-[#1d1a1c] transition-colors"
              >
                Início
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#8a7f83]" />
              <button
                type="button"
                onClick={handleClose}
                className="hover:text-[#1d1a1c] transition-colors"
              >
                Alojamento
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#8a7f83]" />
              <span>{item.island}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8a7f83]" />
              <span className="text-[#1d1a1c] font-medium">{item.title}</span>
            </nav>

            <button
              type="button"
              onClick={() => {
                onToggleFavorite(item.id);
                setPoppingFav(true);
                window.setTimeout(() => setPoppingFav(false), 440);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-[#1d1a1c]/10 text-[13px] font-medium text-[#1d1a1c] transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${poppingFav ? 'eden-heart-pop' : ''}`}
                stroke={isFav ? '#ff4d5e' : '#1d1a1c'}
                fill={isFav ? '#ff4d5e' : 'none'}
              />
              <span>{isFav ? 'Guardado nos favoritos' : 'Guardar favorito'}</span>
            </button>
          </div>

          {/* Two-Column Desktop Layout (1.18fr / 1fr), 1 Column Below 1000px */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_1fr] gap-8 xl:gap-12 items-start">
            {/* LEFT COLUMN: Large Main Photograph + 3 Gallery Thumbnails */}
            <div>
              <div
                ref={mainImageRef}
                className="relative w-full overflow-hidden bg-[#f2e2d7] shadow-[0_24px_60px_rgba(68,38,28,0.16)]"
                style={{
                  aspectRatio: '4 / 3.45',
                  borderRadius: '10px',
                  opacity: heroLanded ? 1 : 0,
                }}
              >
                <img
                  src={item.gallery[activePhotoIndex] ?? item.image}
                  alt={`${item.title} — vista ${activePhotoIndex + 1} (imagem ilustrativa)`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#1d1a1c]/65 backdrop-blur-md text-[11px] text-white/90">
                  Imagem ilustrativa · Categoria demonstrativa
                </div>
              </div>

              {/* Three Working Gallery Thumbnails */}
              <div
                style={staggerStyle(2)}
                className="grid grid-cols-3 gap-3 sm:gap-4 mt-4"
              >
                {item.gallery.slice(0, 3).map((imgUrl, idx) => {
                  const selected = idx === activePhotoIndex;
                  return (
                    <button
                      key={`${item.id}-thumb-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`Ver imagem ${idx + 1} de ${item.title}`}
                      className={`relative rounded-[10px] overflow-hidden aspect-[4/3] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419] ${
                        selected
                          ? 'ring-2 ring-[#1d1a1c] ring-offset-2 opacity-100'
                          : 'opacity-72 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Editorial Description & Amenities below gallery on desktop */}
              <div style={staggerStyle(4)} className="mt-10 space-y-8">
                <div>
                  <h2 className="font-editorial text-[26px] text-[#1d1a1c] mb-3">
                    Sobre esta categoria de estadia
                  </h2>
                  <div className="space-y-4 text-[15.5px] leading-[1.72] text-[#5c5156]">
                    {item.description.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#1d1a1c]/10" />

                <div>
                  <h3 className="font-editorial text-[23px] text-[#1d1a1c] mb-4">
                    Comodidades previstas nesta tipologia
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2.5 text-[14.5px] text-[#1d1a1c]"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#f7d9c6] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[#1d1a1c]" strokeWidth={2.4} />
                        </span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-editorial text-[23px] text-[#1d1a1c] mb-3">
                    Destaques da experiência
                  </h3>
                  <ul className="space-y-2 text-[14.5px] text-[#5c5156]">
                    {item.highlights.map((hl) => (
                      <li key={hl} className="flex items-start gap-2.5">
                        <span className="text-[#f39419] font-bold mt-0.5">—</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Editorial Title + Demonstration Booking Card */}
            <div className="lg:sticky lg:top-[102px] space-y-6">
              <div style={staggerStyle(1)} className="pt-2">
                <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#5c5156] mb-2">
                  {item.categoryLabel}
                </div>
                <h1
                  className="font-editorial text-[#1d1a1c] leading-[1.08] mb-3"
                  style={{ fontSize: 'clamp(34px, 3.6vw, 48px)' }}
                >
                  {item.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#5c5156]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#1d1a1c]">
                    <MapPin className="w-4 h-4 text-[#f39419]" />
                    {item.location}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Até {item.maxGuests} hóspedes</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {item.bedrooms} {item.bedrooms === 1 ? 'quarto' : 'quartos'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{item.areaSqm} m²</span>
                </div>
                <p className="mt-4 text-[15px] leading-[1.65] text-[#5c5156]">
                  {item.summary}
                </p>
              </div>

              {/* Demonstration Booking Simulation Card */}
              <div
                style={staggerStyle(3)}
                className="rounded-[22px] bg-[#fdf6f0] border border-[#1d1a1c]/10 p-6 sm:p-7 shadow-[0_20px_54px_rgba(94,54,40,0.09)]"
              >
                <div className="flex items-baseline justify-between gap-4 pb-5 border-b border-[#1d1a1c]/10">
                  <div>
                    <span className="font-editorial text-[34px] text-[#1d1a1c] tabular-nums">
                      €{item.demoPricePerNight}
                    </span>
                    <span className="text-[14px] text-[#5c5156]"> / noite</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#8a7f83]">
                    Tarifa demonstrativa
                  </span>
                </div>

                {/* Date-Range Controls */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <label className="block rounded-xl bg-white border border-[#1d1a1c]/10 px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7f83] mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Check-in
                    </span>
                    <input
                      type="date"
                      value={checkInStr}
                      min={toInputDate(new Date())}
                      onChange={(e) => {
                        setCheckInStr(e.target.value);
                        setSimulatedBooking(false);
                      }}
                      className="w-full bg-transparent text-[13.5px] font-semibold text-[#1d1a1c] tabular-nums focus:outline-none"
                    />
                  </label>
                  <label className="block rounded-xl bg-white border border-[#1d1a1c]/10 px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7f83] mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Check-out
                    </span>
                    <input
                      type="date"
                      value={checkOutStr}
                      min={checkInStr}
                      onChange={(e) => {
                        setCheckOutStr(e.target.value);
                        setSimulatedBooking(false);
                      }}
                      className="w-full bg-transparent text-[13.5px] font-semibold text-[#1d1a1c] tabular-nums focus:outline-none"
                    />
                  </label>
                </div>

                {/* Traveller Controls */}
                <div className="mt-3 rounded-xl bg-white border border-[#1d1a1c]/10 px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13.5px] font-medium text-[#1d1a1c]">
                      <Users className="w-4 h-4 text-[#5c5156]" />
                      Adultos
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        aria-label="Diminuir adultos"
                        disabled={adults <= 1}
                        onClick={() => {
                          setAdults((v) => Math.max(1, v - 1));
                          setSimulatedBooking(false);
                        }}
                        className="w-8 h-8 rounded-full border border-[#1d1a1c]/15 flex items-center justify-center hover:bg-[#f7d9c6]/50 disabled:opacity-35"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-[14px] font-semibold tabular-nums">
                        {adults}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar adultos"
                        disabled={adults + children >= item.maxGuests}
                        onClick={() => {
                          setAdults((v) => v + 1);
                          setSimulatedBooking(false);
                        }}
                        className="w-8 h-8 rounded-full border border-[#1d1a1c]/15 flex items-center justify-center hover:bg-[#f7d9c6]/50 disabled:opacity-35"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-[#1d1a1c]/8" />

                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-medium text-[#5c5156]">
                      Crianças
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        aria-label="Diminuir crianças"
                        disabled={children <= 0}
                        onClick={() => {
                          setChildren((v) => Math.max(0, v - 1));
                          setSimulatedBooking(false);
                        }}
                        className="w-8 h-8 rounded-full border border-[#1d1a1c]/15 flex items-center justify-center hover:bg-[#f7d9c6]/50 disabled:opacity-35"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-[14px] font-semibold tabular-nums">
                        {children}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar crianças"
                        disabled={adults + children >= item.maxGuests}
                        onClick={() => {
                          setChildren((v) => v + 1);
                          setSimulatedBooking(false);
                        }}
                        className="w-8 h-8 rounded-full border border-[#1d1a1c]/15 flex items-center justify-center hover:bg-[#f7d9c6]/50 disabled:opacity-35"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 space-y-2 text-[14px]">
                  <div className="flex items-center justify-between text-[#5c5156]">
                    <span className="tabular-nums">
                      €{item.demoPricePerNight} × {nights}{' '}
                      {nights === 1 ? 'noite' : 'noites'}
                    </span>
                    <span className="font-medium text-[#1d1a1c] tabular-nums">
                      €{demoStayTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5c5156]">
                    <span>Taxa de conservação da biosfera (demo)</span>
                    <span className="font-medium text-[#1d1a1c] tabular-nums">
                      €{demoEcoContribution}
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#1d1a1c]/10 flex items-center justify-between text-[16px] font-semibold text-[#1d1a1c]">
                    <span>Estimativa demonstrativa</span>
                    <span className="tabular-nums">€{demoGrandTotal}</span>
                  </div>
                </div>

                {/* Simulation CTA */}
                <button
                  type="button"
                  onClick={() => setSimulatedBooking(true)}
                  className="mt-6 w-full py-3.5 px-6 rounded-full bg-[#1d1a1c] hover:bg-[#f39419] text-white font-semibold text-[14.5px] transition-colors duration-300 shadow-[0_12px_28px_rgba(29,26,28,0.18)]"
                >
                  Simular pedido de reserva
                </button>

                <div className="mt-3 flex items-start gap-2 text-[12px] text-[#5c5156] leading-relaxed">
                  <Info className="w-4 h-4 text-[#f39419] shrink-0 mt-0.5" />
                  <span>
                    Ação estritamente demonstrativa. Nenhuma reserva ou pagamento real é processado neste protótipo.
                  </span>
                </div>

                {/* Transparent Simulation Result */}
                {simulatedBooking && (
                  <div className="mt-4 rounded-2xl bg-[#f7d9c6]/60 border border-[#f39419]/35 p-4 text-[13.5px] text-[#1d1a1c] leading-relaxed">
                    <div className="font-semibold mb-1">
                      Simulação local concluída (sem reserva real)
                    </div>
                    <p className="text-[#5c5156]">
                      Resumo simulado para <strong className="text-[#1d1a1c]">{item.title}</strong> ({nights}{' '}
                      {nights === 1 ? 'noite' : 'noites'}, {adults + children}{' '}
                      {adults + children === 1 ? 'viajante' : 'viajantes'}) — estimativa demonstrativa de{' '}
                      <strong className="text-[#1d1a1c] tabular-nums">€{demoGrandTotal}</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Accommodation Categories */}
          <div style={staggerStyle(5)} className="mt-20 pt-14 border-t border-[#1d1a1c]/10">
            <h2 className="font-editorial text-[30px] sm:text-[36px] text-[#1d1a1c] mb-7">
              Outras estadias semelhantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {similarItems.map((sim) => (
                <button
                  key={sim.id}
                  type="button"
                  onClick={(e) => {
                    const imgBox = e.currentTarget.querySelector<HTMLElement>(
                      '[data-sim-img]'
                    );
                    const rect = imgBox
                      ? imgBox.getBoundingClientRect()
                      : e.currentTarget.getBoundingClientRect();
                    onSelectSimilar(sim, rect);
                  }}
                  className="group text-left rounded-[12px] overflow-hidden bg-[#fdf6f0] border border-[#1d1a1c]/8 hover:shadow-[0_18px_40px_rgba(68,38,28,0.12)] transition-all duration-500"
                >
                  <div
                    data-sim-img
                    className="aspect-[16/11] w-full overflow-hidden bg-[#e7d4c8]"
                  >
                    <img
                      src={sim.image}
                      alt={`${sim.title} (imagem ilustrativa)`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] text-[#8a7f83] mb-0.5">
                      {sim.location}
                    </div>
                    <div className="font-editorial text-[21px] text-[#1d1a1c] mb-1">
                      {sim.title}
                    </div>
                    <div className="text-[13px] font-semibold text-[#1d1a1c] tabular-nums">
                      €{sim.demoPricePerNight}
                      <span className="font-normal text-[#5c5156]">
                        {' '}
                        / noite · demo
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Shared-Element Photographic Clone */}
      {clone && (
        <div
          ref={cloneElRef}
          aria-hidden="true"
          className="fixed z-50 overflow-hidden pointer-events-none shadow-[0_26px_70px_rgba(32,18,14,0.28)]"
          style={{
            left: `${clone.from.left}px`,
            top: `${clone.from.top}px`,
            width: `${clone.from.width}px`,
            height: `${clone.from.height}px`,
            borderRadius: `${clone.from.radius}px`,
            willChange: 'left, top, width, height, border-radius',
          }}
        >
          <img
            src={clone.src}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}
