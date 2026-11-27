export type ServiceType =
  | 'alojamento'
  | 'voos'
  | 'pacotes'
  | 'experiencias'
  | 'transportes';

export type LanguageCode = 'PT' | 'EN' | 'FR';

export interface HeroSlide {
  id: number;
  railIndex: number; // 0 = top, 1 = middle, 2 = bottom
  titleWords: string[];
  railLabel: string;
  captionTitle: string;
  captionBody: string;
  image: string;
  thumbImage: string;
  imageAlt: string;
  locationTag: string;
  illustrativeNote: string;
}

export interface AccommodationItem {
  id: string;
  title: string;
  categoryLabel: string;
  location: string;
  island: 'São Tomé' | 'Ilha do Príncipe' | 'Sul de São Tomé' | 'Atlântico';
  demoPricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  areaSqm: number;
  image: string;
  gallery: string[];
  summary: string;
  description: string[];
  amenities: string[];
  highlights: string[];
  similarIds: string[];
}

export interface DestinationHighlight {
  id: string;
  name: string;
  region: string;
  coordinates: string;
  slideId: number;
  tagline: string;
  description: string;
  image: string;
  bestFor: string;
  searchQuery: string;
}

export interface ExperienceItem {
  id: string;
  index: string;
  title: string;
  island: string;
  duration: string;
  demoPrice: number;
  description: string;
  image: string;
}

export interface RotasPackage {
  id: string;
  name: 'Rotas Essencial' | 'Rotas Explorar' | 'Rotas Imersão' | 'Rotas À Medida';
  duration: string;
  subtitle: string;
  demoPrice: string;
  image: string;
  includes: string[];
  rhythm: string;
}

export interface CommunityStory {
  id: string;
  chapter: string;
  title: string;
  author: string;
  place: string;
  excerpt: string;
  image: string;
}

export const CLOUD_TEXTURE_PRIMARY =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_6590354a-216c-40a2-9f84-93abe97dc7b1.png&w=2400&q=85';

export const CLOUD_TEXTURE_FALLBACK =
  '/src/assets/images/cloud_mist_texture_1795737873868.jpg';

export const IMAGES = {
  heroCoast: '/src/assets/images/hero_saotome_coast_1795737870853.jpg',
  heroRetreat: '/src/assets/images/hero_tropical_retreat_1795737873112.jpg',
  heroPeaks: '/src/assets/images/hero_rainforest_peaks_1795737873498.jpg',
  stayBungalow: '/src/assets/images/stay_bungalow_praia_1795737876698.jpg',
  stayRoca: '/src/assets/images/stay_roca_historica_1795737876828.jpg',
  stayVila: '/src/assets/images/stay_vila_floresta_1795737877787.jpg',
  stayRefugio: '/src/assets/images/stay_refugio_ilha_1795737878543.jpg',
  stayCacau: '/src/assets/images/stay_casa_cacau_1795737879816.jpg',
  stayPavilhao: '/src/assets/images/stay_pavilhao_atlantico_1795737880571.jpg',
  stayTenda: '/src/assets/images/stay_tenda_biosfera_1795737881387.jpg',
  stayMontanha: '/src/assets/images/stay_retiro_montanha_1795737883022.jpg',
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    railIndex: 2, // Bottom thumbnail: São Tomé
    titleWords: ['DESCUBRA', 'O', 'ÉDEN'],
    railLabel: 'São Tomé',
    captionTitle: 'Descubra São Tomé',
    captionBody:
      'Explore paisagens extraordinárias, praias tropicais e experiências autênticas no coração do Atlântico.',
    image: IMAGES.heroCoast,
    thumbImage: IMAGES.heroCoast,
    imageAlt:
      'Paisagem costeira tropical vulcânica banhada por luz dourada no Atlântico (imagem ilustrativa)',
    locationTag: 'São Tomé · Equador Atlântico',
    illustrativeNote: 'Imagem ilustrativa da atmosfera costeira atlântica',
  },
  {
    id: 1,
    railIndex: 1, // Middle thumbnail: Alojamentos e refúgios
    titleWords: ['O', 'SEU', 'REFÚGIO'],
    railLabel: 'Alojamentos e refúgios',
    captionTitle: 'Encontre o seu refúgio',
    captionBody:
      'Descubra estadias especiais, retiros de natureza e lugares que transformam cada viagem.',
    image: IMAGES.heroRetreat,
    thumbImage: IMAGES.heroRetreat,
    imageAlt:
      'Retiro arquitetónico tropical integrado na floresta costeira ao pôr do sol (imagem ilustrativa)',
    locationTag: 'Arquitetura & Natureza',
    illustrativeNote: 'Imagem ilustrativa de categoria de alojamento',
  },
  {
    id: 2,
    railIndex: 0, // Top thumbnail: Ilha do Príncipe
    titleWords: ['EXPLORE', 'O', 'MUNDO'],
    railLabel: 'Ilha do Príncipe',
    captionTitle: 'Explore novos horizontes',
    captionBody:
      'Descubra o Príncipe e outros destinos extraordinários através de experiências inesquecíveis.',
    image: IMAGES.heroPeaks,
    thumbImage: IMAGES.heroPeaks,
    imageAlt:
      'Picos vulcânicos cobertos de floresta equatorial entre névoas douradas ao nascer do sol (imagem ilustrativa)',
    locationTag: 'Ilha do Príncipe · Reserva da Biosfera',
    illustrativeNote: 'Imagem ilustrativa da paisagem equatorial',
  },
];

// Ordered top-to-bottom for the right-side vertical destination rail
export const RAIL_ITEMS = [
  HERO_SLIDES[2], // Top: Ilha do Príncipe (slide 2)
  HERO_SLIDES[1], // Middle: Alojamentos e refúgios (slide 1)
  HERO_SLIDES[0], // Bottom: São Tomé (slide 0)
];

export const ACCOMMODATIONS: AccommodationItem[] = [
  {
    id: 'bungalow-praia-sul',
    title: 'Bungalow Frente-Mar',
    categoryLabel: 'Categoria demonstrativa · Praia',
    location: 'Costa Sul, São Tomé',
    island: 'Sul de São Tomé',
    demoPricePerNight: 215,
    maxGuests: 4,
    bedrooms: 2,
    areaSqm: 78,
    image: IMAGES.stayBungalow,
    gallery: [IMAGES.stayBungalow, IMAGES.heroCoast, IMAGES.stayRefugio],
    summary:
      'Arquitetura ligeira em madeira local e colmo natural aberta diretamente sobre uma baía de areia dourada.',
    description: [
      'Esta categoria demonstrativa ilustra estadias costeiras de baixa densidade onde a brisa do Atlântico atravessa portadas de madeira trabalhada e cortinas de linho natural.',
      'Pensada para dias sem pressa entre mergulhos matinais, caminhadas pela orla de coqueiros e entardeceres tranquilos com o som das ondas.',
    ],
    amenities: [
      'Acesso direto à praia',
      'Terraço privativo sombreado',
      'Ventilação natural cruzada',
      'Pequeno-almoço tropical local',
      'Transferes organizados localmente',
      'Wi-Fi nas áreas principais',
    ],
    highlights: [
      'Ideal para casais ou pequenas famílias em busca de ritmo sereno',
      'Materiais naturais e integração paisagística suave',
      'Proximidade a trilhos costeiros e pesca artesanal',
    ],
    similarIds: ['refugio-costeiro-volcanico', 'pavilhao-atlantico', 'tenda-biosfera'],
  },
  {
    id: 'roca-historica-cacau',
    title: 'Roça Histórica Restaurada',
    categoryLabel: 'Categoria demonstrativa · Património',
    location: 'Interior Verde, São Tomé',
    island: 'São Tomé',
    demoPricePerNight: 185,
    maxGuests: 6,
    bedrooms: 3,
    areaSqm: 140,
    image: IMAGES.stayRoca,
    gallery: [IMAGES.stayRoca, IMAGES.stayCacau, IMAGES.heroPeaks],
    summary:
      'Casa-grande de varandas amplas e arcos de pedra rodeada por plantações de cacau fino e névoa de montanha.',
    description: [
      'Categoria demonstrativa dedicada ao património arquitetónico das antigas roças são-tomenses, reabilitadas com respeito pela memória local e conforto contemporâneo.',
      'Acorde com o aroma da torrefação artesanal de café e cacau, rodeado por jardins tropicais exuberantes e vistas serenas sobre os vales vulcânicos.',
    ],
    amenities: [
      'Varanda panorâmica histórica',
      'Degustação de cacau e café',
      'Cozinha de inspiração local',
      'Biblioteca e sala de estar ampla',
      'Percursos botânicos guiados',
      'Estacionamento privativo',
    ],
    highlights: [
      'Imersão cultural na história viva do arquipélago',
      'Clima fresco de altitude rodeado por floresta',
      'Gastronomia sazonal com ingredientes da própria terra',
    ],
    similarIds: ['casa-artesanal-cacau', 'retiro-encosta-nevoa', 'vila-copa-floresta'],
  },
  {
    id: 'vila-copa-floresta',
    title: 'Vila na Copa da Floresta',
    categoryLabel: 'Categoria demonstrativa · Natureza',
    location: 'Reserva da Biosfera, Ilha do Príncipe',
    island: 'Ilha do Príncipe',
    demoPricePerNight: 340,
    maxGuests: 2,
    bedrooms: 1,
    areaSqm: 96,
    image: IMAGES.stayVila,
    gallery: [IMAGES.stayVila, IMAGES.heroRetreat, IMAGES.stayTenda],
    summary:
      'Santuário suspenso em madeira nobre e vidro entre fetos gigantes, com tanque de pedra natural sobre o dossel.',
    description: [
      'Uma tipologia demonstrativa de retiro contemporâneo elevado sobre pilares discretos para preservar integralmente o solo da floresta equatorial.',
      'As manhãs começam com o canto das aves endémicas e a névoa dourada a dissipar-se lentamente sobre o vale verdejante.',
    ],
    amenities: [
      'Tanque privativo de água natural',
      'Deck panorâmico na floresta',
      'Energia solar integrada',
      'Guia de observação de aves',
      'Serviço de quarto discreto',
      'Amenidades botânicas artesanais',
    ],
    highlights: [
      'Privacidade absoluta em plena Reserva da Biosfera UNESCO',
      'Arquitetura de baixo impacto ecológico',
      'Acesso privilegiado a trilhos de floresta primária',
    ],
    similarIds: ['tenda-biosfera', 'retiro-encosta-nevoa', 'refugio-costeiro-volcanico'],
  },
  {
    id: 'refugio-costeiro-volcanico',
    title: 'Refúgio em Falésia Basáltica',
    categoryLabel: 'Categoria demonstrativa · Eco-Villa',
    location: 'Enseada Norte, Ilha do Príncipe',
    island: 'Ilha do Príncipe',
    demoPricePerNight: 295,
    maxGuests: 4,
    bedrooms: 2,
    areaSqm: 112,
    image: IMAGES.stayRefugio,
    gallery: [IMAGES.stayRefugio, IMAGES.heroCoast, IMAGES.stayPavilhao],
    summary:
      'Eco-villa esculpida em pedra vulcânica sobre uma enseada esmeralda, desenhada para contemplar o pôr do sol.',
    description: [
      'Categoria demonstrativa inspirada nos promontórios basálticos do arquipélago, combinando pedra bruta local, madeira de teca e grandes vãos sobre o mar calmo.',
      'Um ponto de partida sereno para passeios de barco ao amanhecer, snorkeling em águas límpidas e serões sob o céu estrelado do Equador.',
    ],
    amenities: [
      'Terraço de pedra sobre o mar',
      'Acesso a cais de pequena enseada',
      'Duche exterior em basalto',
      'Equipamento de snorkeling',
      'Pequeno-almoço servido no terraço',
      'Concierge de rotas marítimas',
    ],
    highlights: [
      'Vistas ininterruptas sobre o oceano e falésias tropicais',
      'Luz de entardecer em tons âmbar e pêssego',
      'Ambiente intimista e silencioso',
    ],
    similarIds: ['pavilhao-atlantico', 'bungalow-praia-sul', 'vila-copa-floresta'],
  },
  {
    id: 'casa-artesanal-cacau',
    title: 'Casa Pátio de Cacau',
    categoryLabel: 'Categoria demonstrativa · Boutique',
    location: 'Cidade de São Tomé & Arredores',
    island: 'São Tomé',
    demoPricePerNight: 155,
    maxGuests: 4,
    bedrooms: 2,
    areaSqm: 88,
    image: IMAGES.stayCacau,
    gallery: [IMAGES.stayCacau, IMAGES.stayRoca, IMAGES.stayBungalow],
    summary:
      'Residência boutique em ocre e terracota com pátio botânico privado, portas entalhadas e luz filtrada.',
    description: [
      'Categoria demonstrativa de alojamento urbano-botânico para quem deseja descobrir mercados locais, ateliers de chocolate artesanal e a vida cultural da ilha.',
      'O pátio interior protegido por palmeiras e bananeiras cria um refúgio fresco após dias de exploração pela ilha.',
    ],
    amenities: [
      'Pátio interior ajardinado',
      'Curadoria cultural e gastronómica',
      'Climatização silenciosa',
      'Pequeno-almoço com fruta da época',
      'Espaço de leitura e trabalho',
      'Apoio a reservas de transporte local',
    ],
    highlights: [
      'Base versátil para combinar cidade, cultura e praias próximas',
      'Design artesanal com madeiras e cerâmicas quentes',
      'Hospitalidade próxima e personalizada',
    ],
    similarIds: ['roca-historica-cacau', 'bungalow-praia-sul', 'retiro-encosta-nevoa'],
  },
  {
    id: 'pavilhao-atlantico',
    title: 'Pavilhão Horizonte Atlântico',
    categoryLabel: 'Categoria demonstrativa · Design',
    location: 'Ponta Costeira, São Tomé',
    island: 'Atlântico',
    demoPricePerNight: 365,
    maxGuests: 2,
    bedrooms: 1,
    areaSqm: 124,
    image: IMAGES.stayPavilhao,
    gallery: [IMAGES.stayPavilhao, IMAGES.heroRetreat, IMAGES.stayRefugio],
    summary:
      'Linhas minimalistas em pedra escura e madeira quente com espelho de água infinito fundido com o crepúsculo.',
    description: [
      'Categoria demonstrativa de arquitetura contemporânea atlântica, concebida em torno do silêncio, do horizonte aberto e dos reflexos do crepúsculo sobre a água.',
      'Ideal para celebrações íntimas ou pausas criativas onde a paisagem assume o papel principal a cada hora do dia.',
    ],
    amenities: [
      'Piscina infinita em pedra escura',
      'Salão panorâmico de vidro',
      'Adega e menu de degustação',
      'Spa privativo sob pedido',
      'Traslado privado incluído na simulação',
      'Som ambiente integrado',
    ],
    highlights: [
      'Arquitetura depurada com enquadramento cinematográfico',
      'Transição contínua entre interior e terraço marítimo',
      'Privacidade desenhada ao detalhe',
    ],
    similarIds: ['refugio-costeiro-volcanico', 'vila-copa-floresta', 'bungalow-praia-sul'],
  },
  {
    id: 'tenda-biosfera',
    title: 'Tenda Lodge da Biosfera',
    categoryLabel: 'Categoria demonstrativa · Glamping',
    location: 'Orla Verde, Ilha do Príncipe',
    island: 'Ilha do Príncipe',
    demoPricePerNight: 245,
    maxGuests: 2,
    bedrooms: 1,
    areaSqm: 64,
    image: IMAGES.stayTenda,
    gallery: [IMAGES.stayTenda, IMAGES.stayVila, IMAGES.heroPeaks],
    summary:
      'Plataforma elevada em madeira entre fetos arbóreos com lona respirável, lanternas quentes e vista de costa.',
    description: [
      'Categoria demonstrativa de eco-glamping confortável para sentir a pulsação da floresta húmida e da brisa costeira sem abdicar de cama ampla e banho quente.',
      'Ao anoitecer, as lanternas no passadiço de madeira criam uma atmosfera acolhedora entre a selva e o Atlântico.',
    ],
    amenities: [
      'Deck elevado em madeira certificada',
      'Casa de banho privativa integrada',
      'Iluminação solar quente',
      'Trilhos guiados pela biosfera',
      'Cesto matinal de produtos locais',
      'Observação noturna de estrelas',
    ],
    highlights: [
      'Proximidade sensorial máxima com a biodiversidade do Príncipe',
      'Construção reversível de pegada mínima',
      'Atmosfera inesquecível ao cair da noite',
    ],
    similarIds: ['vila-copa-floresta', 'retiro-encosta-nevoa', 'bungalow-praia-sul'],
  },
  {
    id: 'retiro-encosta-nevoa',
    title: 'Retiro Encosta das Nuvens',
    categoryLabel: 'Categoria demonstrativa · Montanha',
    location: 'Terras Altas, São Tomé',
    island: 'São Tomé',
    demoPricePerNight: 195,
    maxGuests: 3,
    bedrooms: 1,
    areaSqm: 72,
    image: IMAGES.stayMontanha,
    gallery: [IMAGES.stayMontanha, IMAGES.heroPeaks, IMAGES.stayRoca],
    summary:
      'Chalé em cedro e pedra sobre vales equatoriais cobertos de névoa matinal, perfeito para contemplação.',
    description: [
      'Categoria demonstrativa nas terras altas de São Tomé, onde as nuvens deslizam lentamente abaixo da varanda ao nascer do sol.',
      'Um refúgio fresco e poético para caminhantes, fotógrafos de natureza e viajantes que procuram o lado montanhoso e místico das ilhas.',
    ],
    amenities: [
      'Varanda voltada ao nascer do sol',
      'Café de altitude colhido na região',
      'Lareira exterior para noites frescas',
      'Mapas de trilhos do Parque Obô',
      'Cozinha de montanha sazonal',
      'Guia local opcional',
    ],
    highlights: [
      'Acordar literalmente acima do mar de nuvens tropicais',
      'Temperaturas amenas todo o ano',
      'Acesso direto a cascatas e miradouros vulcânicos',
    ],
    similarIds: ['roca-historica-cacau', 'vila-copa-floresta', 'casa-artesanal-cacau'],
  },
];

export const DESTINATIONS: DestinationHighlight[] = [
  {
    id: 'dest-sao-tome',
    name: 'São Tomé',
    region: 'Ilha Principal · Equador',
    coordinates: '0° 20′ N · 6° 43′ E',
    slideId: 0,
    tagline: 'Roças centenárias, praias douradas e o pulsar caloroso do leve-leve.',
    description:
      'Entre a floresta densa do Parque Natural Obô, baías resguardadas por palmeiras e a herança viva do cacau, São Tomé revela um ritmo raro no Atlântico.',
    image: IMAGES.heroCoast,
    bestFor: 'Cultura, praias e montanha',
    searchQuery: 'São Tomé',
  },
  {
    id: 'dest-principe',
    name: 'Ilha do Príncipe',
    region: 'Reserva Mundial da Biosfera UNESCO',
    coordinates: '1° 37′ N · 7° 23′ E',
    slideId: 2,
    tagline: 'Picos vulcânicos esculpidos na névoa e enseadas intocadas.',
    description:
      'Mais íntima e selvagem, a Ilha do Príncipe combina conservação ambiental exemplar com estadias silenciosas entre a floresta primária e o mar turquesa.',
    image: IMAGES.heroPeaks,
    bestFor: 'Biodiversidade e refúgios exclusivos',
    searchQuery: 'Ilha do Príncipe',
  },
  {
    id: 'dest-sul',
    name: 'Sul & Ilhéu das Rolas',
    region: 'Linha do Equador',
    coordinates: '0° 00′ N · 6° 31′ E',
    slideId: 1,
    tagline: 'Onde os dois hemisférios se encontram sobre areia clara e basalto.',
    description:
      'O sul da ilha abre-se em praias extensas, miradouros sobre o Pico Cão Grande e travessias marítimas curtas até ao marco geográfico do Equador.',
    image: IMAGES.stayBungalow,
    bestFor: 'Mar calmo e descoberta costeira',
    searchQuery: 'Sul de São Tomé',
  },
  {
    id: 'dest-atlantico',
    name: 'Horizontes Atlânticos',
    region: 'Rotas Internacionais a partir do Éden',
    coordinates: 'Lisboa · Luanda · Cabo Verde · Açores',
    slideId: 2,
    tagline: 'A curadoria Rotas do Éden expandida a outras geografias de natureza pura.',
    description:
      'Nascida em São Tomé e Príncipe, a nossa visão de viagem liga o arquipélago a rotas atlânticas e destinos singulares escolhidos pela autenticidade.',
    image: IMAGES.stayPavilhao,
    bestFor: 'Viagens combinadas e expedições',
    searchQuery: 'Atlântico',
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-cacau',
    index: '01',
    title: 'Rota do Cacau & Café de Altitude',
    island: 'São Tomé',
    duration: 'Dia inteiro · Curadoria local',
    demoPrice: 75,
    description:
      'Caminhada por antigas roças, colheita sazonal e prova sensorial guiada do grão à barra artesanal com produtores locais.',
    image: IMAGES.stayRoca,
  },
  {
    id: 'exp-obo',
    index: '02',
    title: 'Travessia da Floresta Obô & Cascatas',
    island: 'São Tomé & Príncipe',
    duration: '6 horas · Guia naturalista',
    demoPrice: 90,
    description:
      'Percurso interpretativo entre orquídeas selvagens, aves endémicas e lagoas cristalinas escondidas sob o dossel equatorial.',
    image: IMAGES.heroPeaks,
  },
  {
    id: 'exp-vela',
    index: '03',
    title: 'Navegação Costeira ao Entardecer',
    island: 'Ilha do Príncipe',
    duration: '4 horas · Pequeno grupo',
    demoPrice: 120,
    description:
      'Contorne baías acessíveis apenas por mar, mergulhe em enseadas desertas e assista à luz pêssego cair sobre as falésias vulcânicas.',
    image: IMAGES.stayRefugio,
  },
  {
    id: 'exp-gastronomia',
    index: '04',
    title: 'Mesa Atlântica & Sabores das Ilhas',
    island: 'Costa Sul',
    duration: '3 horas · Experiência culinária',
    demoPrice: 65,
    description:
      'Encontro gastronómico à beira-mar celebrando peixe fresco, fruta-pão, especiarias tropicais e histórias contadas à mesa.',
    image: IMAGES.stayCacau,
  },
];

export const ROTAS_PACKAGES: RotasPackage[] = [
  {
    id: 'pkg-essencial',
    name: 'Rotas Essencial',
    duration: '5 noites · São Tomé',
    subtitle: 'O primeiro encontro luminoso com a ilha, o ritmo leve-leve e a costa sul.',
    demoPrice: 'Desde €1.190 / pessoa (demo)',
    image: IMAGES.stayBungalow,
    rhythm: 'Ritmo sereno',
    includes: [
      'Estadia em categoria praia + casa boutique',
      'Transferes privados aeroporto e costa',
      'Rota do Cacau com prova artesanal',
      'Curadoria local de restaurantes e praias',
    ],
  },
  {
    id: 'pkg-explorar',
    name: 'Rotas Explorar',
    duration: '8 noites · São Tomé & Príncipe',
    subtitle: 'Duas ilhas complementares entre floresta primária, roças históricas e enseadas.',
    demoPrice: 'Desde €1.980 / pessoa (demo)',
    image: IMAGES.heroCoast,
    rhythm: 'Equilíbrio descoberta & pausa',
    includes: [
      'Voo doméstico demonstrativo entre ilhas',
      'Estadia combinada em Roça e Eco-Villa',
      'Travessia guiada no Parque Obô',
      'Navegação costeira na Ilha do Príncipe',
    ],
  },
  {
    id: 'pkg-imersao',
    name: 'Rotas Imersão',
    duration: '12 noites · Arquipélago Completo',
    subtitle: 'Tempo generoso para viver montanha, biosfera, mar e encontros comunitários.',
    demoPrice: 'Desde €2.890 / pessoa (demo)',
    image: IMAGES.stayVila,
    rhythm: 'Profundidade total',
    includes: [
      'Quatro estadias curadas em ecossistemas distintos',
      'Guia naturalista e experiências privadas',
      'Mesa Atlântica e visitas a projetos locais',
      'Acompanhamento dedicado durante toda a rota',
    ],
  },
  {
    id: 'pkg-medida',
    name: 'Rotas À Medida',
    duration: 'Duração flexível · Internacional',
    subtitle: 'Desenhado de raiz segundo os seus dias, desejos de privacidade e ligações atlânticas.',
    demoPrice: 'Proposta demonstrativa sob consulta',
    image: IMAGES.stayPavilhao,
    rhythm: 'Totalmente personalizado',
    includes: [
      'Consultoria criativa de itinerário',
      'Seleção exclusiva de refúgios e barcos privados',
      'Coordenação de voos, estadias e celebrações',
      'Acesso prioritário a experiências sazonais',
    ],
  },
];

export const COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'com-1',
    chapter: 'Capítulo 01 · Diário de Bordo',
    title: 'O silêncio dourado depois da chuva equatorial',
    author: 'Inês M.',
    place: 'Terras Altas, São Tomé',
    excerpt:
      'Quando a neblina abre sobre o vale às seis da manhã, percebe-se porque ninguém tem pressa nestas ilhas.',
    image: IMAGES.stayMontanha,
  },
  {
    id: 'com-2',
    chapter: 'Capítulo 02 · Encontros',
    title: 'Mãos que guardam o segredo do cacau fino',
    author: 'Tiago & Soraia',
    place: 'Roça do Norte',
    excerpt:
      'Mais do que visitar uma plantação, sentámo-nos à sombra da varanda a ouvir três gerações de histórias.',
    image: IMAGES.stayRoca,
  },
  {
    id: 'com-3',
    chapter: 'Capítulo 03 · Biosfera',
    title: 'Dormir sob a copa onde o oceano ainda se escuta',
    author: 'Cláudio R.',
    place: 'Ilha do Príncipe',
    excerpt:
      'Entre o som dos fetos húmidos e a maré mansa lá em baixo, o Príncipe redefine o significado de luxo.',
    image: IMAGES.stayTenda,
  },
];

export const DESTINATION_SUGGESTIONS = [
  { label: 'São Tomé', sub: 'Praias, roças históricas e Parque Obô' },
  { label: 'Ilha do Príncipe', sub: 'Reserva da Biosfera UNESCO' },
  { label: 'Sul de São Tomé', sub: 'Baías calmas e Linha do Equador' },
  { label: 'Atlântico', sub: 'Refúgios costeiros de arquitetura' },
];
