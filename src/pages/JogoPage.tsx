import { useParams } from 'react-router-dom';
import Game from '../components/Game';

function JogoPage() {
  const { id } = useParams();
  const roomCode = (id ?? '').toUpperCase();

  if (!roomCode) {
    return <p>Sala inválida.</p>;
  }

  return (
    <div className="App game-app">
      <Game roomCode={roomCode} />
    </div>
  );
}

export default JogoPage;
