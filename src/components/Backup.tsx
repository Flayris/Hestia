import { useRef, useState } from 'react';
import { Button } from './ui';
import { esporta, importa } from '../db';
import { useT } from '../i18n';

/**
 * Salvataggio e ripristino del diario — SPEC.md §8.
 * Su iOS il sistema può liberare lo spazio dati di un sito: il diario è
 * l'unica cosa che non si può riscaricare, quindi dev'essere esportabile.
 */
export function Backup({ onImported }: { onImported: () => void }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [esito, setEsito] = useState<string | null>(null);

  const scarica = async () => {
    const dati = await esporta();
    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hestia-diario-${dati.esportatoIl.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setEsito(t.backupDone(dati.diary.length));
  };

  const carica = async (file: File) => {
    try {
      const r = await importa(JSON.parse(await file.text()));
      setEsito(t.restoreDone(r.aggiunte, r.giaPresenti));
      onImported();
    } catch (e) {
      setEsito(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div>
      <div className="wrap">
        <Button variant="ghost" onClick={scarica}>{t.backupSave}</Button>
        <Button variant="ghost" onClick={() => input.current?.click()}>{t.backupRestore}</Button>
      </div>

      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void carica(f);
          e.target.value = '';
        }}
      />

      {esito && <p className="t-second" style={{ marginTop: 'var(--s3)' }}>{esito}</p>}
    </div>
  );
}
