import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './main.css';
import JogoPage from './jogo/[id]/index';

function HomePage() {
  return <div className="App">Home page</div>;
}

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
