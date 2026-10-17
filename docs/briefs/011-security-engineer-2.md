## Objetivo
Revalidar a segurança do lote 2 (táticas: T13, T14) sobre a branch atualizada: o seu parecer (`011-fase2-taticas.md`, aprovado sobre ace8db8) está sem commit na worktree e ficou desatualizado pelo merge da develop, pelo B11-001 do T10 e pelos ajustes do review (rodadas 2 a 4). O review está aprovado em 6eda1cc. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a `feature/011-fase2-taticas` (6eda1cc) e volte no fim.

## Ler
- O seu parecer sem commit na pasta de pareceres de segurança da worktree: `011-fase2-taticas.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 diff ace8db8 origin/feature/011-fase2-taticas -- packages server docs/api docs/contratos` (só o que mudou desde o seu parecer).
- A ADR 0020 da develop: `/home/rodrigoisensee/MetricasDSPD/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`.

## Entregar
- (E1, E2) Revisar o delta desde ace8db8 quanto a dado de pessoa: o T13, o T14 (contagens e faixas; "outros times" oculto com menos de 2 pessoas, R-1 = B) e o T10 com o B11-001 (agrupamento de nome de fornecedor, que não é pessoa); o M-1 do seu parecer (T14-M1, decidido = B pelo usuário, vale antes da fase 3).
- (E1, E2) Atualizar o parecer (`commit:` para 6eda1cc e uma seção de revalidação), gravado com a ferramenta Write; commit na `feature/011-fase2-taticas`, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E3.2 e E1.2/E2.2 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2." (vem depois desta); "E9.2 (dono): merge na main."
- (E1, E2) O lote 1 (E6, E7, E8) já foi revisado por você e mesclado na develop (#105; o seu parecer no commit ac1519e): só confirme que ele está na develop, e relate. O E7 ainda sai com R$ no back até o pedido 024, que aplica a decisão D2 = A (sem R$); não é deste lote.
- Fora do escopo, Retira do escopo original desta entrega (não do pedido): trecho do pedido 011, E1 "O22 (`primeiroToque`), O26 (`passagens`...)" e E2.3 "review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)"; motivo: a decisão do usuário de 2026-10-17 "Ordem por nível, em lotes separados" (pedido 011, "Decisão do usuário (2026-10-17)") manda revisar e entregar o lote 3 (O22, O26) só depois do lote 2; consequência: o parecer do lote 3, sem commit na worktree, é revalidado numa delegação seguinte, antes do PR das operacionais (pedido 023).
- Fora do escopo: o PR (pedido 022); a fase 3.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B de 2026-10-16; R-2 = B; T14 nova = A; Q-T14-1 = B; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B; Q-T14-9 = A; Q-T14-10 = B (cadastro de membros por time, dado de pessoa, só na fase 3; no mock o booleano é gerado direto); T14-M1 = B; D2 = A (E7 sem R$, aplicada no pedido 024); D-14' = A e R-4 (T13); D-10 = A e T10-janela = A (T10); B11-001 = sim; métricas por nível em lotes separados.
- ADR 0020 vigente para a fase 2. Regra inviolável do `CLAUDE.md`: nenhuma métrica serve para avaliação individual; a API (`dspd_api`) não lê colunas de pessoa.
- NÃO tocar: código, testes, as outras branches, o parecer das operacionais, a `main` e o diretório principal. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): nada pesado nesta etapa.

## Pronto quando
- PQ-1 (push): commit do parecer de segurança revalidado em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 show origin/feature/011-fase2-taticas:docs/security/011-fase2-taticas.md` · espera: contém '6eda1cc'

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos e pré-condições da fase 3. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
