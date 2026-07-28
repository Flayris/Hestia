import type { ReactNode } from 'react';
import { Label } from './ui';
import { useT } from '../useT';

/* Blocchi ricorrenti delle schede — SPEC.md §3.3 */

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Label>{title}</Label>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

export function TextBlock({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return <Block title={title}><p className="t-body">{text}</p></Block>;
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <Block title={title}>
      <ul className="dotted">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </Block>
  );
}

/** Invocazione o formula rituale: citazione rientrata, in serif. */
export function Invocation({ text, title }: { text?: string; title?: string }) {
  const t = useT();
  if (!text) return null;
  title = title ?? t.invocation;
  return (
    <Block title={title}>
      <blockquote className="invocation">{text}</blockquote>
    </Block>
  );
}

export function Source({ url }: { url?: string }) {
  const t = useT();
  if (!url) return null;
  return (
    <a className="source-link" href={url} target="_blank" rel="noreferrer">
      {t.source}
    </a>
  );
}
