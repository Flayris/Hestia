import { useSettings, type Lang } from './settings';

/**
 * Traduzione dell'INTERFACCIA.
 *
 * I contenuti del Grimorio (schede degli dèi, feste, riti, concetti) restano in
 * italiano: sono ~150.000 caratteri di prosa scritta e verificata sulle fonti,
 * e vanno tradotti a parte con la stessa cura, non a macchina.
 */

const it = {
  // navigazione
  tabToday: 'Oggi', tabCalendar: 'Calendario', tabGrimoire: 'Grimorio', tabDiary: 'Diario',

  // impostazioni
  settings: 'Impostazioni',
  appearance: 'Aspetto', light: 'Chiaro', dark: 'Scuro',
  language: 'Lingua', italian: 'Italiano', english: 'Inglese',
  deityTheme: 'Tema divino',
  defaultTheme: 'Oro di casa (predefinito)',
  yourName: 'Il tuo nome',
  namePlaceholder: 'scegli il tuo nickname',
  close: 'Chiudi',

  // home
  moonPhase: 'Fase lunare',
  dayOfMonth: (d: number, n: number) => `giorno ${d} di ${n} del mese lunare`,
  todayDedication: 'Dedica di oggi',
  todayFestival: 'Festa di oggi',
  thisWeek: 'Questa settimana',
  music: 'Musica', todayDiary: 'Diario di oggi', yourGods: 'I tuoi dèi',
  hide: 'Nascondi',

  // scala del tempo
  today: 'oggi', tomorrow: 'domani', dayAfter: 'dopodomani',
  inDays: (n: number) => `fra ${n} giorni`,
  sacredDay: 'giorno sacro',
  yourGodDay: 'è il giorno di uno dei tuoi dèi',
  deipnonSub: 'la Cena di Ecate chiude il mese',
  noumeniaSub: (gods: string) => `il mese si apre con ${gods}`,

  // calendario
  atticCalendar: 'Calendario ateniese',
  weekdays: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
  prevMonth: 'Mese precedente', nextMonth: 'Mese successivo',
  backToToday: '↩ torna a oggi',
  intercalary: 'Mese intercalare: quest’anno ellenico ha 13 lunazioni.',
  legendRite: 'rito o dedica', legendFestival: 'festa', legendYours: 'un tuo dio',
  calendarNote: 'Il mese inizia con la Noumenía (luna nuova) e finisce col Deîpnon (luna scura); date calcolate sul fuso attuale.',
  noumeniaDesc: 'la luna nuova apre il mese.',
  deipnonDesc: 'luna scura, l’ultimo giorno del mese.',
  festival: 'Festa', godsOfDay: 'Dèi del giorno',
  ordinaryDay: 'Giorno ordinario del mese.',
  hellenicYear: (a: number, b: number) => a === b ? `anno ellenico ${a}` : `anno ellenico ${a}–${b}`,

  // grimorio
  grimoire: 'Grimorio',
  tabGods: 'Dèi', tabRites: 'Riti', tabFestivals: 'Feste', tabOther: 'Altro',
  entries: (n: number) => `${n} voci`,
  backToCategories: '← categorie',
  domains: 'Domini', symbols: 'Simboli e attributi', offerings: 'Offerte',
  backThen: 'Nell’antichità',
  nowYouCan: 'Oggi puoi',
  invocation: 'Invocazione', formula: 'Formula da pronunciare',
  source: 'Fonte: Theoi ↗',
  honouredGods: 'Dèi onorati',
  monthN: (n: number) => `mese ${n}`,
  addToYours: (n: string) => `Aggiungi ${n} ai tuoi dèi`,
  removeFromYours: (n: string) => `Togli ${n} dai tuoi dèi`,

  // categorie
  cat: {
    olimpi: ['Dèi Olimpi', 'I dodici e gli dèi del cielo'],
    ctonii: ['Dèi Ctonii', 'Oltretomba e mondo sotterraneo'],
    marini: ['Dèi Marini', 'Mare, onde e acque'],
    titani: ['Titani e Astri', 'Titani, sole, luna, aurora'],
    primordiali: ['Primordiali', 'Le origini del cosmo'],
    rustici: ['Nature e Campagne', 'Pan, ninfe, spiriti dei boschi'],
    personificati: ['Personificazioni', 'Muse, Grazie, Destino, Sorte'],
    eroi: ['Eroi', 'Culto degli eroi e patroni'],
  } as Record<string, [string, string]>,

  // fasi lunari
  phases: ['Luna nuova', 'Crescente', 'Primo quarto', 'Gibbosa crescente',
    'Luna piena', 'Gibbosa calante', 'Ultimo quarto', 'Calante'],

  // diario
  diary: 'Diario', diaryToday: 'Oggi',
  diaryPlaceholder: 'Cosa senti oggi…',
  save: 'Salva', deleteEntry: 'Elimina voce',
  diaryEmpty: 'Nessuna voce ancora. Col tempo potrai rileggere cosa sentivi all’ultima Noumenía.',
  mood: (n: number) => `Umore ${n}`,

  // musica
  forPractice: 'Per la pratica',
  yourLinks: 'I tuoi link',
  yourLinksSoon: 'Qui potrai salvare le tue playlist.',
  musicNote: 'Solo collegamenti esterni: nessuna musica è contenuta nell’app.',

  // i tuoi dèi
  noneChosen: 'Nessuno scelto: i selezionati si evidenziano nel calendario.',
  chosen: (n: number) => `${n} scelti`,

  // date
  weekdayNames: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  monthNames: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
};

type Dict = typeof it;

const en: Dict = {
  tabToday: 'Today', tabCalendar: 'Calendar', tabGrimoire: 'Grimoire', tabDiary: 'Diary',

  settings: 'Settings',
  appearance: 'Appearance', light: 'Light', dark: 'Dark',
  language: 'Language', italian: 'Italian', english: 'English',
  deityTheme: 'Divine theme',
  defaultTheme: 'Household gold (default)',
  yourName: 'Your name',
  namePlaceholder: 'choose your nickname',
  close: 'Close',

  moonPhase: 'Moon phase',
  dayOfMonth: (d: number, n: number) => `day ${d} of ${n} of the lunar month`,
  todayDedication: 'Today’s dedication',
  todayFestival: 'Today’s festival',
  thisWeek: 'This week',
  music: 'Music', todayDiary: 'Today’s diary', yourGods: 'Your gods',
  hide: 'Hide',

  today: 'today', tomorrow: 'tomorrow', dayAfter: 'in two days',
  inDays: (n: number) => `in ${n} days`,
  sacredDay: 'sacred day',
  yourGodDay: 'it’s the day of one of your gods',
  deipnonSub: 'Hekate’s Supper closes the month',
  noumeniaSub: (gods: string) => `the month opens with ${gods}`,

  atticCalendar: 'Attic calendar',
  weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  prevMonth: 'Previous month', nextMonth: 'Next month',
  backToToday: '↩ back to today',
  intercalary: 'Intercalary month: this Hellenic year has 13 lunations.',
  legendRite: 'rite or dedication', legendFestival: 'festival', legendYours: 'one of your gods',
  calendarNote: 'The month opens with the Noumenía (new moon) and closes with the Deîpnon (dark moon); dates computed in your current time zone.',
  noumeniaDesc: 'the new moon opens the month.',
  deipnonDesc: 'dark moon, the last day of the month.',
  festival: 'Festival', godsOfDay: 'Gods of the day',
  ordinaryDay: 'An ordinary day of the month.',
  hellenicYear: (a: number, b: number) => a === b ? `Hellenic year ${a}` : `Hellenic year ${a}–${b}`,

  grimoire: 'Grimoire',
  tabGods: 'Gods', tabRites: 'Rites', tabFestivals: 'Festivals', tabOther: 'More',
  entries: (n: number) => `${n} entries`,
  backToCategories: '← categories',
  domains: 'Domains', symbols: 'Symbols and attributes', offerings: 'Offerings',
  backThen: 'In antiquity',
  nowYouCan: 'Today you can',
  invocation: 'Invocation', formula: 'Words to say',
  source: 'Source: Theoi ↗',
  honouredGods: 'Gods honoured',
  monthN: (n: number) => `month ${n}`,
  addToYours: (n: string) => `Add ${n} to your gods`,
  removeFromYours: (n: string) => `Remove ${n} from your gods`,

  cat: {
    olimpi: ['Olympian Gods', 'The twelve and the gods of the sky'],
    ctonii: ['Chthonic Gods', 'The underworld and what lies beneath'],
    marini: ['Sea Gods', 'Sea, waves and waters'],
    titani: ['Titans and Stars', 'Titans, sun, moon, dawn'],
    primordiali: ['Primordial', 'The origins of the cosmos'],
    rustici: ['Nature and Countryside', 'Pan, nymphs, spirits of the woods'],
    personificati: ['Personifications', 'Muses, Graces, Fate, Fortune'],
    eroi: ['Heroes', 'Hero cult and patrons'],
  },

  phases: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
    'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],

  diary: 'Diary', diaryToday: 'Today',
  diaryPlaceholder: 'What do you feel today…',
  save: 'Save', deleteEntry: 'Delete entry',
  diaryEmpty: 'No entries yet. In time you’ll be able to reread what you felt at the last Noumenía.',
  mood: (n: number) => `Mood ${n}`,

  forPractice: 'For practice',
  yourLinks: 'Your links',
  yourLinksSoon: 'Here you’ll be able to save your own playlists.',
  musicNote: 'External links only: no music is bundled in the app.',

  noneChosen: 'None chosen: the ones you pick are highlighted in the calendar.',
  chosen: (n: number) => `${n} chosen`,

  weekdayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'],
};

const DICT: Record<Lang, Dict> = { it, en };

export const dict = (lang: Lang): Dict => DICT[lang];

/** Hook: `const t = useT()` e poi `t.grimoire`, `t.entries(7)`. */
export function useT(): Dict {
  return DICT[useSettings().settings.lang];
}
