import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Check, Compass, MapPin, Sparkles } from 'lucide-react';
import {
  COMMUNITY_STORIES,
  DESTINATIONS,
  EXPERIENCES,
  ROTAS_PACKAGES,
  RotasPackage,
  ServiceType,
} from '../data/rotasData';

interface BrandSectionsProps {
  onSelectHeroDestination: (slideId: number) => void;
  onExploreSearch: (destination: string, service: ServiceType) => void;
  onOpenPartnerDrawer: () => void;
}

export function BrandSections({
  onSelectHeroDestination,
  onExploreSearch,
  onOpenPartnerDrawer,
}: BrandSectionsProps) {
  const [activeDestIdx, setActiveDestIdx] = useState(0);
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>([]);
  const [activePkgId, setActivePkgId] = useState<string>(ROTAS_PACKAGES[1].id);
  const [communityEmail, setCommunityEmail] = useState('');
  const [communityJoined, setCommunityJoined] = useState(false);
  const [communityError, setCommunityError] = useState('');

  const activeDest = DESTINATIONS[activeDestIdx];
  const activeExp = EXPERIENCES[activeExpIdx];
  const activePkg: RotasPackage =
    ROTAS_PACKAGES.find((p) => p.id === activePkgId) ?? ROTAS_PACKAGES[0];

  const toggleExperience = (id: string) => {
    setSelectedExpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = communityEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setCommunityError('Por favor, introduza um endereço de email válido.');
      return;
    }
    setCommunityError('');
    setCommunityJoined(true);
    setCommunityEmail('');
  };

  const sectionPadding = {
    paddingLeft: 'clamp(20px, 9.5vw, 170px)',
    paddingRight: 'clamp(20px, 9.5vw, 170px)',
  };

  return (
    <div className="relative z-10">
      {/* 1. DESTINOS EXTRAORDINÁRIOS */}
      <section
        id="destinos"
        aria-labelledby="heading-destinos"
        className="py-20 sm:py-28 border-t border-[#1d1a1c]/8"
        style={sectionPadding}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.15fr] gap-10 xl:gap-16 items-stretch">
          {/* Left editorial selector */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#5c5156] mb-2">
                De São Tomé e Príncipe para o Mundo
              </p>
              <h2
                id="heading-destinos"
                className="font-editorial text-[#1d1a1c] leading-[1.08] mb-8"
                style={{ fontSize: 'clamp(34px, 4vw, 54px)' }}
              >
                Destinos extraordinários
              </h2>

              <div className="divide-y divide-[#1d1a1c]/12 border-y border-[#1d1a1c]/12">
                {DESTINATIONS.map((dest, idx) => {
                  const isActive = idx === activeDestIdx;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onMouseEnter={() => setActiveDestIdx(idx)}
                      onFocus={() => setActiveDestIdx(idx)}
                      onClick={() => setActiveDestIdx(idx)}
                      className="w-full text-left py-5 flex items-center justify-between gap-4 group transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-editorial text-[24px] sm:text-[28px] transition-colors duration-300 ${
                              isActive
                                ? 'text-[#1d1a1c]'
                                : 'text-[#8a7f83] group-hover:text-[#1d1a1c]'
                            }`}
                          >
                            {dest.name}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-[#5c5156] mt-0.5">
                          {dest.region} · {dest.coordinates}
                        </div>
                      </div>
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                          isActive
                            ? 'bg-[#1d1a1c] text-white rotate-0'
                            : 'bg-transparent text-[#8a7f83] -rotate-45 group-hover:text-[#1d1a1c]'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onExploreSearch(activeDest.searchQuery, 'alojamento')}
                className="px-6 py-3 rounded-full bg-[#1d1a1c] hover:bg-[#f39419] text-white text-[13.5px] font-semibold transition-colors duration-300"
              >
                Explorar estadias em {activeDest.name}
              </button>
              <button
                type="button"
                onClick={() => onSelectHeroDestination(activeDest.slideId)}
                className="px-5 py-3 rounded-full border border-[#1d1a1c]/20 hover:bg-white/60 text-[#1d1a1c] text-[13.5px] font-medium transition-colors"
              >
                Ver panorama no topo
              </button>
            </div>
          </div>

          {/* Right cinematic masked photographic stage */}
          <div className="relative rounded-[18px] overflow-hidden min-h-[380px] sm:min-h-[490px] bg-[#2a201d] shadow-[0_24px_60px_rgba(68,38,28,0.16)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDest.id}
                initial={{ opacity: 0.2, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2, scale: 1.03 }}
                transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={activeDest.image}
                  alt={`${activeDest.name} (imagem ilustrativa)`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20, 14, 15, 0.88) 0%, rgba(20, 14, 15, 0.32) 48%, rgba(20, 14, 15, 0.06) 100%)',
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-9 text-white">
              <div className="flex items-center justify-between text-[12px] tracking-[0.06em] uppercase text-white/80">
                <span>{activeDest.coordinates}</span>
                <span>{activeDest.bestFor}</span>
              </div>

              <div className="max-w-lg">
                <div className="font-editorial text-[26px] sm:text-[32px] leading-[1.15] mb-2.5">
                  {activeDest.tagline}
                </div>
                <p className="text-[14.5px] leading-[1.65] text-white/85">
                  {activeDest.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPERIÊNCIAS AUTÊNTICAS */}
      <section
        id="experiencias"
        aria-labelledby="heading-experiencias"
        className="py-20 sm:py-28 border-t border-[#1d1a1c]/8"
        style={sectionPadding}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#5c5156] mb-2">
              Ritmo Leve-Leve · Vivências Locais
            </p>
            <h2
              id="heading-experiencias"
              className="font-editorial text-[#1d1a1c] leading-[1.08]"
              style={{ fontSize: 'clamp(34px, 4vw, 54px)' }}
            >
              Experiências autênticas
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-[1.6] text-[#5c5156]">
            Cada encontro é desenhado com guias, produtores e navegadores das ilhas. Selecione experiências para montar uma simulação de roteiro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 xl:gap-14 items-start">
          {/* Interactive editorial experience rows */}
          <div className="divide-y divide-[#1d1a1c]/12 border-y border-[#1d1a1c]/12">
            {EXPERIENCES.map((exp, idx) => {
              const isFocused = idx === activeExpIdx;
              const isAdded = selectedExpIds.includes(exp.id);
              return (
                <div
                  key={exp.id}
                  onMouseEnter={() => setActiveExpIdx(idx)}
                  className={`py-6 transition-colors duration-300 ${
                    isFocused ? 'opacity-100' : 'opacity-78 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveExpIdx(idx)}
                      className="text-left flex items-start gap-4 sm:gap-6 flex-1"
                    >
                      <span className="font-editorial text-[20px] text-[#f39419] tabular-nums pt-0.5 shrink-0">
                        {exp.index}.
                      </span>
                      <div>
                        <h3 className="font-editorial text-[24px] sm:text-[28px] text-[#1d1a1c] leading-[1.15]">
                          {exp.title}
                        </h3>
                        <div className="text-[12.5px] text-[#8a7f83] mt-1">
                          {exp.island} · {exp.duration} · €{exp.demoPrice} (demo)
                        </div>
                        <p className="mt-2.5 text-[14.5px] leading-[1.6] text-[#5c5156] max-w-xl">
                          {exp.description}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExperience(exp.id)}
                      className={`mt-1 px-3.5 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-[#1d1a1c] text-white'
                          : 'border border-[#1d1a1c]/20 text-[#1d1a1c] hover:bg-white/70'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>No roteiro</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5" />
                          <span>Guardar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synchronized vertical editorial photo preview */}
          <div className="lg:sticky lg:top-[104px]">
            <div className="relative rounded-[16px] overflow-hidden aspect-[4/4.6] bg-[#2a201d] shadow-[0_22px_54px_rgba(68,38,28,0.16)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeExp.id}
                  src={activeExp.image}
                  alt={`${activeExp.title} (imagem ilustrativa)`}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0.25, scale: 1.07 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.25, scale: 1.02 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="text-[11.5px] uppercase tracking-[0.08em] text-[#f7d9c6] mb-1">
                  {activeExp.island}
                </div>
                <div className="font-editorial text-[24px] leading-tight">
                  {activeExp.title}
                </div>
              </div>
            </div>

            {selectedExpIds.length > 0 && (
              <div className="mt-4 rounded-2xl bg-white/75 border border-[#1d1a1c]/10 px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="text-[13px] text-[#1d1a1c]">
                  <span className="font-semibold tabular-nums">
                    {selectedExpIds.length}
                  </span>{' '}
                  {selectedExpIds.length === 1
                    ? 'experiência guardada no roteiro demonstrativo'
                    : 'experiências guardadas no roteiro demonstrativo'}
                </div>
                <button
                  type="button"
                  onClick={() => onExploreSearch('São Tomé', 'experiencias')}
                  className="text-[12.5px] font-semibold text-[#f39419] hover:underline whitespace-nowrap"
                >
                  Simular datas →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. PACOTES ROTAS */}
      <section
        id="pacotes"
        aria-labelledby="heading-pacotes"
        className="py-20 sm:py-28 border-t border-[#1d1a1c]/8"
        style={sectionPadding}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#5c5156] mb-2">
              Itinerários Curados · Simulação
            </p>
            <h2
              id="heading-pacotes"
              className="font-editorial text-[#1d1a1c] leading-[1.08]"
              style={{ fontSize: 'clamp(34px, 4vw, 54px)' }}
            >
              Pacotes Rotas
            </h2>
          </div>

          {/* Interactive 4-Package Segmented Selector */}
          <div
            role="tablist"
            aria-label="Escolher pacote Rotas"
            className="flex flex-wrap items-center gap-2"
          >
            {ROTAS_PACKAGES.map((pkg) => {
              const selected = pkg.id === activePkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActivePkgId(pkg.id)}
                  className={`px-4 py-2.5 rounded-full text-[13.5px] font-medium whitespace-nowrap transition-all duration-300 ${
                    selected
                      ? 'bg-[#1d1a1c] text-white shadow-sm'
                      : 'bg-white/65 text-[#5c5156] hover:bg-white hover:text-[#1d1a1c]'
                  }`}
                >
                  {pkg.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Package Editorial Spread */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePkg.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[24px] overflow-hidden bg-white/78 backdrop-blur-md border border-[#1d1a1c]/8 shadow-[0_24px_65px_rgba(88,52,40,0.1)] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]"
          >
            <div className="relative min-h-[290px] sm:min-h-[380px] overflow-hidden">
              <img
                src={activePkg.image}
                alt={`${activePkg.name} (imagem ilustrativa)`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-transparent"
              />
              <div className="absolute bottom-5 left-6 text-white">
                <div className="text-[12px] tracking-[0.08em] uppercase text-[#f7d9c6]">
                  {activePkg.rhythm}
                </div>
                <div className="font-editorial text-[32px] sm:text-[38px] leading-tight">
                  {activePkg.name}
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#5c5156] mb-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#1d1a1c]">
                    <Sparkles className="w-4 h-4 text-[#f39419]" />
                    {activePkg.duration}
                  </span>
                  <span className="font-semibold text-[#1d1a1c] tabular-nums">
                    {activePkg.demoPrice}
                  </span>
                </div>

                <h3 className="font-editorial text-[26px] sm:text-[32px] leading-[1.18] text-[#1d1a1c] mb-5">
                  {activePkg.subtitle}
                </h3>

                <ul className="space-y-3 mb-8">
                  {activePkg.includes.map((inc) => (
                    <li
                      key={inc}
                      className="flex items-start gap-3 text-[14.5px] text-[#5c5156]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#f7d9c6] text-[#1d1a1c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" strokeWidth={2.4} />
                      </span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#1d1a1c]/10">
                <button
                  type="button"
                  onClick={() => onExploreSearch(activePkg.name, 'pacotes')}
                  className="px-6 py-3 rounded-full bg-[#1d1a1c] hover:bg-[#f39419] text-white text-[13.5px] font-semibold transition-colors duration-300"
                >
                  Simular {activePkg.name}
                </button>
                <span className="text-[12px] text-[#8a7f83]">
                  Pré-preenche o pesquisador em modo Pacotes
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. ÉDEN COMMUNITY — "Descobre. Vive. Pertence." */}
      <section
        id="comunidade"
        aria-labelledby="heading-comunidade"
        className="py-20 sm:py-28 border-t border-[#1d1a1c]/8"
        style={sectionPadding}
      >
        <div className="rounded-[28px] overflow-hidden bg-[#1d1a1c] text-[#fdf0e7] p-7 sm:p-12 lg:p-16 shadow-[0_28px_75px_rgba(29,26,28,0.22)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-end mb-12">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#f7d9c6]/80 mb-3">
                Éden Community · Protótipo Editorial
              </p>
              <h2
                id="heading-comunidade"
                className="font-editorial text-white leading-[1.05] tracking-[-0.01em]"
                style={{ fontSize: 'clamp(38px, 5vw, 68px)' }}
              >
                Descobre. Vive. Pertence.
              </h2>
            </div>

            <div className="space-y-5">
              <p className="text-[15.5px] leading-[1.7] text-[#fdf0e7]/80">
                Mais do que reservar um destino, a comunidade Rotas do Éden reúne viajantes, anfitriões e criadores que partilham histórias vivas entre São Tomé, o Príncipe e o Atlântico.
              </p>

              {/* Local Demonstration Invite Form */}
              <form
                onSubmit={handleCommunitySubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <label htmlFor="eden-community-email" className="sr-only">
                  O seu email para convite demonstrativo
                </label>
                <input
                  id="eden-community-email"
                  type="email"
                  value={communityEmail}
                  onChange={(e) => {
                    setCommunityEmail(e.target.value);
                    setCommunityError('');
                  }}
                  placeholder="O seu email para o círculo Éden"
                  className="flex-1 h-12 px-5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/55 text-[14px] focus:outline-none focus:border-[#f7d9c6]"
                />
                <button
                  type="submit"
                  className="h-12 px-6 rounded-full bg-[#f39419] hover:bg-[#f7d9c6] text-[#1d1a1c] font-semibold text-[14px] whitespace-nowrap transition-colors duration-300"
                >
                  Pedir convite
                </button>
              </form>

              {communityError && (
                <p className="text-[12.5px] text-[#ff8691]">{communityError}</p>
              )}
              {communityJoined && (
                <p className="text-[13px] text-[#f7d9c6]">
                  Registo demonstrativo recebido localmente. Bem-vindo ao espírito Éden.
                </p>
              )}
            </div>
          </div>

          {/* 3 Editorial Community Chapters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMUNITY_STORIES.map((story) => (
              <article
                key={story.id}
                className="group rounded-[16px] overflow-hidden bg-white/[0.05] border border-white/10 flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={story.image}
                    alt={`${story.title} (imagem ilustrativa)`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.08em] text-[#f7d9c6]/80 mb-2">
                      {story.chapter}
                    </div>
                    <h3 className="font-editorial text-[22px] leading-[1.2] text-white mb-2.5">
                      {story.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.6] text-white/72">
                      {story.excerpt}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[12px] text-white/65">
                    <span>{story.author}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#f7d9c6]" />
                      {story.place}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* QUIET EDITORIAL FOOTER */}
      <footer
        className="pt-14 pb-16 border-t border-[#1d1a1c]/10 text-[#5c5156]"
        style={sectionPadding}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10">
          <div>
            <div className="font-sans-eden font-light text-[26px] text-[#1d1a1c] tracking-[-0.015em]">
              Rotas do Éden
            </div>
            <p className="mt-1.5 text-[13.5px] text-[#5c5156] max-w-md">
              Marca internacional de viagens originária de São Tomé e Príncipe. Protótipo interativo de Motion Design com demonstrações locais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13.5px] font-medium text-[#1d1a1c]">
            <a href="#alojamento" className="eden-nav-link py-1">
              Estadias
            </a>
            <a href="#destinos" className="eden-nav-link py-1">
              Destinos
            </a>
            <a href="#experiencias" className="eden-nav-link py-1">
              Experiências
            </a>
            <a href="#pacotes" className="eden-nav-link py-1">
              Pacotes Rotas
            </a>
            <button
              type="button"
              onClick={onOpenPartnerDrawer}
              className="eden-nav-link py-1"
            >
              Torne-se parceiro
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1d1a1c]/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-[#8a7f83]">
          <span>© {new Date().getFullYear()} Rotas do Éden · São Tomé e Príncipe</span>
          <span>
            Protótipo visual independente · Imagens ilustrativas e simulações locais
          </span>
        </div>
      </footer>
    </div>
  );
}
