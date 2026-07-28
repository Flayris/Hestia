import { Routes, Route } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { Oggi } from './routes/Oggi';
import { Calendario } from './routes/Calendario';
import { Grimorio } from './routes/Grimorio';
import { Diario } from './routes/Diario';
import { Musica } from './routes/Musica';
import { TuoiDei } from './routes/TuoiDei';

export function App() {
  return (
    <>
      <div className="colonnade" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<Oggi />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/grimorio" element={<Grimorio />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/musica" element={<Musica />} />
        <Route path="/tuoi-dei" element={<TuoiDei />} />
      </Routes>
      <TabBar />
    </>
  );
}
