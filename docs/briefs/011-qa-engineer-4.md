## Objetivo
QA do lote 2 (táticas: T13, T14, mais o B11-001 no T10) do back da fase 2 do pedido 011, portão obrigatório antes do PR (R-QA). Review aprovado (rodada 4, 6eda1cc sobre bfe0b2d) e segurança aprovada (967cb2c sobre 6eda1cc). Branch `feature/011-fase2-taticas` (967cb2c, no origin), que já tem a develop com o lote 1 (#105). Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a branch do lote antes de testar e volte no fim.

## Ler
- `docs/qa/011-back-plano.md`: os casos do T10, T13 e T14.
- Na branch do lote: `docs/reviews/011-fase2-taticas.md` (rodadas 1 a 4) e `docs/security/011-fase2-taticas.md` (o B-1: a propriedade P6, nenhum valor de pessoa na saída, não alcança a T14 porque roda sem equipe no filtro).
- `docs/architecture/features/metricas-tambem-disponiveis.md` da develop (`/home/rodrigoisensee/MetricasDSPD/...`): §2 do T10, T13 e T14.

## Entregar
- (E1, E2) QA do lote 2: `pnpm run pronto` na branch do lote; os casos do plano para o T13 (vínculo predecessor com outro quadro, vigente antes da entrega, por granularidade), o T14 (só "meu time: k de n"; "outros times" somado, nunca listado, oculto quando somar menos de 2 pessoas) e o T10 com o B11-001 (grafias que diferem só em caixa e espaços viram um fornecedor; a versão de critério de 2026-10-17 marcada); o B-1 da segurança: estender a propriedade P6 para alcançar a T14 com equipe no filtro.
- (E1, E2) Parecer em `docs/qa/011-fase2-taticas.md` (`pedido: 011-fase2-taticas`), gravado com a ferramenta Write (nunca por script), com o teste e o parecer em commits separados (o teste primeiro), `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E3.2, E1.2/E2.2 e E1.3/E2.3 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E9.2 (dono): merge na main."
- Fora do escopo: o QA do lote 3 (operacionais), que vem depois deste, pela decisão do usuário de lotes por nível; corrigir código (bug volta ao autor); o PR (pedido 022).

## Decisões e restrições
- Decisões do usuário do pedido 011 que este lote exercita: B11-001 = sim; Q-T14-9 = A; Q-T14-10 = B (cadastro de membros por time, só na fase 3); Q-T14-1 = B; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B de 2026-10-16; T14 nova = A; T14-M1 = B (vale antes da fase 3; não muda o mock agora); D-14' = A e R-4 (T13); D-10 = A e T10-janela = A (T10); métricas por nível em lotes separados.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nada de pessoa na saída; sem comparação entre times; cálculo pela biblioteca (ADR 0011); mudança de critério registrada com data (T2.6). ADR 0020, ADR 0003.
- NÃO tocar: código de produção, `web/`, `.github/`, a `main`, o diretório principal, as outras branches e o parecer de segurança das operacionais (sem commit na worktree). Sem `--no-verify`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): `pronto` uma vez, com `uptime` e `free -m` antes e load abaixo de 4.

## Pronto quando
- PQ-1 (push): commits do teste da P6 e do parecer em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `pnpm run pronto` na branch do lote, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/qa` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
