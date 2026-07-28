import { NavLink } from 'react-router-dom';

/* Barra inferiore a 4 voci — SPEC.md §3. Musica e "I tuoi dèi" stanno nella Home. */

const TABS = [
  { to: '/',           label: 'Oggi',       icon: IconSun },
  { to: '/calendario', label: 'Calendario', icon: IconMoon },
  { to: '/grimorio',   label: 'Grimorio',   icon: IconBook },
  { to: '/diario',     label: 'Diario',     icon: IconFeather },
] as const;

export function TabBar() {
  return (
    <nav className="tabbar app-chrome">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `tab ${isActive ? 'tab--active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon filled={isActive} />
              <span className="tab__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

type IconProps = { filled?: boolean };
const base = (filled?: boolean) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: filled ? 'currentColor' : 'none',
  stroke: 'currentColor',
  strokeWidth: filled ? 1 : 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function IconSun({ filled }: IconProps) {
  return (
    <svg {...base(filled)}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" fill="none" strokeWidth="1.6" />
    </svg>
  );
}

function IconMoon({ filled }: IconProps) {
  return (
    <svg {...base(filled)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function IconBook({ filled }: IconProps) {
  return (
    <svg {...base(filled)}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H18a1 1 0 0 1 1 1v13H5.5A1.5 1.5 0 0 0 4 18.5z" />
      <path d="M4 18.5A1.5 1.5 0 0 0 5.5 20H19" fill="none" strokeWidth="1.6" />
    </svg>
  );
}

function IconFeather({ filled }: IconProps) {
  return (
    <svg {...base(filled)}>
      <path d="M19 5c0 6.5-4.5 11-11 11H5l1-1C6 9 11 5 17 5z" />
      <path d="M5 19L11 13" fill="none" strokeWidth="1.6" />
    </svg>
  );
}
