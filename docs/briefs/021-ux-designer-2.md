## Objetivo
Reconferir a interface do front do lote 1 (estratégicas) depois dos ajustes do autor (8d6999c) e da volta 2 do review (aprovada), antes do QA. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (ae3ea92).

## Ler
- Na worktree: a sua revisão `docs/ux/revisao-011-front-estrategicas.md` (achados A-2 a A-15).
- Na worktree: `web/src/features/complementares/estrategicas.tsx` e `packages/contratos/src/cartoes.ts` (seção nova).

## Entregar
- (E1) Conferir no código os achados da sua revisão: A-2 (título "Onde o parque se concentra, e qual o risco de continuidade?" e id `concentracao-do-parque`), A-3 a A-5, A-12 e os baixos A-6, A-7, A-8, A-13 e A-14; aceitar ou não o A-4 do E6 provisório (ordem por deslize, porque o contrato ainda não traz a data de conclusão); registrar na sua revisão uma seção "Reconferência", gravada com Write, com o veredito final.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.3 (forge:qa-engineer): QA do front do lote 1." (vem depois desta reconferência).
- Fora do escopo: mudar código; o nome do E7 ("Entregas por sistema", A-10), que ainda depende de confirmação do usuário; o commit (o tech-lead commita na branch); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B e D2 = A (pedido 011); título da seção = A (pedido 021).
- Regras invioláveis do `CLAUDE.md`.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e as outras worktrees; a especificação (já alinhada e commitada em ccb9443).

## Pronto quando
- PQ-1 (cmd): `grep -n -i "Reconferência" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/revisao-011-front-estrategicas.md` · espera: linhas>=1

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
