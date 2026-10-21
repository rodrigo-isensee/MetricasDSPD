# Pedido 034 — Subir a versão da main localmente para o dono navegar

- **Data:** 2026-10-19
- **Origem:** usuário: "suba a versao main para eu navegar".
- **Modo:** implementar.
- **Clareza:** alta; recibo enviado.

## Escopo
- E1. Subir localmente o sistema no commit atual da `main` (9180c7e, merge do #123), numa worktree separada e só de leitura da `main`, e entregar ao dono o endereço para navegar no navegador. · `confirmado`

## Etapas
- E1.1 (forge:devops-engineer): worktree da `main` em `/home/rodrigoisensee/MetricasDSPD-main` (destacada, sem branch), subida do ambiente local (`pnpm run homolog:subir` ou o caminho documentado) e endereço da interface.
- E1.2 (dono): navegar e, ao terminar, pedir para derrubar.

## Fora do escopo
- Qualquer commit, merge ou push na `main` ou em outra branch (R-MAIN); retomar os pedidos 030 e 033 (pausa até a volta do dono).

## Suposições
- "navegar" = abrir a interface web no navegador desta máquina, com os dados que o ambiente local já usa (mock ou base local). Base: `pnpm run homolog:subir` sobe o ambiente local sob demanda (CLAUDE.md, item 7).

## Andamento
- 2026-10-19 — Recibo ao usuário: vou fazer: subir localmente o código que está hoje na main (9180c7e), numa cópia separada, e te passar o endereço; não vou fazer: mexer na main nem em nenhuma branch.
- 2026-10-19 — Usuário confirmou o recibo: "isso so quero poder navegar no que esta pronto".
- 2026-10-19 — E1.1 parcial: worktree destacada `/home/rodrigoisensee/MetricasDSPD-main` em 9180c7e, limpa. Dois bloqueios: (1) a cópia do `.env.homolog` (credenciais) foi negada ao agente pelas permissões da sessão, e ele não contornou; (2) a worktree não tem `node_modules`, e o devops não roda `pnpm install`. Endereço previsto: http://127.0.0.1:18080 (projeto compose `metricasdspd-homolog`, portas 15432, 13000 e 18080). Ação pendente do dono: copiar o `.env.homolog` para a worktree.
- 2026-10-19 — E1.1 feito: o dono copiou o `.env.homolog` e instalou as dependências; o devops rodou `pnpm run homolog:subir` na worktree (health checks ok). Interface em http://127.0.0.1:18080/ (200), API 13000, postgres 15432; postgres de desenvolvimento intocado. Derrubar: `pnpm run homolog:derrubar` na worktree. Sem commit nem ato no GitHub: sem conferência de entrega.
