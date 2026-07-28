import { dict } from './i18n';
import { useSettings } from './settings';

/** Hook: `const t = useT()`. Separato da i18n.ts, che resta puro. */
export const useT = () => dict(useSettings().settings.lang);
