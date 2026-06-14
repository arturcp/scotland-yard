import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { getCasePreview, listCasesPublic, seedCasesIfEmpty } from './case-store.js';
import { createRoom, getRoomSummary } from './game-engine.js';
import { deleteExpiredRooms } from './persistence.js';
import { handleConnection } from './ws-handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/cases', (_req, res) => {
  res.json({ cases: listCasesPublic() });
});

app.get('/api/cases/:id', (req, res) => {
  const preview = getCasePreview(req.params.id ?? '');
  if (!preview) {
    res.status(404).json({ error: 'Caso não encontrado.' });
    return;
  }
  res.json(preview);
});

app.post('/api/rooms', (req, res) => {
  const caseId = typeof req.body?.caseId === 'string' ? req.body.caseId : '';
  if (!caseId) {
    res.status(400).json({ error: 'Selecione um caso para criar a sala.' });
    return;
  }

  try {
    const room = createRoom(caseId);
    res.status(201).json({
      code: room.code,
      caseId: room.caseId,
      caseTitle: room.caseTitle,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Não foi possível criar a sala.',
    });
  }
});

app.get('/api/rooms/:code', (req, res) => {
  const summary = getRoomSummary(req.params.code ?? '');
  if (!summary.exists) {
    res.status(404).json(summary);
    return;
  }
  res.json(summary);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  handleConnection(ws);
});

setInterval(() => {
  const removed = deleteExpiredRooms();
  if (removed > 0) {
    console.log(`Removed ${removed} expired room(s).`);
  }
}, 60 * 60 * 1000);

seedCasesIfEmpty();

server.listen(PORT, () => {
  console.log(`Game server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`Database path: ${process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'rooms.db')}`);
});
