import { content } from './content';
import { useSettings } from '../settings';

/** Contenuti nella lingua corrente. Separato da content.ts, che resta puro. */
export const useContent = () => content(useSettings().settings.lang);
