import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, MapPin, X } from 'lucide-react';
import { ACCOMMODATIONS, AccommodationItem, ServiceType } from '../data/rotasData';

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenAccommodation: (item: AccommodationItem) => void;
  onNavigateSection: (sectionId: string, service?: ServiceType) => void;
  onOpenPartnerDrawer: () => void;
}

export function AccountDrawer({
  open,
  onClose,
  favorites,
  onToggleFavorite,
  onOpenAccommodation,
  onNavigateSection,
  onOpenPartnerDrawer,
}: AccountDrawerProps) {
  const favoriteItems = ACCOMMODATIONS.filter((a) => favorites.includes(a.id));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="account-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#1d1a1c]/42 backdrop-blur-xs"
          />
          <motion.aside
            key="account-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu e favoritos guardados"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.48, ease: [0.65, 0, 0.35, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-[#fdf4ec] text-[#1d1a1c] shadow-[-20px_0_60px_rgba(29,26,28,0.2)] flex flex-col"
          >
            <div className="h-[74px] px-6 border-b border-[#1d1a1c]/10 flex items-center justify-between">
              <div>
                <div className="font-sans-eden font-light text-[22px] text-[#1d1a1c]">
                  Rotas do Éden
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar painel"
                className="w-10 h-10 rounded-full hover:bg-[#f7d9c6]/60 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 space-y-8">
              {/* Mobile / Quick Navigation */}
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a7f83] mb-3">
                  Explorar experiência
                </div>
                <div className="flex flex-col divide-y divide-[#1d1a1c]/10 border-y border-[#1d1a1c]/10">
                  {[
                    { label: 'Destinos', id: 'destinos' },
                    { label: 'Voos', id: 'topo', service: 'voos' as ServiceType },
                    { label: 'Alojamento', id: 'alojamento', service: 'alojamento' as ServiceType },
                    { label: 'Experiências', id: 'experiencias', service: 'experiencias' as ServiceType },
                    { label: 'Pacotes Rotas', id: 'pacotes', service: 'pacotes' as ServiceType },
                    { label: 'Comunidade', id: 'comunidade' },
                  ].map((nav) => (
                    <button
                      key={nav.label}
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateSection(nav.id, nav.service);
                      }}
                      className="py-3.5 text-left flex items-center justify-between text-[16px] font-medium text-[#1d1a1c] hover:text-[#f39419] transition-colors"
                    >
                      <span>{nav.label}</span>
                      <ArrowRight className="w-4 h-4 opacity-55" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Local Favourites */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a7f83]">
                    Estadias guardadas ({favoriteItems.length})
                  </div>
                </div>

                {favoriteItems.length === 0 ? (
                  <div className="rounded-2xl bg-white/75 border border-[#1d1a1c]/8 p-5 text-[13.5px] text-[#5c5156] leading-relaxed">
                    Ainda não guardou nenhuma estadia. Toque no coração nos cartões de alojamento para criar a sua seleção local.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteItems.map((stay) => (
                      <div
                        key={stay.id}
                        className="rounded-2xl bg-white/85 border border-[#1d1a1c]/8 p-3 flex items-center gap-3.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAccommodation(stay);
                          }}
                          className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                        >
                          <img
                            src={stay.image}
                            alt={stay.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAccommodation(stay);
                          }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="font-editorial text-[18px] text-[#1d1a1c] truncate">
                            {stay.title}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-[#5c5156] truncate">
                            <MapPin className="w-3 h-3 text-[#f39419] shrink-0" />
                            <span className="truncate">{stay.location}</span>
                          </div>
                          <div className="text-[12.5px] font-semibold text-[#1d1a1c] mt-0.5 tabular-nums">
                            €{stay.demoPricePerNight} / noite · demo
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(stay.id)}
                          aria-label={`Remover ${stay.title} dos favoritos`}
                          className="w-9 h-9 rounded-full hover:bg-[#f7d9c6]/50 flex items-center justify-center shrink-0"
                        >
                          <Heart
                            className="w-4 h-4"
                            stroke="#ff4d5e"
                            fill="#ff4d5e"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#1d1a1c]/10 bg-[#f7d9c6]/45">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPartnerDrawer();
                }}
                className="w-full py-3 rounded-full bg-[#1d1a1c] hover:bg-[#f39419] text-white text-[13.5px] font-semibold transition-colors"
              >
                Torne-se parceiro Rotas do Éden
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface PartnerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function PartnerDrawer({ open, onClose }: PartnerDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Alojamento ou Eco-Lodge');
  const [island, setIsland] = useState('São Tomé');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Indique o nome do projeto e um email válido.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="partner-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#1d1a1c]/45 backdrop-blur-xs"
          />
          <motion.aside
            key="partner-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Torne-se parceiro Rotas do Éden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.48, ease: [0.65, 0, 0.35, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[460px] bg-[#fdf4ec] text-[#1d1a1c] shadow-[-20px_0_60px_rgba(29,26,28,0.22)] flex flex-col"
          >
            <div className="h-[74px] px-6 border-b border-[#1d1a1c]/10 flex items-center justify-between">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5c5156]">
                Parcerias · Demonstração
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar painel de parceiros"
                className="w-10 h-10 rounded-full hover:bg-[#f7d9c6]/60 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <h2 className="font-editorial text-[34px] leading-[1.1] text-[#1d1a1c] mb-3">
                Torne-se parceiro
              </h2>
              <p className="text-[14.5px] leading-[1.65] text-[#5c5156] mb-7">
                Colaboramos com refúgios independentes, roças históricas, guias naturalistas e operadores marítimos em São Tomé, Príncipe e rotas atlânticas.
              </p>

              {submitted ? (
                <div className="rounded-2xl bg-white/85 border border-[#f39419]/35 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#f7d9c6] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#1d1a1c]" />
                  </div>
                  <h3 className="font-editorial text-[24px] text-[#1d1a1c]">
                    Manifestação de interesse simulada
                  </h3>
                  <p className="text-[14px] text-[#5c5156] leading-relaxed">
                    Obrigado, <strong className="text-[#1d1a1c]">{name}</strong>. Este formulário é uma demonstração local e não envia dados para servidores externos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                    }}
                    className="text-[13px] font-semibold text-[#f39419] hover:underline"
                  >
                    Fazer nova simulação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="partner-name"
                      className="block text-[12px] font-semibold text-[#5c5156] mb-1.5"
                    >
                      Nome do alojamento ou projeto
                    </label>
                    <input
                      id="partner-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Casa das Palmeiras"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-[#1d1a1c]/15 text-[14px] focus:outline-none focus:border-[#f39419]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="partner-email"
                      className="block text-[12px] font-semibold text-[#5c5156] mb-1.5"
                    >
                      Email de contacto
                    </label>
                    <input
                      id="partner-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@projeto.st"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-[#1d1a1c]/15 text-[14px] focus:outline-none focus:border-[#f39419]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="partner-category"
                        className="block text-[12px] font-semibold text-[#5c5156] mb-1.5"
                      >
                        Categoria
                      </label>
                      <select
                        id="partner-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1d1a1c]/15 text-[14px] focus:outline-none focus:border-[#f39419]"
                      >
                        <option>Alojamento ou Eco-Lodge</option>
                        <option>Experiências & Guias</option>
                        <option>Navegação & Transportes</option>
                        <option>Gastronomia & Roças</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="partner-island"
                        className="block text-[12px] font-semibold text-[#5c5156] mb-1.5"
                      >
                        Localização
                      </label>
                      <select
                        id="partner-island"
                        value={island}
                        onChange={(e) => setIsland(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1d1a1c]/15 text-[14px] focus:outline-none focus:border-[#f39419]"
                      >
                        <option>São Tomé</option>
                        <option>Ilha do Príncipe</option>
                        <option>Outra rota atlântica</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <p className="text-[12.5px] text-[#ff4d5e] font-medium">{error}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 rounded-full bg-[#1d1a1c] hover:bg-[#f39419] text-white text-[14px] font-semibold transition-colors duration-300"
                  >
                    Enviar proposta demonstrativa
                  </button>
                </form>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
