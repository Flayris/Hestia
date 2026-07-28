import type { ReactNode, CSSProperties } from 'react';

/* Componenti base del design system — SPEC.md §2.6 */

export function Card({
  children, onClick, className = '', style,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = `card ${onClick ? 'card--tap' : ''} ${className}`.trim();
  if (onClick) {
    return (
      <button className={cls} style={{ ...style, display: 'block', width: '100%', textAlign: 'left' }} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <div className={cls} style={style}>{children}</div>;
}

export function Button({
  children, onClick, variant = 'primary', style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  style?: CSSProperties;
}) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

/** Cerchio con l'iniziale del nome. In futuro ospiterà l'immagine del dio. */
export function Orb({
  name, size = 'md', onClick,
}: {
  name: string;
  size?: 'md' | 'sm';
  onClick?: () => void;
}) {
  const initial = name.replace(/^(Le |I |Gli )/, '').charAt(0);
  const cls = `orb ${size === 'sm' ? 'orb--sm' : ''} ${onClick ? 'orb--tap' : ''}`.trim();
  if (onClick) {
    return <button className={cls} onClick={onClick} aria-label={name}>{initial}</button>;
  }
  return <div className={cls} aria-hidden="true">{initial}</div>;
}

/** Orb + nome sotto, per le griglie di dèi. */
export function OrbItem({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <div className="orb-item">
      <Orb name={name} onClick={onClick} />
      <span className="orb-item__name">{name}</span>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options, value, onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const n = options.length;
  return (
    <div className="seg" role="tablist" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      <div
        className="seg__thumb"
        style={{
          width: `calc((100% - 6px) / ${n})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className="seg__btn"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked, onChange, label, disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="toggle"
      disabled={disabled}
      style={disabled ? { opacity: 0.45 } : undefined}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="t-label">{children}</p>;
}

export function Greca() {
  return <div className="greca" aria-hidden="true" />;
}
