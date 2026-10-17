## Objetivo
Ajustes do front do lote 1 (estratégicas) pedidos pelo review (reprovado, 2 bloqueantes) e pela revisão de UX (aprovada com ressalvas), num brief só, mais o título novo da seção que o usuário escolheu. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (515714c).

## Ler
- Na worktree: `docs/reviews/011-front-estrategicas.md` (bloqueantes B-1 e B-2; recomendados R-2 e R-3) e `docs/ux/revisao-011-front-estrategicas.md` (achados A-2 a A-5 e A-12, e os baixos da seção de achados).
- `docs/pedidos/021-front-do-011-por-nivel.md`, seção "Decisões do usuário".

## Entregar
- (E1) B-1: a frase de leitura do E7 (`estrategicas.tsx:275-276`) não pode dizer "abaixo de 20" quando o total do período passa de 20; teste novo para o caso de todos os sistemas abaixo de 20 com total acima.
- (E1) B-2: corrigir a §11 de `docs/tecnica/arquitetura-front.md` para o estado atual (sem `COMPLEMENTARES_011`, sem o fallback para `COM_EXTENSAO_MOCK`, catálogo resolvido).
- (E1) A-2: título da seção nova em `packages/contratos/src/cartoes.ts` = "Onde o parque se concentra, e qual o risco de continuidade?" (decisão do usuário), com o id da seção sem "custo"; atualizar testes e âncoras que usem o id antigo.
- (E1) A-3 a A-5 e A-12 da revisão de UX: E9 com gráfico, leitura e tabela contando a mesma coisa; E9 e E6 ordenados por data no front; unidade na linha do P85 do E9; altura do gráfico do E7 com muitos sistemas. Os baixos da revisão, se forem só texto ou layout.
- (E1) R-2 e R-3 do review, se couberem sem mudar contrato.
- (E1) Commits na branch, `git add` por caminho, push.
- Fora do escopo, etapas seguintes do pedido 021 (citadas de "## Etapas"): "E1.4 (forge:tech-lead): code review do front do lote 1." (revalida B-1 e B-2); "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)." (reconfere); "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: o R-1 do review (contrato do E8 e do E9 no back, pedido 024); o achado A-1 da UX (a especificação do E8, com o ux-designer); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B e D2 = A (pedido 011); título da seção = A (pedido 021, 2026-10-17).
- Decisão técnica do time (pedido 021): `packages/contratos/src/cartoes.ts` e os testes de contagem do catálogo podem ser tocados; o resto de `packages/`, não.
- Regras invioláveis do `CLAUDE.md`. Orçamento de performance: ADR 0003.
- NÃO tocar: `server/`, o resto de `packages/`, `.github/`, a `main`, o diretório principal, a worktree `-011-fase2` e os pareceres de review e de UX. Sem `--no-verify`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): `pronto` e o E2E do Estratégico uma vez, com `uptime` e `free -m` antes e load abaixo de 4. Chromium no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.

## Pronto quando
- PQ-1 (push): commits dos ajustes em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run pronto`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `grep -n -F "Onde o parque se concentra" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/packages/contratos/src/cartoes.ts` · espera: linhas>=1
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short -- web packages e2e docs/tecnica` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (item por item: B-1, B-2, A-2 a A-5, A-12, R-2, R-3); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
