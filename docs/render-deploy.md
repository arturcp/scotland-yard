# Deploy no Render

Este guia descreve como publicar o Scotland Yard no [Render](https://render.com) com **dois serviços** (backend + frontend) e banco **Turso**.

O repositório inclui um [`render.yaml`](../render.yaml) na raiz com as rotas SPA e a configuração de build. **Use o Blueprint em vez de regras manuais no painel** — regras só no dashboard podem retornar `200` com corpo vazio em subrotas como `/jogo/CODIGO`.

## Visão geral

| Serviço | Nome no Render | Tipo | Função |
|---------|----------------|------|--------|
| Backend | `scotland-yard-8zor` | Web Service | API REST + WebSocket |
| Frontend | `scotland-yard-1` | Static Site | Interface React (Vite) |

O banco de dados fica no [Turso](https://turso.tech/). Não use SQLite local em produção — o filesystem do Render é efêmero.

---

## 1. Aplicar o Blueprint (`render.yaml`)

1. Faça push do `render.yaml` para o GitHub
2. No Render: **Blueprints** → selecione o repositório → **Apply** / sincronize alterações
3. Os nomes dos serviços no YAML devem coincidir com os já criados (`scotland-yard-8zor`, `scotland-yard-1`)

### O que o `render.yaml` configura

**Backend (`scotland-yard-8zor`):**

| Campo | Valor |
|-------|-------|
| Build Command | `yarn --frozen-lockfile install` |
| Start Command | `yarn server` |
| Health Check | `/api/health` |

**Frontend (`scotland-yard-1`):**

| Campo | Valor |
|-------|-------|
| Build Command | `yarn --frozen-lockfile install && yarn build` |
| Publish Directory | `dist` |
| Rewrite SPA | `/*` e `/*/*` → `/index.html` |
| `VITE_API_URL` | Herdado de `RENDER_EXTERNAL_URL` do backend |

O WebSocket é derivado automaticamente de `VITE_API_URL` (`https://` → `wss://`). `VITE_WS_URL` é opcional.

### Remover regras manuais do painel

No Static Site **scotland-yard-1** → **Redirects/Rewrites** → **apague todas as regras** criadas no dashboard. O `render.yaml` passa a ser a fonte de verdade.

---

## 2. Variáveis de ambiente (painel)

Configure no Web Service **scotland-yard-8zor**:

```bash
TURSO_DATABASE_URL=libsql://seu-banco-sua-org.turso.io
TURSO_AUTH_TOKEN=seu-token-turso
```

Copie de `.env.example`. O Render define `PORT` automaticamente.

---

## 3. Validar o deploy

Após o deploy do Static Site:

```bash
# Deve retornar HTML com <script src="/assets/...
curl -s https://scotland-yard-1.onrender.com/ | head -5

# Deve retornar o MESMO HTML (não vazio, content-length > 0)
curl -s https://scotland-yard-1.onrender.com/termos | head -5
curl -v https://scotland-yard-1.onrender.com/jogo/TEST12 2>&1 | grep -i content-length
```

Backend:

```bash
curl https://scotland-yard-8zor.onrender.com/api/health
# {"ok":true}
```

Teste no navegador:

- Frontend: `https://scotland-yard-1.onrender.com`
- Sala: `https://scotland-yard-1.onrender.com/jogo/CODIGO`

---

## Criar serviços do zero

Se ainda não tiver serviços no Render:

1. **Blueprints** → **New Blueprint** → conecte o repositório
2. O Render cria os dois serviços a partir do `render.yaml`
3. Configure `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` no backend
4. Aguarde os dois deploys

Para renomear serviços, edite os campos `name` no `render.yaml` antes de aplicar o Blueprint.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---------|-------|---------|
| `/jogo/X` ou `/termos` em branco, `content-length: 0` | Rewrite só no painel | Usar `render.yaml`, remover regras do dashboard |
| App abre mas sala não conecta | `VITE_API_URL` ausente no build | Sincronizar Blueprint; redeploy do Static Site |
| `tsx: command not found` | devDependencies omitidas | Build: `YARN_PRODUCTION=false yarn --frozen-lockfile install` |
| `yarn start` no backend | Start Command errado | Deve ser `yarn server` |

---

## Plano gratuito

No free tier, o Web Service entra em sleep após ~15 minutos sem tráfego. Isso causa cold starts e pode derrubar conexões WebSocket. Para partidas longas, considere um plano pago.
