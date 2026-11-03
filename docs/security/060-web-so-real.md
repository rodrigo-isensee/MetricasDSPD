---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: df21afda697d9b4e4331950adfe31ab8754d15d4
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Review de segurança: web só com dado real (pedido 060, E2.34)

Histórico: 2026-11-03, commit atualizado para df21afd; o código revisado em b85663e não mudou (depois dele entraram só pareceres, tudo em docs/).

Escopo: diff de b446021 a b85663e (P4 e a parte de web do P5), com foco em Dockerfile da web, compose de homologação, ausência de dado real na homologação, segredo no build e a nota em `docs/security/041-estabilidade.md`. Revisão estática; nenhuma ferramenta executada, nenhum `.env` aberto.

Volta 2 (bd6d6f2..b85663e): só texto de interface (rótulo "Motivo:", estado `parcial` da faixa de atenção, quebra de comentário), pareceres e a reversão da nota em `041-estabilidade.md`; Dockerfile e compose não mudaram, e o A1 anterior foi resolvido.

## Resultado
- **Dockerfile da web:** `ARG VITE_FONTE=api` (`docker/web/Dockerfile:8`) é só seletor de fonte, sem segredo. O `.dockerignore` exclui `.env` e `.env.*` (menos `.env.example`), então `COPY . .` não leva credencial. A imagem final é nginx com só o `dist`.
- **Compose de homologação:** o `web` declara `VITE_FONTE: mock` como build arg (`docker-compose.homolog.yml:81`). A porta segue em `127.0.0.1`. O bundle mock não fala com a API, sem mistura de dado real e fictício.
- **Segredo no build:** os `VITE_*` usados (`VITE_FONTE`, `VITE_API_BASE` só relativo, variáveis do mock) não são segredo.
- **Falha segura:** `VITE_FONTE` inválido lança na partida e nunca cai no mock (`App.tsx:36-40`).
- **Estado Sem dado real:** `motivo` renderizado como texto React; sem `dangerouslySetInnerHTML` em `web/src` (conferido de novo na b85663e). A faixa `parcial` nunca afirma "Nada pede atenção".
- **Regras invioláveis:** nenhuma tela traz pessoa, ranking ou mistura de BusinessMap e Acelerato.
- **Nota em 041-estabilidade.md:** a linha "Nota 060" foi revertida na volta 2; o parecer antigo volta ao texto revisado.

## Achados
- A2 (recomendado) docker/web/Dockerfile:3 · Imagens `node:24-slim` e `nginx:alpine` sem digest e nginx como root. Pré-existente, sem caminho de ataque novo desta branch; tratar com o devops-engineer em pedido próprio.

## Riscos aceitos
Nenhum.

## Lacunas
Nenhuma ferramenta (gitleaks, trivy) foi rodada aqui; as varreduras são do CI. Sem bloqueante, o parecer é aprovado.
