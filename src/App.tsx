import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './main.css';
import JogoPage from './pages/JogoPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jogo/:id" element={<JogoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
