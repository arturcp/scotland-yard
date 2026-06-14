# Deploy no Render

Este guia descreve como publicar o Scotland Yard no [Render](https://render.com) com Turso.

O repositório inclui [`render.yaml`](../render.yaml). O **Web Service** (`scotland-yard-8zor`) serve API, WebSocket **e** o frontend (`dist/`) com fallback SPA — **use essa URL para jogar**.

## URL recomendada (tudo em um serviço)

```
https://scotland-yard-8zor.onrender.com
https://scotland-yard-8zor.onrender.com/jogo/CODIGO
```

Não depende de rewrite no Static Site. Rotas como `/termos` e `/jogo/X` funcionam via Express.

---

## Configuração (`render.yaml`)

### Web Service — `scotland-yard-8zor` (principal)

| Campo | Valor |
|-------|-------|
| Build Command | `yarn --frozen-lockfile install && yarn build` |
| Start Command | `yarn server` |
| Health Check | `/api/health` |

O build gera `dist/`; o servidor Express serve os arquivos estáticos e devolve `index.html` para rotas do React.

### Variáveis de ambiente (painel)

No serviço **scotland-yard-8zor**:

```bash
TURSO_DATABASE_URL=libsql://seu-banco-sua-org.turso.io
TURSO_AUTH_TOKEN=seu-token-turso
```

`VITE_API_URL` **não é necessário** neste serviço — API e frontend estão no mesmo domínio.

### Static Site — `scotland-yard-1` (opcional / legado)

Pode manter para CDN, mas o rewrite do Render Static Site é pouco confiável (corpo vazio ou `404 Not Found` em subrotas). Se `/termos` retorna `Not Found`, use **scotland-yard-8zor**.

Para o Static Site funcionar, é preciso **sincronizar o Blueprint** no painel Render. Sem isso, as rotas do `render.yaml` não são aplicadas.

---

## Passos de deploy

1. Push do código (com `render.yaml` e servidor servindo `dist/`)
2. Render → **Blueprints** → sincronizar / aplicar alterações
3. Configurar Turso em **scotland-yard-8zor**
4. Aguardar deploy do Web Service (build inclui `yarn build`)

---

## Validar

```bash
# Frontend + API no mesmo host
curl -s https://scotland-yard-8zor.onrender.com/ | head -5
curl -s https://scotland-yard-8zor.onrender.com/termos | head -5
curl -s https://scotland-yard-8zor.onrender.com/jogo/TEST12 | head -5

# API
curl https://scotland-yard-8zor.onrender.com/api/health
```

Os três primeiros `curl` devem retornar HTML com `<script src="/assets/...">`.

Se ainda usar o Static Site:

```bash
curl -s https://scotland-yard-1.onrender.com/termos | head -5
# Só funciona após Blueprint sync + rewrite ativo; senão: "Not Found"
```

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Static Site: `Not Found` em `/termos` | Blueprint não sincronizado | Use **scotland-yard-8zor** ou sincronize Blueprint |
| Static Site: corpo vazio (`content-length: 0`) | Rewrite do painel quebrado | Use **scotland-yard-8zor** |
| App sem API no 8zor | Build sem `yarn build` | `buildCommand` deve incluir `yarn build` |
| `tsx: command not found` | devDependencies omitidas | `YARN_PRODUCTION=false yarn --frozen-lockfile install` |

---

## Plano gratuito

No free tier, o Web Service entra em sleep após ~15 minutos sem tráfego. Cold starts podem derrubar WebSockets. Para partidas longas, considere plano pago.
