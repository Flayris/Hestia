/**
 * Luna disegnata coerentemente con la fase reale — SPEC.md §5.2.
 * `phase` è la frazione del ciclo: 0 = luna nuova, 0.5 = piena.
 */

const R = 42;
const C = 50;

export function phaseName(p: number): string {
  const x = ((p % 1) + 1) % 1;
  if (x < 0.02 || x > 0.98) return 'Luna nuova';
  if (x < 0.23) return 'Crescente';
  if (x < 0.27) return 'Primo quarto';
  if (x < 0.48) return 'Gibbosa crescente';
  if (x < 0.52) return 'Luna piena';
  if (x < 0.73) return 'Gibbosa calante';
  if (x < 0.77) return 'Ultimo quarto';
  return 'Calante';
}

export function MoonWidget({ phase, size = 96 }: { phase: number; size?: number }) {
  const p = ((phase % 1) + 1) % 1;
  const lit = (1 - Math.cos(2 * Math.PI * p)) / 2;   // frazione illuminata
  const rx = R * Math.abs(Math.cos(2 * Math.PI * p)); // semiasse del terminatore
  const waxing = p < 0.5;

  // Regione illuminata: semicerchio destro + arco del terminatore.
  // Risalendo dal basso verso l'alto, sweep=1 passa a sinistra (gibbosa, aggiunge
  // area), sweep=0 passa a destra (falce, la sottrae). L'asse y dell'SVG punta in
  // basso, quindi sweep=1 corrisponde al senso orario visivo.
  const sweep = lit < 0.5 ? 0 : 1;
  const d = `M ${C},${C - R} A ${R},${R} 0 0,1 ${C},${C + R} A ${rx},${R} 0 0,${sweep} ${C},${C - R} Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={phaseName(p)}
    >
      <defs>
        <radialGradient id="moon-lit" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="70%" stopColor="#f3e6c4" />
          <stop offset="100%" stopColor="#e0cd9c" />
        </radialGradient>
      </defs>

      {/* disco in ombra — abbastanza scuro da distinguersi dal marmo del fondo */}
      <circle cx={C} cy={C} r={R} fill="#b9ad8e" />

      {/* porzione illuminata — specchiata quando la luna è calante */}
      <path
        d={d}
        fill="url(#moon-lit)"
        transform={waxing ? undefined : `translate(${2 * C},0) scale(-1,1)`}
      />

      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(120,96,44,.45)" strokeWidth="1.2" />
    </svg>
  );
}
