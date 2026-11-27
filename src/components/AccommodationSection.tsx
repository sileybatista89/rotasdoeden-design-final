import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, MapPin, RotateCcw } from 'lucide-react';
import { ACCOMMODATIONS, AccommodationItem, ServiceType } from '../data/rotasData';
import { SearchQueryState } from './SearchBar';

interface AccommodationSectionProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectAccommodation: (item: AccommodationItem, sourceRect: DOMRect) => void;
  activeSearch: SearchQueryState | null;
  onClearSearch: () => void;
  hiddenCardId: string | null;
}

const ISLAND_FILTERS = [
  'Todos',
  'São Tomé',
  'Ilha do Príncipe',
  'Sul de São Tomé',
  'Atlântico',
] as const;

const SERVICE_LABEL: Record<ServiceType, string> = {
  alojamento: 'Alojamento',
  voos: 'Voos',
  pacotes: 'Pacotes',
  experiencias: 'Experiências',
  transportes: 'Transportes',
};

export function AccommodationSection({
  favorites,
  onToggleFavorite,
  onSelectAccommodation,
  activeSearch,
  onClearSearch,
  hiddenCardId,
}: AccommodationSectionProps) {
  const [islandFilter, setIslandFilter] = useState<string>('Todos');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [poppingFavId, setPoppingFavId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const imageWrapRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter list based on active search or island filter
  const filteredItems = useMemo(() => {
    return ACCOMMODATIONS.filter((item) => {
      if (islandFilter !== 'Todos' && item.island !== islandFilter) {
        return false;
      }
      if (activeSearch && activeSearch.destination.trim().length > 0) {
        const q = activeSearch.destination.trim().toLowerCase();
        const haystack =
          `${item.title} ${item.location} ${item.island} ${item.categoryLabel} ${item.summary}`.toLowerCase();
        if (!haystack.includes(q)) {
          // If query mentions "são tomé", match Sul de São Tomé too
          if (q.includes('são tomé') || q.includes('sao tome')) {
            return item.island.toLowerCase().includes('são tomé');
          }
          if (q.includes('príncipe') || q.includes('principe')) {
            return item.island.toLowerCase().includes('príncipe');
          }
          return false;
        }
      }
      if (activeSearch) {
        const guests = activeSearch.adults + activeSearch.children;
        if (guests > item.maxGuests + 2) {
          return false;
        }
      }
      return true;
    });
  }, [activeSearch, islandFilter]);

  const itemsToRender = filteredItems.length > 0 ? filteredItems : ACCOMMODATIONS;
  const isFallbackList = filteredItems.length === 0;

  // Scroll-driven card entrance (rise 40px + fade, 90ms stagger per column)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      const all: Record<string, boolean> = {};
      ACCOMMODATIONS.forEach((a) => {
        all[a.id] = true;
      });
      setRevealedIds(all);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.stayId;
            if (id) {
              setRevealedIds((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    itemsToRender.forEach((item) => {
      const el = cardRefs.current[item.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemsToRender]);

  const handleHeartClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite(id);
    setPoppingFavId(id);
    window.setTimeout(() => {
      setPoppingFavId((curr) => (curr === id ? null : curr));
    }, 450);
  };

  return (
    <section
      id="alojamento"
      aria-labelledby="heading-estadias"
      className="relative z-20 -mt-[8vh] sm:-mt-[17vh] pb-20 sm:pb-28"
      style={{
        paddingLeft: 'clamp(20px, 9.5vw, 170px)',
        paddingRight: 'clamp(20px, 9.5vw, 170px)',
      }}
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-9 sm:mb-12">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#5c5156] mb-2">
            Curadoria Demonstrativa · Categorias de Alojamento
          </p>
          <h2
            id="heading-estadias"
            className="font-editorial text-[#1d1a1c] leading-[1.08] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(34px, 4.1vw, 56px)' }}
          >
            Estadias extraordinárias
          </h2>
        </div>

        {/* Clean interactive island filter tabs */}
        <div
          role="tablist"
          aria-label="Filtrar estadias por ilha"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1"
        >
          {ISLAND_FILTERS.map((island) => {
            const active = islandFilter === island;
            return (
              <button
                key={island}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setIslandFilter(island)}
                className={`px-3.5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all duration-300 ${
                  active
                    ? 'bg-[#1d1a1c] text-[#fdf0e7] shadow-sm'
                    : 'bg-white/45 text-[#5c5156] hover:bg-white/75 hover:text-[#1d1a1c]'
                }`}
              >
                {island}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Demonstration Search Banner */}
      {activeSearch && (
        <div className="mb-8 rounded-2xl bg-white/72 backdrop-blur-md border border-[#1d1a1c]/8 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_12px_32px_rgba(90,54,44,0.08)]">
          <div className="text-[13.5px] text-[#1d1a1c] leading-relaxed">
            <span className="font-semibold">
              Pesquisa demonstrativa ({SERVICE_LABEL[activeSearch.service]}):
            </span>{' '}
            <span>
              {activeSearch.destination.trim() || 'São Tomé & Príncipe'} ·{' '}
              {activeSearch.adults + activeSearch.children}{' '}
              {activeSearch.adults + activeSearch.children === 1
                ? 'viajante'
                : 'viajantes'}
            </span>
            {isFallbackList && (
              <span className="block sm:inline sm:ml-2 text-[#5c5156]">
                — A mostrar todas as categorias disponíveis para inspiração.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onClearSearch();
              setIslandFilter('Todos');
            }}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1d1a1c] hover:text-[#f39419] whitespace-nowrap shrink-0 self-start sm:self-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar pesquisa</span>
          </button>
        </div>
      )}

      {/* 8 Editorial Accommodation Cards: 4 columns desktop, 2 columns below 1000px */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {itemsToRender.map((item, idx) => {
          const isFav = favorites.includes(item.id);
          const isRevealed = Boolean(revealedIds[item.id]);
          const colDelay = (idx % 4) * 90;
          const isTemporarilyHidden = hiddenCardId === item.id;

          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[item.id] = el;
              }}
              data-stay-id={item.id}
              style={{
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed
                  ? 'translate3d(0, 0px, 0)'
                  : 'translate3d(0, 40px, 0)',
                transition: `opacity 820ms cubic-bezier(0.16, 1, 0.3, 1) ${colDelay}ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${colDelay}ms`,
              }}
            >
              <article
                role="button"
                tabIndex={0}
                onClick={() => {
                  const rectEl = imageWrapRefs.current[item.id];
                  if (rectEl) {
                    onSelectAccommodation(item, rectEl.getBoundingClientRect());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const rectEl = imageWrapRefs.current[item.id];
                    if (rectEl) {
                      onSelectAccommodation(item, rectEl.getBoundingClientRect());
                    }
                  }
                }}
                aria-label={`Abrir detalhes demonstrativos de ${item.title} em ${item.location}`}
                className="eden-stay-card group relative w-full rounded-[12px] overflow-hidden bg-[#2b2220] shadow-[0_14px_34px_rgba(68,38,28,0.14)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7d9c6]"
                style={{
                  aspectRatio: '203 / 268',
                  opacity: isTemporarilyHidden ? 0 : 1,
                }}
              >
                {/* Shared-element source image container */}
                <div
                  ref={(el) => {
                    imageWrapRefs.current[item.id] = el;
                  }}
                  data-stay-card-id={item.id}
                  className="absolute inset-0 overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={`${item.title} — ${item.location} (imagem ilustrativa)`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="eden-stay-card-img w-full h-full object-cover"
                  />
                </div>

                {/* Bottom darkening gradient scrim for WCAG contrast */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20, 14, 15, 0.86) 0%, rgba(20, 14, 15, 0.44) 38%, rgba(20, 14, 15, 0.08) 68%, rgba(20, 14, 15, 0.16) 100%)',
                  }}
                />

                {/* Top right Favourite Button */}
                <button
                  type="button"
                  onClick={(e) => handleHeartClick(e, item.id)}
                  aria-label={
                    isFav
                      ? `Remover ${item.title} dos favoritos`
                      : `Guardar ${item.title} nos favoritos`
                  }
                  aria-pressed={isFav}
                  className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/26 hover:bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Heart
                    className={`w-[18px] h-[18px] transition-colors duration-200 ${
                      poppingFavId === item.id ? 'eden-heart-pop' : ''
                    }`}
                    strokeWidth={1.9}
                    stroke={isFav ? '#ff4d5e' : '#ffffff'}
                    fill={isFav ? '#ff4d5e' : 'none'}
                  />
                </button>

                {/* Bottom Editorial Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 text-white flex flex-col justify-end">
                  <div className="text-[10.5px] sm:text-[11px] font-medium tracking-[0.04em] text-white/75 mb-1 truncate">
                    {item.categoryLabel}
                  </div>
                  <h3 className="font-editorial text-[19px] sm:text-[23px] leading-[1.15] text-white mb-1.5">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[12px] text-white/85 mb-2.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#f7d9c6] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="pt-2.5 border-t border-white/20 flex items-baseline justify-between gap-2">
                    <div className="text-[13px] sm:text-[14px] font-semibold tabular-nums text-white">
                      €{item.demoPricePerNight}
                      <span className="text-[11.5px] font-normal text-white/75">
                        {' '}
                        / noite
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#f7d9c6]/90 whitespace-nowrap">
                      Demo
                    </span>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Honest transparency footnote */}
      <p className="mt-6 text-[12px] text-[#8a7f83] leading-relaxed">
        As categorias, tarifas e fotografias acima são demonstrativas e ilustram a tipologia de alojamentos curados pela Rotas do Éden sem constituir inventário comercial em tempo real.
      </p>
    </section>
  );
}
