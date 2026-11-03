---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: bd6d6f239916c31e2e90b31870c76ddc4c819c38
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Review de segurança: web só com dado real (pedido 060, E2.34)

Escopo: diff de b446021 a bd6d6f2 (P4 e a parte de web do P5), com foco em Dockerfile da web, compose de homologação, ausência de dado real na homologação, segredo no build e a nota em `docs/security/041-estabilidade.md`. Revisão estática; nenhuma ferramenta executada, nenhum `.env` aberto.

## Resultado
- **Dockerfile da web:** `ARG VITE_FONTE=api` (`docker/web/Dockerfile:8`) é só seletor de fonte, sem segredo. O `.dockerignore` exclui `.env` e `.env.*` (menos `.env.example`), então `COPY . .` não leva credencial. A imagem final é nginx com só o `dist`.
- **Compose de homologação:** o `web` declara `VITE_FONTE: mock` como build arg (`docker-compose.homolog.yml:81`), sem outro valor. A porta segue em `127.0.0.1`. O bundle mock não fala com a API, então não há mistura de dado real e fictício.
- **Segredo no build:** `VITE_*` entra no bundle público; os únicos usados são `VITE_FONTE`, `VITE_API_BASE` (só caminho relativo, falha na partida se absoluta, `App.tsx:28-32`) e as variáveis do mock. Nenhum segredo.
- **Falha segura:** `VITE_FONTE` inválido lança na partida e nunca cai no mock (`App.tsx:36-40`). O E2E fixa `VITE_FONTE=mock` no build (`e2e/playwright.config.ts:44`, `:54`).
- **Estado Sem dado real:** `motivo` da API é renderizado como texto React (`EstadoSemDadoReal.tsx`); sem `dangerouslySetInnerHTML` em `web/src`. Resposta validada por `semDadoRealSchema` antes do uso.
- **Regras invioláveis:** nenhuma tela nova traz pessoa, ranking ou mistura de BusinessMap e Acelerato.

## Achados
- A1 (recomendado) docs/security/041-estabilidade.md:24 · A nota "Nota 060" reescreve um parecer assinado no commit c61b6c1 sem mudar o `commit:`, e o parecer deixa de refletir o que foi revisado. Sai: reverter a linha; o aviso fica em `front-via-api.md`.
- A2 (recomendado) docker/web/Dockerfile:3 · Imagens `node:24-slim` e `nginx:alpine` sem digest e nginx como root. Pré-existente, sem caminho de ataque novo desta branch; tratar com o devops-engineer em pedido próprio.

## Riscos aceitos
Nenhum.

## Lacunas
Nenhuma ferramenta (gitleaks, trivy) foi rodada aqui; as varreduras são do CI. Sem bloqueante, o parecer é aprovado.
