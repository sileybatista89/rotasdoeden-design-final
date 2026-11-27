import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccommodationItem,
  LanguageCode,
  ServiceType,
} from './data/rotasData';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { CinematicHero } from './components/CinematicHero';
import { SearchQueryState } from './components/SearchBar';
import { AccommodationSection } from './components/AccommodationSection';
import { PropertyDetailView } from './components/PropertyDetailView';
import { BrandSections } from './components/BrandSections';
import { AccountDrawer, PartnerDrawer } from './components/Overlays';

const FAVORITES_STORAGE_KEY = 'rotas-do-eden-favorites-v1';

export default function App() {
  const [activeSlideId, setActiveSlideId] = useState<number>(0);
  const [navScrolled, setNavScrolled] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('PT');

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
      }
    } catch {
      // Ignore storage failures
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState<SearchQueryState>({
    service: 'alojamento',
    destination: '',
    origin: 'Lisboa',
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
  });

  const [submittedSearch, setSubmittedSearch] = useState<SearchQueryState | null>(null);

  // Shared-element detail state + saved scroll position
  const [selectedDetail, setSelectedDetail] = useState<{
    item: AccommodationItem;
    sourceRect: DOMRect | null;
  } | null>(null);
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
  const savedScrollYRef = useRef<number>(0);

  // Drawers
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [partnerDrawerOpen, setPartnerDrawerOpen] = useState(false);

  // Persist favourites locally
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage quota errors
    }
  }, [favorites]);

  // Navbar scroll threshold: 30% of viewport height
  useEffect(() => {
    const checkScroll = () => {
      setNavScrolled(window.scrollY > window.innerHeight * 0.3);
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Lock background page scroll while full-screen detail view is open
  useEffect(() => {
    if (!selectedDetail) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedDetail]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleOpenAccommodation = useCallback(
    (item: AccommodationItem, sourceRect: DOMRect | null) => {
      if (!selectedDetail) {
        savedScrollYRef.current = window.scrollY;
      }
      setSelectedDetail({ item, sourceRect });
    },
    [selectedDetail]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDetail(null);
    setHiddenCardId(null);
    // Restore exact previous scroll position
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollYRef.current, behavior: 'instant' as ScrollBehavior });
    });
  }, []);

  const handleNavigateSection = useCallback(
    (sectionId: string, service?: ServiceType) => {
      if (selectedDetail) {
        setSelectedDetail(null);
        setHiddenCardId(null);
      }
      if (service) {
        setSearchQuery((prev) => ({ ...prev, service }));
      }
      window.requestAnimationFrame(() => {
        if (sectionId === 'topo') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    [selectedDetail]
  );

  const handleSearchSubmit = useCallback((q: SearchQueryState) => {
    setSubmittedSearch({ ...q });
    const targetId =
      q.service === 'experiencias'
        ? 'experiencias'
        : q.service === 'pacotes'
          ? 'pacotes'
          : 'alojamento';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleExploreSearchFromSection = useCallback(
    (destination: string, service: ServiceType) => {
      const next: SearchQueryState = {
        ...searchQuery,
        destination,
        service,
      };
      setSearchQuery(next);
      setSubmittedSearch(next);
      if (service === 'alojamento') {
        const el = document.getElementById('alojamento');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [searchQuery]
  );

  const handleSelectHeroDestination = useCallback((slideId: number) => {
    setActiveSlideId(slideId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen w-full text-[#1d1a1c]">
      <CustomCursor />

      <Navbar
        scrolled={navScrolled}
        forceSolid={Boolean(selectedDetail)}
        language={language}
        onLanguageChange={setLanguage}
        onSelectSlide={setActiveSlideId}
        onNavigateSection={handleNavigateSection}
        onOpenPartnerDrawer={() => setPartnerDrawerOpen(true)}
        onOpenAccountMenu={() => setAccountMenuOpen((v) => !v)}
        accountMenuOpen={accountMenuOpen}
        favoritesCount={favorites.length}
      />

      <main>
        <CinematicHero
          activeSlideId={activeSlideId}
          onSlideChange={setActiveSlideId}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          detailOpen={Boolean(selectedDetail)}
        />

        <AccommodationSection
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectAccommodation={(item, rect) => handleOpenAccommodation(item, rect)}
          activeSearch={submittedSearch}
          onClearSearch={() => {
            setSubmittedSearch(null);
            setSearchQuery((prev) => ({ ...prev, destination: '' }));
          }}
          hiddenCardId={hiddenCardId}
        />

        <BrandSections
          onSelectHeroDestination={handleSelectHeroDestination}
          onExploreSearch={handleExploreSearchFromSection}
          onOpenPartnerDrawer={() => setPartnerDrawerOpen(true)}
        />
      </main>

      {selectedDetail && (
        <PropertyDetailView
          item={selectedDetail.item}
          sourceRect={selectedDetail.sourceRect}
          searchQuery={searchQuery}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectSimilar={(simItem, rect) => handleOpenAccommodation(simItem, rect)}
          onRequestClose={handleCloseDetail}
          onTransitionStateChange={setHiddenCardId}
        />
      )}

      <AccountDrawer
        open={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenAccommodation={(stay) => handleOpenAccommodation(stay, null)}
        onNavigateSection={handleNavigateSection}
        onOpenPartnerDrawer={() => setPartnerDrawerOpen(true)}
      />

      <PartnerDrawer
        open={partnerDrawerOpen}
        onClose={() => setPartnerDrawerOpen(false)}
      />
    </div>
  );
}
