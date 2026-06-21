import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { getCasePreview, listCasesPublic, seedCasesIfEmpty } from './case-store.js';
import { createRoom, getRoomSummary } from './game-engine.js';
import { deleteExpiredRooms, initDatabase } from './persistence.js';
import { handleConnection } from './ws-handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/cases', async (_req, res) => {
  try {
    res.json({ cases: await listCasesPublic() });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Não foi possível listar os casos.',
    });
  }
});

app.get('/api/cases/:id', async (req, res) => {
  try {
    const preview = await getCasePreview(req.params.id ?? '');
    if (!preview) {
      res.status(404).json({ error: 'Caso não encontrado.' });
      return;
    }
    res.json(preview);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Não foi possível carregar o caso.',
    });
  }
});

app.post('/api/rooms', async (req, res) => {
  const caseId = typeof req.body?.caseId === 'string' ? req.body.caseId : '';
  if (!caseId) {
    res.status(400).json({ error: 'Selecione um caso para criar a sala.' });
    return;
  }

  try {
    const room = await createRoom(caseId);
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

app.get('/api/rooms/:code', async (req, res) => {
  try {
    const summary = await getRoomSummary(req.params.code ?? '');
    if (!summary.exists) {
      res.status(404).json(summary);
      return;
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Não foi possível carregar a sala.',
    });
  }
});

const distPath = path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api|\/ws).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  handleConnection(ws);
});

setInterval(() => {
  void deleteExpiredRooms().then((removed) => {
    if (removed > 0) {
      console.log(`Removed ${removed} expired room(s).`);
    }
  });
}, 60 * 60 * 1000);

async function startServer(): Promise<void> {
  await initDatabase();
  await seedCasesIfEmpty();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Game server listening on http://0.0.0.0:${PORT}`);
    console.log(`WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
    if (fs.existsSync(distPath)) {
      console.log(`Serving frontend from ${distPath}`);
    }
    const dbUrl =
      process.env.TURSO_DATABASE_URL ??
      `file:${process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'rooms.db')}`;
    console.log(`Database URL: ${dbUrl}`);
  });
}

void startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
