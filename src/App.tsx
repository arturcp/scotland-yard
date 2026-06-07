import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './main.css';
import JogoPage from './pages/JogoPage';
import HomePage from './pages/HomePage';
import PrivacidadePage from './pages/PrivacidadePage';
import TermosPage from './pages/TermosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jogo/:id" element={<JogoPage />} />
        <Route path="/termos" element={<TermosPage />} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
