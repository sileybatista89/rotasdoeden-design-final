import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  CLOUD_TEXTURE_FALLBACK,
  CLOUD_TEXTURE_PRIMARY,
  HERO_SLIDES,
  RAIL_ITEMS,
} from '../data/rotasData';
import { SearchBar, SearchQueryState } from './SearchBar';

interface CinematicHeroProps {
  activeSlideId: number;
  onSlideChange: (slideId: number) => void;
  searchQuery: SearchQueryState;
  onSearchQueryChange: (next: SearchQueryState) => void;
  onSearchSubmit: (query: SearchQueryState) => void;
  detailOpen: boolean;
}

const SLIDE_INTERVAL_MS = 5200;
const TRANSITION_DURATION_MS = 1250;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function CinematicHero({
  activeSlideId,
  onSlideChange,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  detailOpen,
}: CinematicHeroProps) {
  const [cloudSrc, setCloudSrc] = useState(CLOUD_TEXTURE_PRIMARY);
  const [userPaused, setUserPaused] = useState(false);
  const [searchInteracting, setSearchInteracting] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Coordinated intro states
  const [titleIntroVisible, setTitleIntroVisible] = useState(false);
  const [thumbsIntroVisible, setThumbsIntroVisible] = useState(false);
  const [ringsIntroVisible, setRingsIntroVisible] = useState(false);
  const [searchIntroVisible, setSearchIntroVisible] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);
  const [displayedCaptionSlideId, setDisplayedCaptionSlideId] = useState(activeSlideId);

  // Viewport geometry for deterministic Destination Rail + Concentric Rings
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  // Transition state refs driven directly via rAF for 60/120 FPS smoothness
  const currentSlideRef = useRef<number>(activeSlideId);
  const outgoingSlideRef = useRef<number | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const transitionStartRef = useRef<number>(0);
  const kenBurnsStartRef = useRef<number>(performance.now());
  const queuedSlideRef = useRef<number | null>(null);

  // Pointer parallax refs
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });

  // DOM refs for zero-React-re-render animation
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const slideStackRef = useRef<HTMLDivElement | null>(null);
  const slideLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slidePhotoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mistBandRef = useRef<HTMLDivElement | null>(null);
  const bottomCloudWrapRef = useRef<HTMLDivElement | null>(null);
  const upperCloudWrapRef = useRef<HTMLDivElement | null>(null);
  const railChoreographyRef = useRef<HTMLDivElement | null>(null);
  const captionTimerRef = useRef<number | null>(null);

  // Track reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Viewport resize tracking
  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Pause expensive hero loop when scrolled completely offscreen
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Coordinated cinematic introduction sequence (Section 8)
  useEffect(() => {
    if (reducedMotion) {
      setTitleIntroVisible(true);
      setThumbsIntroVisible(true);
      setRingsIntroVisible(true);
      setSearchIntroVisible(true);
      setCaptionVisible(true);
      return;
    }

    const t1 = window.setTimeout(() => setTitleIntroVisible(true), 250);
    const t2 = window.setTimeout(() => setThumbsIntroVisible(true), 350);
    const t3 = window.setTimeout(() => setRingsIntroVisible(true), 460);
    const t4 = window.setTimeout(() => setSearchIntroVisible(true), 300);
    const t5 = window.setTimeout(() => setCaptionVisible(true), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [reducedMotion]);

  // Apply initial slide layering once mounted
  const applyRestSlideStyles = useCallback((activeId: number) => {
    HERO_SLIDES.forEach((slide, idx) => {
      const layer = slideLayerRefs.current[idx];
      const photo = slidePhotoRefs.current[idx];
      if (!layer || !photo) return;

      if (slide.id === activeId) {
        layer.style.zIndex = '2';
        layer.style.opacity = '1';
        layer.style.visibility = 'visible';
        layer.style.maskImage = 'none';
        layer.style.webkitMaskImage = 'none';
      } else {
        layer.style.zIndex = '0';
        layer.style.opacity = '0';
        layer.style.visibility = 'hidden';
        layer.style.maskImage = 'none';
        layer.style.webkitMaskImage = 'none';
        photo.style.transform = 'scale(1.04) translate3d(0%, 0%, 0)';
      }
    });

    if (mistBandRef.current) {
      mistBandRef.current.style.opacity = '0';
    }
  }, []);

  useEffect(() => {
    applyRestSlideStyles(currentSlideRef.current);
  }, [applyRestSlideStyles]);

  // Trigger signature misty right-to-left wipe transition (Section 7)
  const triggerSlideTransition = useCallback(
    (nextSlideId: number) => {
      if (nextSlideId === currentSlideRef.current) return;

      if (isTransitioningRef.current) {
        // Prevent overlapping transitions by storing the latest requested target
        queuedSlideRef.current = nextSlideId;
        return;
      }

      if (reducedMotion) {
        currentSlideRef.current = nextSlideId;
        outgoingSlideRef.current = null;
        applyRestSlideStyles(nextSlideId);
        setDisplayedCaptionSlideId(nextSlideId);
        setCaptionVisible(true);
        return;
      }

      outgoingSlideRef.current = currentSlideRef.current;
      currentSlideRef.current = nextSlideId;
      isTransitioningRef.current = true;
      transitionStartRef.current = performance.now();

      // Immediately hide previous connector & caption, then reveal new one after 650ms
      setCaptionVisible(false);
      if (captionTimerRef.current !== null) {
        window.clearTimeout(captionTimerRef.current);
      }
      captionTimerRef.current = window.setTimeout(() => {
        setDisplayedCaptionSlideId(nextSlideId);
        setCaptionVisible(true);
      }, 650);

      // Prepare z-index & visibility for incoming and outgoing slides
      HERO_SLIDES.forEach((slide, idx) => {
        const layer = slideLayerRefs.current[idx];
        if (!layer) return;

        if (slide.id === nextSlideId) {
          layer.style.zIndex = '3';
          layer.style.opacity = '1';
          layer.style.visibility = 'visible';
          layer.style.maskImage =
            'linear-gradient(to left, rgba(0,0,0,1) -35%, rgba(0,0,0,0.5) -17.5%, rgba(0,0,0,0) 0%)';
          layer.style.webkitMaskImage =
            'linear-gradient(to left, rgba(0,0,0,1) -35%, rgba(0,0,0,0.5) -17.5%, rgba(0,0,0,0) 0%)';
        } else if (slide.id === outgoingSlideRef.current) {
          layer.style.zIndex = '2';
          layer.style.opacity = '1';
          layer.style.visibility = 'visible';
          layer.style.maskImage = 'none';
          layer.style.webkitMaskImage = 'none';
        } else {
          layer.style.zIndex = '0';
          layer.style.opacity = '0';
          layer.style.visibility = 'hidden';
          layer.style.maskImage = 'none';
          layer.style.webkitMaskImage = 'none';
        }
      });
    },
    [applyRestSlideStyles, reducedMotion]
  );

  // Sync external activeSlideId prop changes (e.g., from Navbar or Destinos section)
  useEffect(() => {
    if (activeSlideId !== currentSlideRef.current) {
      triggerSlideTransition(activeSlideId);
    }
  }, [activeSlideId, triggerSlideTransition]);

  useEffect(() => {
    return () => {
      if (captionTimerRef.current !== null) {
        window.clearTimeout(captionTimerRef.current);
      }
    };
  }, []);

  // Automatic 5.2s slide advancement (pauses during search interaction, detail overlay, user pause, or offscreen)
  const isAutoPaused = userPaused || searchInteracting || detailOpen || !heroInView;

  useEffect(() => {
    if (isAutoPaused || reducedMotion) return;

    const timer = window.setInterval(() => {
      if (isTransitioningRef.current) return;
      const next = (currentSlideRef.current + 1) % HERO_SLIDES.length;
      onSlideChange(next);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isAutoPaused, onSlideChange, reducedMotion]);

  // Pointer parallax tracking (±0.6% X, ±0.5% Y)
  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (e: MouseEvent) => {
      if (!heroInView) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1..1
      pointerTarget.current.x = nx * -0.6;
      pointerTarget.current.y = ny * -0.5;
    };
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', onPointerMove);
  }, [heroInView, reducedMotion]);

  // Master rAF loop: misty transition mask + mist band + Ken Burns + pointer parallax
  useEffect(() => {
    if (!heroInView || detailOpen) return;

    let rafId = 0;

    const tick = (now: number) => {
      // Smooth pointer parallax interpolation
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * 0.06;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * 0.06;

      const px = reducedMotion ? 0 : pointerCurrent.current.x;
      const py = reducedMotion ? 0 : pointerCurrent.current.y;

      if (isTransitioningRef.current) {
        const rawProgress = Math.min(
          1,
          (now - transitionStartRef.current) / TRANSITION_DURATION_MS
        );
        const p = easeInOutCubic(rawProgress);

        // Moving right-to-left linear-gradient mask
        const opaqueBoundary = p * 135 - 35;
        const transparentBoundary = p * 135;
        const midBoundary = (opaqueBoundary + transparentBoundary) / 2;

        const maskStr = `linear-gradient(to left, rgba(0,0,0,1) ${opaqueBoundary.toFixed(
          2
        )}%, rgba(0,0,0,0.52) ${midBoundary.toFixed(
          2
        )}%, rgba(0,0,0,0) ${transparentBoundary.toFixed(2)}%)`;

        const inId = currentSlideRef.current;
        const outId = outgoingSlideRef.current;

        const inLayer = slideLayerRefs.current[inId];
        const inPhoto = slidePhotoRefs.current[inId];
        if (inLayer && inPhoto) {
          inLayer.style.maskImage = maskStr;
          inLayer.style.webkitMaskImage = maskStr;

          const inScale = 1.12 - 0.08 * p; // 1.12 -> 1.04
          const inTx = 2 * (1 - p); // +2% -> 0%
          inPhoto.style.transform = `scale(${inScale.toFixed(
            4
          )}) translate3d(${(inTx + px).toFixed(3)}%, ${py.toFixed(3)}%, 0)`;
        }

        if (outId !== null) {
          const outPhoto = slidePhotoRefs.current[outId];
          if (outPhoto) {
            const outScale = 1.04 + 0.05 * p; // 1.04 -> 1.09
            const outTx = -2 * p; // 0% -> -2%
            outPhoto.style.transform = `scale(${outScale.toFixed(
              4
            )}) translate3d(${(outTx + px).toFixed(3)}%, ${py.toFixed(3)}%, 0)`;
          }
        }

        // Moving 34vw mist band riding the transition edge
        if (mistBandRef.current) {
          const edgeFromLeftPercent = 100 - midBoundary;
          const mistOpacity = Math.sin(Math.PI * rawProgress) * 0.95;
          mistBandRef.current.style.opacity = mistOpacity.toFixed(3);
          mistBandRef.current.style.transform = `translate3d(calc(${edgeFromLeftPercent.toFixed(
            2
          )}vw - 17vw), 0, 0)`;
        }

        if (rawProgress >= 1) {
          isTransitioningRef.current = false;
          outgoingSlideRef.current = null;
          kenBurnsStartRef.current = now;
          applyRestSlideStyles(currentSlideRef.current);

          if (
            queuedSlideRef.current !== null &&
            queuedSlideRef.current !== currentSlideRef.current
          ) {
            const queued = queuedSlideRef.current;
            queuedSlideRef.current = null;
            triggerSlideTransition(queued);
          } else {
            queuedSlideRef.current = null;
          }
        }
      } else {
        // Continuous slow Ken Burns movement (+0.0035/s) + subtle pointer parallax
        const elapsedSec = Math.min(18, (now - kenBurnsStartRef.current) / 1000);
        const kbScale = reducedMotion ? 1.04 : 1.04 + elapsedSec * 0.0035;
        const activePhoto = slidePhotoRefs.current[currentSlideRef.current];
        if (activePhoto) {
          activePhoto.style.transform = `scale(${kbScale.toFixed(
            5
          )}) translate3d(${px.toFixed(3)}%, ${py.toFixed(3)}%, 0)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [applyRestSlideStyles, detailOpen, heroInView, reducedMotion, triggerSlideTransition]);

  // Scroll-driven atmospheric choreography (Section 9)
  useEffect(() => {
    let rafScroll = 0;

    const updateScrollChoreography = () => {
      rafScroll = 0;
      const scrollY = window.scrollY;
      const vh = Math.max(window.innerHeight, 620);

      if (reducedMotion) {
        if (upperCloudWrapRef.current) {
          upperCloudWrapRef.current.style.opacity = '0';
        }
        return;
      }

      // Slide stack: translateY(+0.42 * scrollY)
      if (slideStackRef.current) {
        slideStackRef.current.style.transform = `translate3d(0, ${(scrollY * 0.42).toFixed(
          1
        )}px, 0)`;
      }

      // Bottom clouds: translateY(-0.38 * scrollY), scale(1 + 0.35 * scrollY / vh)
      if (bottomCloudWrapRef.current) {
        const cloudScale = 1 + (0.35 * Math.min(scrollY, vh * 1.4)) / vh;
        bottomCloudWrapRef.current.style.transform = `translate3d(0, ${(
          -0.38 * scrollY
        ).toFixed(1)}px, 0) scale(${cloudScale.toFixed(4)})`;
      }

      // Upper clouds progressively appear on scroll
      if (upperCloudWrapRef.current) {
        const upperOpacity = Math.min(0.95, Math.max(0, scrollY / (vh * 0.55)));
        upperCloudWrapRef.current.style.opacity = upperOpacity.toFixed(3);
        upperCloudWrapRef.current.style.transform = `translate3d(0, ${(
          scrollY * 0.14
        ).toFixed(1)}px, 0)`;
      }

      // Destination rail: translateY(+0.2 * scrollY) & fades by half a viewport
      if (railChoreographyRef.current) {
        const railOpacity = Math.max(0, 1 - scrollY / (vh * 0.5));
        railChoreographyRef.current.style.transform = `translate3d(0, ${(
          scrollY * 0.2
        ).toFixed(1)}px, 0)`;
        railChoreographyRef.current.style.opacity = railOpacity.toFixed(3);
      }
    };

    const onScroll = () => {
      if (!rafScroll) {
        rafScroll = window.requestAnimationFrame(updateScrollChoreography);
      }
    };

    updateScrollChoreography();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafScroll) window.cancelAnimationFrame(rafScroll);
    };
  }, [reducedMotion]);

  // Deterministic Destination Rail & Concentric Rings geometry (Section 6 & 14)
  const railLayout = useMemo(() => {
    const isMobile = viewport.w < 640;
    const isTablet = viewport.w >= 640 && viewport.w < 1000;
    const heroH = Math.max(viewport.h, isMobile ? 640 : 680);

    const activeSize = isMobile
      ? 64
      : Math.max(96, Math.min(190, viewport.w * 0.113));
    const inactiveSize = isMobile
      ? 36
      : Math.max(46, Math.min(92, viewport.w * 0.054));
    const gap = isMobile
      ? 12
      : Math.max(16, Math.min(30, viewport.w * 0.02));

    const railCenterX = isMobile ? viewport.w * 0.865 : viewport.w * 0.855;
    const columnCenterY = isMobile ? heroH * 0.30 : heroH * 0.44;

    const activeRailIndex = HERO_SLIDES[activeSlideId]?.railIndex ?? 2;
    const sizes = [0, 1, 2].map((rIdx) =>
      rIdx === activeRailIndex ? activeSize : inactiveSize
    );
    const totalH = sizes[0] + sizes[1] + sizes[2] + gap * 2;
    const startTop = columnCenterY - totalH / 2;

    const positions = [0, 1, 2].map((rIdx) => {
      let top = startTop;
      if (rIdx >= 1) top += sizes[0] + gap;
      if (rIdx >= 2) top += sizes[1] + gap;
      const size = sizes[rIdx];
      return {
        top,
        size,
        centerY: top + size / 2,
        left: railCenterX - size / 2,
      };
    });

    const activePos = positions[activeRailIndex];
    const innerRingDiameter = activeSize + viewport.w * 0.1; // radius = active/2 + 5vw
    const outerRingDiameter = activeSize + viewport.w * 0.216; // radius = active/2 + 10.8vw
    const connectorWidth = isTablet
      ? Math.max(40, viewport.w * 0.055)
      : Math.max(60, Math.min(126, viewport.w * 0.075));

    return {
      isMobile,
      isTablet,
      railCenterX,
      positions,
      activePos,
      innerRingDiameter,
      outerRingDiameter,
      connectorWidth,
    };
  }, [activeSlideId, viewport.h, viewport.w]);

  const displayedCaptionSlide = HERO_SLIDES[displayedCaptionSlideId] ?? HERO_SLIDES[0];

  return (
    <section
      id="topo"
      ref={heroSectionRef}
      aria-label="Apresentação cinematográfica Rotas do Éden"
      className={`relative w-full h-screen min-h-[640px] sm:min-h-[680px] overflow-hidden select-none ${
        !heroInView || detailOpen ? 'eden-cloud-paused' : ''
      }`}
    >
      {/* 1. STACKED PHOTOGRAPHIC SLIDES + MONUMENTAL TITLE INSIDE EACH SLIDE */}
      <div
        ref={slideStackRef}
        className="absolute inset-0 will-change-transform"
        style={{ zIndex: 1 }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideLayerRefs.current[idx] = el;
            }}
            className="absolute inset-0 overflow-hidden"
            style={{
              zIndex: slide.id === activeSlideId ? 2 : 0,
              opacity: slide.id === activeSlideId ? 1 : 0,
              visibility: slide.id === activeSlideId ? 'visible' : 'hidden',
            }}
          >
            {/* Photo Layer inset by -3%, base scale 1.04 */}
            <div
              ref={(el) => {
                slidePhotoRefs.current[idx] = el;
              }}
              className="absolute -inset-[3%] bg-cover bg-center will-change-transform"
              style={{
                backgroundImage: `url("${slide.image}")`,
                transform: 'scale(1.04) translate3d(0%, 0%, 0)',
              }}
              role="img"
              aria-label={slide.imageAlt}
            />

            {/* Subtle atmospheric top & edge tint for crisp typography legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(22, 16, 18, 0.42) 0%, rgba(22, 16, 18, 0.16) 36%, rgba(22, 16, 18, 0.08) 65%, rgba(247, 217, 198, 0.12) 100%)',
              }}
            />

            {/* Monumental Hero Title inside the photographic slide (wipes together with photo!) */}
            <div
              className="absolute inset-x-0 top-[15vh] sm:top-[16vh] flex flex-col items-start sm:items-center pointer-events-none"
              style={{
                paddingLeft: 'clamp(20px, 6vw, 90px)',
                paddingRight: 'clamp(20px, 6vw, 90px)',
              }}
            >
              <h1
                className="font-sans-eden font-bold uppercase tracking-[-0.025em] leading-[0.9] max-w-[80vw] sm:max-w-[90vw] text-left sm:text-center flex flex-wrap sm:justify-center gap-x-[0.26em] gap-y-[0.04em]"
                style={{
                  fontSize: railLayout.isMobile
                    ? 'clamp(44px, 13.6vw, 66px)'
                    : 'clamp(64px, 8.9vw, 152px)',
                }}
              >
                {slide.titleWords.map((word, wordIdx) => (
                  <span
                    key={`${slide.id}-${word}-${wordIdx}`}
                    className="inline-block overflow-hidden pb-[0.08em]"
                  >
                    <span
                      className="eden-hero-title-word"
                      style={{
                        transform: titleIntroVisible
                          ? 'translate3d(0, 0%, 0)'
                          : 'translate3d(0, 105%, 0)',
                        transition: reducedMotion
                          ? 'none'
                          : `transform 1150ms cubic-bezier(0.16, 1, 0.3, 1) ${
                              wordIdx * 90
                            }ms`,
                      }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* 2. MOVING MIST BAND RIDING THE WIPE TRANSITION EDGE */}
      <div
        ref={mistBandRef}
        aria-hidden="true"
        className="absolute top-[-10%] bottom-[-10%] left-0 pointer-events-none will-change-transform"
        style={{
          width: '34vw',
          zIndex: 4,
          opacity: 0,
          filter: 'blur(12px)',
          background:
            'radial-gradient(ellipse 52% 65% at 50% 50%, rgba(255, 245, 239, 0.94) 0%, rgba(247, 217, 198, 0.54) 44%, rgba(247, 217, 198, 0) 78%)',
        }}
      />

      {/* 3. VOLUMETRIC CLOUDS & ATMOSPHERIC DEPTH (Section 5) */}
      {/* Upper cloud layer (vertically flipped, -30% to 50%, revealed on scroll) */}
      <div
        ref={upperCloudWrapRef}
        aria-hidden="true"
        className="absolute left-[-6%] right-[-6%] pointer-events-none eden-cloud-upper-mask will-change-transform"
        style={{
          top: '-30%',
          height: '80%',
          zIndex: 5,
          opacity: 0,
          mixBlendMode: 'screen',
        }}
      >
        <img
          src={cloudSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            if (cloudSrc !== CLOUD_TEXTURE_FALLBACK) {
              setCloudSrc(CLOUD_TEXTURE_FALLBACK);
            }
          }}
          className="w-full h-full object-cover eden-cloud-upper opacity-90"
        />
      </div>

      {/* Bottom cloud bank (left/right -4%, bottom -6%, height 78%, 2 independent layers) */}
      <div
        ref={bottomCloudWrapRef}
        aria-hidden="true"
        className="absolute pointer-events-none eden-cloud-bank-mask will-change-transform origin-bottom"
        style={{
          left: '-4%',
          right: '-4%',
          bottom: '-6%',
          height: '78%',
          zIndex: 6,
          mixBlendMode: 'screen',
        }}
      >
        {/* Rear cloud layer: horizontally mirrored, opacity .85, 34s drift ±3% X / 4% Y */}
        <img
          src={cloudSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            if (cloudSrc !== CLOUD_TEXTURE_FALLBACK) {
              setCloudSrc(CLOUD_TEXTURE_FALLBACK);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-bottom eden-cloud-rear"
          style={{ opacity: 0.85 }}
        />
        {/* Front cloud layer: 26s horizontal drift -2.5% to +2.5% */}
        <img
          src={cloudSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            if (cloudSrc !== CLOUD_TEXTURE_FALLBACK) {
              setCloudSrc(CLOUD_TEXTURE_FALLBACK);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-bottom eden-cloud-front"
          style={{ opacity: 0.92 }}
        />
      </div>

      {/* Bottom atmospheric fade (bottom 46% seamlessly melts into #f7d9c6) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '46%',
          zIndex: 7,
          background:
            'linear-gradient(to bottom, rgba(247, 217, 198, 0) 0%, rgba(247, 217, 198, 0.24) 30%, rgba(247, 217, 198, 0.72) 66%, #f7d9c6 100%)',
        }}
      />

      {/* 4. INTERACTIVE DESTINATION RAIL, CONCENTRIC RINGS & EDITORIAL CAPTION (Section 6) */}
      <div
        ref={railChoreographyRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ zIndex: 12 }}
      >
        {/* Concentric Rings centered on the active thumbnail (allowed to extend past right edge) */}
        <div
          aria-hidden="true"
          className="absolute rounded-full border border-white/40 pointer-events-none"
          style={{
            width: `${railLayout.innerRingDiameter}px`,
            height: `${railLayout.innerRingDiameter}px`,
            left: `${railLayout.railCenterX - railLayout.innerRingDiameter / 2}px`,
            top: `${railLayout.activePos.centerY - railLayout.innerRingDiameter / 2}px`,
            opacity: ringsIntroVisible ? 1 : 0,
            transition: reducedMotion
              ? 'none'
              : 'top 900ms cubic-bezier(0.65, 0, 0.35, 1), left 900ms cubic-bezier(0.65, 0, 0.35, 1), width 900ms cubic-bezier(0.65, 0, 0.35, 1), height 900ms cubic-bezier(0.65, 0, 0.35, 1), opacity 950ms ease',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute rounded-full border border-white/22 pointer-events-none"
          style={{
            width: `${railLayout.outerRingDiameter}px`,
            height: `${railLayout.outerRingDiameter}px`,
            left: `${railLayout.railCenterX - railLayout.outerRingDiameter / 2}px`,
            top: `${railLayout.activePos.centerY - railLayout.outerRingDiameter / 2}px`,
            opacity: ringsIntroVisible ? 1 : 0,
            transition: reducedMotion
              ? 'none'
              : 'top 900ms cubic-bezier(0.65, 0, 0.35, 1), left 900ms cubic-bezier(0.65, 0, 0.35, 1), width 900ms cubic-bezier(0.65, 0, 0.35, 1), height 900ms cubic-bezier(0.65, 0, 0.35, 1), opacity 1150ms ease',
          }}
        />

        {/* Desktop & Tablet Connector + Vertical Bar + Editorial Caption */}
        {!railLayout.isMobile && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: `${railLayout.activePos.centerY}px`,
              right: `${viewport.w - railLayout.activePos.left + 12}px`,
              transition: reducedMotion
                ? 'none'
                : 'top 900ms cubic-bezier(0.65, 0, 0.35, 1), right 900ms cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          >
            <div className="relative flex items-start">
              {/* Editorial Caption with horizontal clipping mask */}
              <div
                className="mr-4 text-right -translate-y-[66%]"
                style={{
                  width: railLayout.isTablet ? '210px' : '278px',
                  clipPath: captionVisible ? 'inset(0 0% 0 0)' : 'inset(0 0 0 100%)',
                  opacity: captionVisible ? 1 : 0,
                  transition: reducedMotion
                    ? 'none'
                    : 'clip-path 680ms cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 480ms ease 100ms',
                }}
              >
                <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-white/75 mb-1">
                  {displayedCaptionSlide.railLabel}
                </div>
                <h2 className="font-editorial text-[24px] lg:text-[27px] leading-[1.15] text-white drop-shadow-[0_2px_12px_rgba(20,12,10,0.38)] mb-1.5">
                  {displayedCaptionSlide.captionTitle}
                </h2>
                <p className="text-[13px] leading-[1.5] text-white/88 drop-shadow-[0_1px_10px_rgba(20,12,10,0.45)]">
                  {displayedCaptionSlide.captionBody}
                </p>
              </div>

              {/* Vertical White Bar growing from connector top */}
              <div className="relative flex items-center">
                <span
                  aria-hidden="true"
                  className="block w-[1.5px] bg-white/85 origin-bottom -translate-y-1/2"
                  style={{
                    height: '66px',
                    transform: captionVisible
                      ? 'translateY(-50%) scaleY(1)'
                      : 'translateY(-50%) scaleY(0)',
                    transition: reducedMotion
                      ? 'none'
                      : 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1) 60ms',
                  }}
                />
                {/* Horizontal White Connector growing toward active thumbnail */}
                <span
                  aria-hidden="true"
                  className="block h-[1.5px] bg-white/85 origin-left"
                  style={{
                    width: `${railLayout.connectorWidth}px`,
                    transform: captionVisible ? 'scaleX(1)' : 'scaleX(0)',
                    transition: reducedMotion
                      ? 'none'
                      : 'transform 560ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Three Circular Destination Thumbnails */}
        {RAIL_ITEMS.map((item, railIdx) => {
          const pos = railLayout.positions[railIdx];
          const isActive = item.id === activeSlideId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSlideChange(item.id)}
              aria-label={`Ver destino ${item.railLabel}`}
              aria-pressed={isActive}
              className="group absolute rounded-full pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f39419]"
              style={{
                left: `${pos.left}px`,
                top: `${pos.top}px`,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                transform: thumbsIntroVisible ? 'scale(1)' : 'scale(0)',
                transition: reducedMotion
                  ? 'none'
                  : `left 900ms cubic-bezier(0.65, 0, 0.35, 1), top 900ms cubic-bezier(0.65, 0, 0.35, 1), width 900ms cubic-bezier(0.65, 0, 0.35, 1), height 900ms cubic-bezier(0.65, 0, 0.35, 1), transform 820ms cubic-bezier(0.16, 1, 0.3, 1) ${
                      thumbsIntroVisible ? 0 : railIdx * 140
                    }ms`,
              }}
            >
              {/* Active Halo Ring */}
              <span
                aria-hidden="true"
                className="absolute -inset-[7px] rounded-full border border-white/55 pointer-events-none transition-all duration-700"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0.84)',
                }}
              />

              {/* Circular Thumbnail Body */}
              <span
                className="block w-full h-full rounded-full overflow-hidden border-[3px] border-white/75 shadow-[0_14px_38px_rgba(22,12,10,0.42)] transition-transform duration-500 group-hover:scale-[1.07]"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <img
                  src={item.thumbImage}
                  alt={item.railLabel}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Repositioned Editorial Caption (cleanly above search bar, zero collision with rail) */}
      {railLayout.isMobile && (
        <div
          className="absolute left-5 right-24 pointer-events-none"
          style={{
            bottom: 'calc(20vh + 178px)',
            zIndex: 13,
            opacity: captionVisible ? 1 : 0,
            transform: captionVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 480ms ease, transform 520ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-white/80 mb-0.5">
            {displayedCaptionSlide.railLabel}
          </div>
          <div className="font-editorial text-[21px] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            {displayedCaptionSlide.captionTitle}
          </div>
          <p className="text-[12.5px] leading-snug text-white/90 mt-1 line-clamp-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
            {displayedCaptionSlide.captionBody}
          </p>
        </div>
      )}

      {/* 5. FLOATING ANIMATED SEARCH BAR (positioned ~20vh above hero bottom on desktop) */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: railLayout.isMobile ? '11vh' : '20vh',
          zIndex: 25,
        }}
      >
        <SearchBar
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          onSearchSubmit={onSearchSubmit}
          onInteractionChange={setSearchInteracting}
          introReady={searchIntroVisible}
        />
      </div>

      {/* 6. PLAYBACK CONTROL & ILLUSTRATIVE ASSET DISCLOSURE */}
      <div
        className="hidden sm:flex items-center gap-3 absolute bottom-[22.5vh] left-0 z-20"
        style={{ paddingLeft: 'clamp(20px, 4vw, 54px)' }}
      >
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? 'Retomar transição automática' : 'Pausar transição automática'}
          title={userPaused ? 'Retomar slides' : 'Pausar slides'}
          className="w-9 h-9 rounded-full bg-[#1d1a1c]/30 hover:bg-[#1d1a1c]/55 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-colors"
        >
          {userPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <div className="text-[11.5px] font-medium text-white/85 tabular-nums tracking-[0.06em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
          0{activeSlideId + 1} / 0{HERO_SLIDES.length}
        </div>
      </div>

      {/* Subtle truthful illustrative imagery note */}
      <div
        className="hidden md:block absolute bottom-[14.5vh] right-0 z-10 pointer-events-none"
        style={{ paddingRight: 'clamp(20px, 4vw, 54px)' }}
      >
        <span className="text-[11px] text-[#5c5156]/80 tracking-[0.02em]">
          {HERO_SLIDES[activeSlideId].illustrativeNote}
        </span>
      </div>
    </section>
  );
}
