/**
 * Astronomia — Jean Meeus, *Astronomical Algorithms*, 2ª ed.
 * Cap. 49 (fasi lunari) e cap. 27 (solstizi).
 *
 * Nessuna dipendenza: questo file è puro calcolo, riusabile tale e quale
 * se un giorno l'app migrasse a Expo.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;
const sin = (deg: number) => Math.sin(rad(deg));
const cos = (deg: number) => Math.cos(rad(deg));

/** ΔT: differenza fra Tempo Dinamico e UTC. ~70 secondi in quest'epoca. */
const DELTA_T_DAYS = 70 / 86400;

/** Durata media della lunazione (Meeus 49.1). */
export const SYNODIC_MONTH = 29.530588861;

/**
 * Istante della congiunzione (luna nuova) numero `k`, in Giorno Giuliano UTC.
 * `k = 0` è la luna nuova del 6 gennaio 2000; k cresce di 1 per lunazione.
 */
export function newMoonJD(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;

  // Tempo medio della fase (Meeus 49.1)
  let jde = 2451550.09766 + SYNODIC_MONTH * k
    + 0.00015437 * T2
    - 0.000000150 * T3
    + 0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;           // eccentricità terrestre
  const M = 2.5534 + 29.10535670 * k                      // anomalia media del Sole
    - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp = 201.5643 + 385.81693528 * k                  // anomalia media della Luna
    + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  const F = 160.7108 + 390.67050284 * k                   // argomento di latitudine
    - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  const O = 124.7746 - 1.56375588 * k                     // nodo ascendente
    + 0.0020672 * T2 + 0.00000215 * T3;

  // Correzioni periodiche per la luna NUOVA (Meeus, tabella di p. 351)
  jde +=
    -0.40720 * sin(Mp)
    + 0.17241 * E * sin(M)
    + 0.01608 * sin(2 * Mp)
    + 0.01039 * sin(2 * F)
    + 0.00739 * E * sin(Mp - M)
    - 0.00514 * E * sin(Mp + M)
    + 0.00208 * E * E * sin(2 * M)
    - 0.00111 * sin(Mp - 2 * F)
    - 0.00057 * sin(Mp + 2 * F)
    + 0.00056 * E * sin(2 * Mp + M)
    - 0.00042 * sin(3 * Mp)
    + 0.00042 * E * sin(M + 2 * F)
    + 0.00038 * E * sin(M - 2 * F)
    - 0.00024 * E * sin(2 * Mp - M)
    - 0.00017 * sin(O)
    - 0.00007 * sin(Mp + 2 * M)
    + 0.00004 * sin(2 * Mp - 2 * F)
    + 0.00004 * sin(3 * M)
    + 0.00003 * sin(Mp + M - 2 * F)
    + 0.00003 * sin(2 * Mp + 2 * F)
    - 0.00003 * sin(Mp + M + 2 * F)
    + 0.00003 * sin(Mp - M + 2 * F)
    - 0.00002 * sin(Mp - M - 2 * F)
    - 0.00002 * sin(3 * Mp + M)
    + 0.00002 * sin(4 * Mp);

  // Correzioni planetarie supplementari
  const A: [number, number][] = [
    [0.000325, 299.77 + 0.107408 * k - 0.009173 * T2],
    [0.000165, 251.88 + 0.016321 * k],
    [0.000164, 251.83 + 26.651886 * k],
    [0.000126, 349.42 + 36.412478 * k],
    [0.000110, 84.66 + 18.206239 * k],
    [0.000062, 141.74 + 53.303771 * k],
    [0.000060, 207.14 + 2.453732 * k],
    [0.000056, 154.84 + 7.306860 * k],
    [0.000047, 34.52 + 27.261239 * k],
    [0.000042, 207.19 + 0.121824 * k],
    [0.000040, 291.34 + 1.844379 * k],
    [0.000037, 161.72 + 24.198154 * k],
    [0.000035, 239.56 + 25.513099 * k],
    [0.000023, 331.55 + 3.592518 * k],
  ];
  for (const [amp, ang] of A) jde += amp * sin(ang);

  return jde - DELTA_T_DAYS;   // da Tempo Dinamico a UTC
}

/** Numero di lunazione approssimato per un dato anno decimale. */
export const kFromYear = (year: number) => (year - 2000) * 12.3685;

/* -------------------------- solstizio d'estate -------------------------- */

const SOLSTICE_TERMS: [number, number, number][] = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186],
  [182, 27.85, 445267.112], [156, 73.14, 45036.886], [136, 171.52, 22518.443],
  [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
  [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417],
  [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029],
  [14, 199.76, 31436.921], [12, 95.39, 14577.848], [12, 287.11, 31931.756],
  [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];

/**
 * Istante del solstizio di giugno, in Giorno Giuliano UTC (Meeus cap. 27).
 *
 * Il brief ammetteva il 21 giugno fisso. Calcolarlo davvero costa poco ed evita
 * un errore di un mese intero negli anni in cui una Noumenía cade a ridosso del
 * solstizio: la data fissa farebbe partire l'anno con una lunazione di scarto.
 */
export function juneSolsticeJD(year: number): number {
  const Y = (year - 2000) / 1000;
  const jde0 = 2451716.56767 + 365241.62603 * Y
    + 0.00325 * Y * Y + 0.00888 * Y ** 3 - 0.00030 * Y ** 4;

  const T = (jde0 - 2451545.0) / 36525;
  const W = 35999.373 * T - 2.47;
  const dLambda = 1 + 0.0334 * cos(W) + 0.0007 * cos(2 * W);

  let S = 0;
  for (const [a, b, c] of SOLSTICE_TERMS) S += a * cos(b + c * T);

  return jde0 + (0.00001 * S) / dLambda - DELTA_T_DAYS;
}
