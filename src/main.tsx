import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

// EB Garamond e non Cormorant: Cormorant non ha alcun glifo greco, e qui il greco
// (anche politonico: Ἑστία, Ἀπόλλων) è ovunque. Questi file includono i sottoinsiemi
// latin, latin-ext, greek e greek-ext con unicode-range — il browser scarica solo
// quelli che servono davvero.
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/500.css';
import '@fontsource/eb-garamond/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

import './theme/tokens.css';
import './theme/base.css';
import './theme/components.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
