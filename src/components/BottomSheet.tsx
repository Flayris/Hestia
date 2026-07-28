import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';

/**
 * Sheet che sale dal basso. Si chiude col tap sul backdrop, con Esc,
 * o trascinandolo verso il basso oltre 90px (o con uno scatto veloce).
 */
export function BottomSheet({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ y: number; t: number } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Chiusura animata: attende la fine della transizione prima di smontare.
  const dismiss = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      setDrag(0);
      onClose();
    }, 320);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    // Blocca lo scroll della pagina sotto lo sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const onPointerDown = (e: ReactPointerEvent) => {
    start.current = { y: e.clientY, t: e.timeStamp };
    sheetRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!start.current) return;
    setDrag(Math.max(0, e.clientY - start.current.y));
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const dt = e.timeStamp - start.current.t;
    const flick = dy > 30 && dt < 250;      // scatto veloce verso il basso
    start.current = null;
    if (dy > 90 || flick) dismiss();
    else setDrag(0);
  };

  // Portal su document.body: le schermate hanno `.screen { z-index: 1 }`, che crea un
  // contesto di impilamento. Restando dentro, lo sheet finirebbe sotto la tab bar
  // (z-index 30) nonostante il suo 41, e la barra resterebbe cliccabile sotto il modale.
  return createPortal(
    <>
      <div
        className={`sheet-backdrop ${closing ? 'sheet-backdrop--closing' : ''}`}
        onClick={dismiss}
      />
      <div
        ref={sheetRef}
        className={`sheet ${closing ? 'sheet--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={drag ? { transform: `translateY(${drag}px)`, animation: 'none' } : undefined}
      >
        <div
          className="sheet__grip app-chrome"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ padding: '8px 0', height: 'auto', background: 'none', width: '100%' }}
        >
          <div style={{
            width: 36, height: 4, margin: '0 auto',
            borderRadius: 999, background: 'rgba(120,96,44,.32)',
          }} />
        </div>
        <div className="sheet__body">
          {title && <h2 className="t-section" style={{ marginBottom: 'var(--s3)' }}>{title}</h2>}
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
