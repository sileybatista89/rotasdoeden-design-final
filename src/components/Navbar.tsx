import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { LanguageCode, ServiceType } from '../data/rotasData';

interface NavbarProps {
  scrolled: boolean;
  forceSolid?: boolean;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectSlide: (slideId: number) => void;
  onNavigateSection: (sectionId: string, service?: ServiceType) => void;
  onOpenPartnerDrawer: () => void;
  onOpenAccountMenu: () => void;
  accountMenuOpen: boolean;
  favoritesCount: number;
}

const DISCOVERY_ITEMS = [
  { label: 'São Tomé', sub: 'Costa, roças e floresta', slideId: 0 },
  { label: 'Alojamentos e refúgios', sub: 'Estadias de arquitetura', slideId: 1 },
  { label: 'Ilha do Príncipe', sub: 'Reserva da Biosfera', slideId: 2 },
];

const NAV_COPY: Record<
  LanguageCode,
  {
    discover: string;
    destinos: string;
    voos: string;
    alojamento: string;
    explorar: string;
    comunidade: string;
    partner: string;
  }
> = {
  PT: {
    discover: 'Descobrir',
    destinos: 'Destinos',
    voos: 'Voos',
    alojamento: 'Alojamento',
    explorar: 'Explorar',
    comunidade: 'Comunidade',
    partner: 'Torne-se parceiro',
  },
  EN: {
    discover: 'Discover',
    destinos: 'Destinations',
    voos: 'Flights',
    alojamento: 'Stays',
    explorar: 'Explore',
    comunidade: 'Community',
    partner: 'Become a partner',
  },
  FR: {
    discover: 'Découvrir',
    destinos: 'Destinations',
    voos: 'Vols',
    alojamento: 'Séjours',
    explorar: 'Explorer',
    comunidade: 'Communauté',
    partner: 'Devenir partenaire',
  },
};

export function Navbar({
  scrolled,
  forceSolid = false,
  language,
  onLanguageChange,
  onSelectSlide,
  onNavigateSection,
  onOpenPartnerDrawer,
  onOpenAccountMenu,
  accountMenuOpen,
  favoritesCount,
}: NavbarProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const discoverRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  const isSolid = scrolled || forceSolid;
  const copy = NAV_COPY[language];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (discoverRef.current && !discoverRef.current.contains(target)) {
        setDiscoverOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[74px] flex items-center justify-between transition-all duration-500"
      style={{
        paddingLeft: 'clamp(20px, 9.5vw, 170px)',
        paddingRight: 'clamp(20px, 9.5vw, 170px)',
        backgroundColor: isSolid ? 'rgba(247, 217, 198, 0.86)' : 'rgba(247, 217, 198, 0)',
        backdropFilter: isSolid ? 'blur(14px)' : 'blur(0px)',
        WebkitBackdropFilter: isSolid ? 'blur(14px)' : 'blur(0px)',
        borderBottom: isSolid
          ? '1px solid rgba(29, 26, 28, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.22)',
        color: isSolid ? '#1d1a1c' : '#ffffff',
        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
      }}
    >
      {/* Left: Wordmark + vertical divider + Destination discovery selector */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0 shrink-0">
        <a
          href="#topo"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('topo');
          }}
          className="font-sans-eden font-light tracking-[-0.015em] whitespace-nowrap shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419] rounded-sm"
          style={{ fontSize: 'clamp(21px, 2.2vw, 26px)' }}
        >
          Rotas do Éden
        </a>

        <span
          aria-hidden="true"
          className="hidden sm:block h-5 w-px transition-colors duration-500 shrink-0"
          style={{
            backgroundColor: isSolid ? 'rgba(29, 26, 28, 0.22)' : 'rgba(255, 255, 255, 0.35)',
          }}
        />

        <div ref={discoverRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setDiscoverOpen((v) => !v);
              setLangOpen(false);
            }}
            aria-expanded={discoverOpen}
            className="flex items-center gap-1.5 text-[14px] font-medium tracking-[0.01em] whitespace-nowrap py-2 px-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419] rounded-sm"
          >
            <span>{copy.discover}</span>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-300"
              style={{ transform: discoverOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {discoverOpen && (
            <div
              className="absolute top-[calc(100%+12px)] left-0 w-72 rounded-2xl bg-[#fdf7f2]/96 backdrop-blur-xl text-[#1d1a1c] shadow-[0_24px_60px_rgba(45,26,20,0.18)] border border-[#1d1a1c]/8 p-2 z-50"
            >
              {DISCOVERY_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setDiscoverOpen(false);
                    onSelectSlide(item.slideId);
                    onNavigateSection('topo');
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#f7d9c6]/55 transition-colors flex flex-col gap-0.5"
                >
                  <span className="text-[14px] font-semibold text-[#1d1a1c]">{item.label}</span>
                  <span className="text-[12px] text-[#5c5156]">{item.sub}</span>
                </button>
              ))}
              <div className="my-1.5 h-px bg-[#1d1a1c]/8" />
              <button
                type="button"
                onClick={() => {
                  setDiscoverOpen(false);
                  onNavigateSection('destinos');
                }}
                className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#f7d9c6]/45 transition-colors text-[13px] font-medium text-[#f39419]"
              >
                Ver todos os destinos →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Primary navigation links with animated underline wipes */}
      <nav
        aria-label="Navegação principal"
        className="hidden lg:flex items-center gap-7 xl:gap-9 text-[14.5px] font-medium tracking-[0.01em]"
      >
        <a
          href="#destinos"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('destinos');
          }}
          className="eden-nav-link whitespace-nowrap shrink-0 py-1"
        >
          {copy.destinos}
        </a>
        <a
          href="#pesquisa"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('topo', 'voos');
          }}
          className="eden-nav-link whitespace-nowrap shrink-0 py-1"
        >
          {copy.voos}
        </a>
        <a
          href="#alojamento"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('alojamento', 'alojamento');
          }}
          className="eden-nav-link whitespace-nowrap shrink-0 py-1"
        >
          {copy.alojamento}
        </a>
        <a
          href="#experiencias"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('experiencias', 'experiencias');
          }}
          className="eden-nav-link whitespace-nowrap shrink-0 py-1"
        >
          {copy.explorar}
        </a>
        <a
          href="#comunidade"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('comunidade');
          }}
          className="eden-nav-link whitespace-nowrap shrink-0 py-1"
        >
          {copy.comunidade}
        </a>
      </nav>

      {/* Right: Torne-se parceiro + Globe/language + Animated account/menu button */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <button
          type="button"
          onClick={onOpenPartnerDrawer}
          className="hidden md:inline-flex items-center text-[14px] font-medium whitespace-nowrap shrink-0 eden-nav-link py-1"
        >
          {copy.partner}
        </button>

        {/* Globe / Language selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setLangOpen((v) => !v);
              setDiscoverOpen(false);
            }}
            aria-label="Selecionar idioma"
            aria-expanded={langOpen}
            className="w-10 h-10 rounded-full flex items-center justify-center gap-1 transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419]"
          >
            <Globe className="w-[18px] h-[18px]" strokeWidth={1.7} />
            <span className="hidden xl:inline text-[12px] font-semibold tracking-wider">
              {language}
            </span>
          </button>

          {langOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-36 rounded-2xl bg-[#fdf7f2]/96 backdrop-blur-xl text-[#1d1a1c] shadow-[0_20px_50px_rgba(45,26,20,0.18)] border border-[#1d1a1c]/8 p-1.5 z-50">
              {(['PT', 'EN', 'FR'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium flex items-center justify-between transition-colors ${
                    language === code
                      ? 'bg-[#f7d9c6] text-[#1d1a1c] font-semibold'
                      : 'hover:bg-[#f7d9c6]/45 text-[#5c5156]'
                  }`}
                >
                  <span>
                    {code === 'PT' ? 'Português' : code === 'EN' ? 'English' : 'Français'}
                  </span>
                  <span className="text-[11px] opacity-70">{code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Animated Account / Menu button */}
        <button
          type="button"
          onClick={onOpenAccountMenu}
          aria-label={accountMenuOpen ? 'Fechar menu da conta' : 'Abrir menu e favoritos'}
          aria-expanded={accountMenuOpen}
          className="relative h-10 px-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419]"
          style={{
            border: isSolid
              ? '1px solid rgba(29, 26, 28, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.42)',
            backgroundColor: isSolid
              ? 'rgba(255, 255, 255, 0.55)'
              : 'rgba(255, 255, 255, 0.14)',
          }}
        >
          <span className="relative w-4 h-3 flex flex-col justify-between">
            <span
              className="block w-full h-[1.5px] rounded-full transition-transform duration-300 origin-center"
              style={{
                backgroundColor: 'currentColor',
                transform: accountMenuOpen ? 'translateY(5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-3 h-[1.5px] rounded-full transition-all duration-300 ml-auto"
              style={{
                backgroundColor: 'currentColor',
                opacity: accountMenuOpen ? 0 : 1,
                transform: accountMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
              }}
            />
            <span
              className="block w-full h-[1.5px] rounded-full transition-transform duration-300 origin-center"
              style={{
                backgroundColor: 'currentColor',
                transform: accountMenuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none',
              }}
            />
          </span>

          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums transition-colors duration-300"
            style={{
              backgroundColor: isSolid ? '#1d1a1c' : 'rgba(255,255,255,0.92)',
              color: isSolid ? '#fdf0e7' : '#1d1a1c',
            }}
          >
            {favoritesCount > 0 ? favoritesCount : 'É'}
          </span>
        </button>
      </div>
    </header>
  );
}
