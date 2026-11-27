import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isRecMode, setIsRecMode] = useState(false);
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'pressed'>('default');
  const [visible, setVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasTouch = 'ontouchstart' in window && navigator.maxTouchPoints > 0 && !finePointer;

    if (!finePointer || reducedMotion || hasTouch) {
      setEnabled(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setIsRecMode(params.has('rec'));
    setEnabled(true);
    document.documentElement.classList.add('eden-custom-cursor-active');

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, label, [data-cursor="interactive"]';

    const handleMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(target?.closest(interactiveSelector));
      setCursorState((prev) => {
        if (prev === 'pressed') return prev;
        return isInteractive ? 'hover' : 'default';
      });
    };

    const handleDown = () => {
      setCursorState('pressed');
    };

    const handleUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(target?.closest(interactiveSelector));
      setCursorState(isInteractive ? 'hover' : 'default');
    };

    const handleLeave = () => {
      setVisible(false);
    };

    const handleEnter = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    const animate = () => {
      const ease = 0.22;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('eden-custom-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!enabled) return null;

  const sizes = isRecMode
    ? { default: 50, hover: 58, pressed: 62 }
    : { default: 26, hover: 38, pressed: 44 };

  const diameter = sizes[cursorState];
  const isPressed = cursorState === 'pressed';
  const isHover = cursorState === 'hover';

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        opacity: visible ? 1 : 0,
        backgroundColor: isPressed
          ? 'transparent'
          : isHover
            ? 'rgba(132, 118, 126, 0.34)'
            : 'rgba(72, 62, 68, 0.55)',
        border: isPressed
          ? '5px solid rgba(29, 26, 28, 0.92)'
          : isHover
            ? '1.5px solid rgba(255, 255, 255, 0.55)'
            : '1px solid rgba(255, 255, 255, 0.16)',
        backdropFilter: isHover ? 'blur(2px)' : 'none',
        transition:
          'width 250ms cubic-bezier(0.16, 1, 0.3, 1), height 250ms cubic-bezier(0.16, 1, 0.3, 1), background-color 250ms ease, border 220ms ease, opacity 220ms ease',
        willChange: 'transform, width, height',
      }}
    />
  );
}
