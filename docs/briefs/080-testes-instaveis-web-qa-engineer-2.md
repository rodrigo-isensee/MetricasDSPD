Agente destino: forge:qa-engineer
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: qa   Cobre: E1.3

## Objetivo
QA de novo da E1.1 do pedido 080 (K-192), na ponta 8784bf130f3290f5bfb6e0c9d30f8e20d1782605 (volta 2: o L3-01 espera a altura da página estabilizar antes do axe; o `gap-y-1` foi revertido e `web/` não muda), depois do seu parecer reprovado (3c3a7aff). Review aprovado (64b2ed0c6e47a0c5cecac1eabe214b24dc897ee7). O PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/080-testes-instaveis-web`; o arquivo sem commit `docs/ux/080-revisao-leia-junto.md` não se inclui nem se apaga.

## Ler
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo` e, do `## Histórico`, as linhas do seu QA reprovado, da causa (DECISÃO TÉCNICA de 08:46), do teto e do A2 (08:49), da volta 2 e do review da volta 2.
- Na worktree: o seu parecer anterior `docs/qa/080-testes-instaveis-web.md` e `docs/reviews/080-testes-instaveis-web.md` (achados).

## Entregar
- "E1.3 (qa-engineer): QA." (E1.3)
- (E1) (E1.3) K-173: sem código novo desde o seu parecer anterior (5 de 5 no teste do O20); pela DECISÃO TÉCNICA de 2026-11-07 10:11 deste pedido, registre no parecer que a evidência anterior vale e confira que `web/` não tem diferença contra a base.
- (E2) (E1.3) K-192: rodar o E2E L3-01 (`e2e/tests/operacional-lote3.spec.ts`) localmente com Chromium, 20 rodadas a 1280 e 20 a 375 (`--repeat-each`, workers=1), e registrar quantas passaram; conferir que o helper espera por condição (sem tempo fixo), que nenhuma regra do axe, timeout, retry nem scroll ao topo mudou, que `LeiaJunto.tsx` está igual à base e que `web/`, `server/`, `packages/` e `.github` não têm diferença contra a base; o A2 do seu parecer anterior (375 px por tempo) saiu do escopo pela DECISÃO TÉCNICA de 2026-11-07 08:49 deste pedido: registre se reaparecer, sem reprovar por ele.
- (E1) (E1.3) Escrever o parecer `docs/qa/080-testes-instaveis-web.md` pela ferramenta Write (sem editar depois, nem com sed), com `pedido: 080-testes-instaveis-web`, `branch: feature/080-testes-instaveis-web`, `commit: 8784bf130f3290f5bfb6e0c9d30f8e20d1782605`, veredito e o bloco `## Achados` só com linhas de achado (achado com até 300 caracteres; regra citada só pelo ID); commit só do parecer com `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-080-v2.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho; não incluir nem apagar `docs/ux/080-revisao-leia-junto.md`; regrave o parecer inteiro); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/080-testes-instaveis-web`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/080-testes-instaveis-web`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 08:26 deste pedido); sem PR.

## Decisões e restrições
- 2026-11-07 10:11: DECISÃO TÉCNICA (Jarvis): com o gap-y-1 revertido na volta 2 (LeiaJunto.tsx igual à base), a E1.4 (revisão de interface) deixou de se aplicar: a tela não muda; o parecer de interface sem commit (056d/docs/ux/080-revisao-leia-junto.md) não entra no PR. O K-173 (E1) fica com a evidência do QA anterior (5 de 5), sem código novo.
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres de review e de interface, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; deixou de se aplicar (DECISÃO TÉCNICA de 2026-11-07 10:11 deste pedido: a volta 2 não muda a tela)
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056d/docs/qa/080-testes-instaveis-web.md`
- PQ-2 (cmd): `grep -c '^commit: 8784bf130f3290f5bfb6e0c9d30f8e20d1782605' /home/rodrigoisensee/MetricasDSPD-056d/docs/qa/080-testes-instaveis-web.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/080-testes-instaveis-web` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
