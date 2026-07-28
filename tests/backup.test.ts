import { describe, it, expect } from 'vitest';
import { fondiBackup, type DiaryEntry } from '../src/db';

const voce = (id: string, text = 'testo'): DiaryEntry =>
  ({ id, hellenicDate: 'Hekatombaiṓn 14', gregorian: '2026-07-28', text, mood: null, ts: 1 });

const backup = (diary: unknown[], myGods?: unknown) =>
  ({ app: 'hestia', versione: 1, esportatoIl: '2026-07-29T00:00:00.000Z', diary, myGods });

describe('ripristino del diario', () => {
  it('aggiunge le voci nuove', () => {
    const f = fondiBackup([], backup([voce('a'), voce('b')]));
    expect(f.aggiunte).toBe(2);
    expect(f.daAggiungere.map((v) => v.id)).toEqual(['a', 'b']);
  });

  it('NON sovrascrive una voce già presente', () => {
    const esistenti = [voce('a', 'quello che ho scritto io')];
    const f = fondiBackup(esistenti, backup([voce('a', 'versione vecchia dal file')]));
    expect(f.aggiunte).toBe(0);
    expect(f.giaPresenti).toBe(1);
    expect(f.daAggiungere).toHaveLength(0);
  });

  it('non rimuove mai nulla: le voci non nel backup restano fuori dalla fusione', () => {
    // 'mia' esiste solo nel diario, il backup non la contiene:
    // la fusione non deve proporre nessuna cancellazione.
    const f = fondiBackup([voce('mia')], backup([voce('altra')]));
    expect(f.daAggiungere.map((v) => v.id)).toEqual(['altra']);
    expect(Object.keys(f)).not.toContain('daRimuovere');
  });

  it('salta le voci malformate senza fallire', () => {
    const f = fondiBackup([], backup([voce('ok'), { id: 'senza-testo' }, null, { text: 'senza id' }]));
    expect(f.aggiunte).toBe(1);
    expect(f.daAggiungere[0].id).toBe('ok');
  });

  it('non duplica un id ripetuto dentro lo stesso file', () => {
    const f = fondiBackup([], backup([voce('a'), voce('a')]));
    expect(f.aggiunte).toBe(1);
  });

  it('unisce "i tuoi dèi" invece di sostituirli', () => {
    const f = fondiBackup([], backup([], ['artemide', 'ecate']));
    expect(f.myGods).toEqual(['artemide', 'ecate']);
  });

  it('rifiuta un file che non è un backup di Hestía', () => {
    expect(() => fondiBackup([], { app: 'altro', diary: [] })).toThrow();
    expect(() => fondiBackup([], { app: 'hestia' })).toThrow();
    expect(() => fondiBackup([], null)).toThrow();
    expect(() => fondiBackup([], 'una stringa qualsiasi')).toThrow();
  });

  it('un backup vuoto non fa danni', () => {
    const f = fondiBackup([voce('mia')], backup([]));
    expect(f.aggiunte).toBe(0);
    expect(f.giaPresenti).toBe(0);
  });
});
