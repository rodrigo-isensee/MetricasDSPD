## Objetivo
Review de segurança do back da fase 2 do pedido 011 (gatilho R-SEGURANCA: dados pessoais no O22, O26, E8 e T14), nas 3 branches por nível que o tech-lead separou e aprovou. Portão antes dos PRs. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`; branches no origin: `feature/011-fase2-estrategicas` (3aeaa3d), `feature/011-fase2-taticas` (ace8db8) e `feature/011-fase2-operacionais` (aab7a46), empilhadas a partir da develop f81567e.

## Ler
- A ADR 0020 da develop, inteira: `/home/rodrigoisensee/MetricasDSPD/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` (diretório principal, develop 48b909a, com R-1 = B e R-2 = B registradas; a mesma versão está nas 3 branches, que saem da f81567e). Não use a cópia da worktree `-011-fase2`: ela está na branch `feature/011-fase2-back`, anterior a esse registro.
- `docs/security/adr-0020-protecao-de-pessoa.md`: R-1, R-2 e M-1 a M-4.
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: "Decisões do usuário (2026-10-17, depois da retomada)" (Q-T14-10 = B).
- Os pareceres de review das 3 branches (`docs/reviews/011-fase2-<nível>.md`, em cada branch), seções de riscos (R1 das estratégicas: o E8 lê `entregas`).
- `git diff f81567e..3aeaa3d`, `git diff 3aeaa3d..ace8db8` e `git diff ace8db8..aab7a46` (só o que cada lote acrescenta).

## Entregar
- (E1, E2) Review de segurança de cada lote: nenhum dado de pessoa (id, nome, e-mail, responsável) em contrato, agregado, resposta da API, log ou mock; contagens e faixas sem reidentificação (R-1 = B no E8 e na T14); `ChaveSegmentacao` sem `pessoa`, `responsavel` nem `equipe`; o coletor fora de `exports`; o que vira pré-condição da fase 3 (o E8 lendo `entregas`, o `exports ./coletor`, o lint de import, o cadastro de membros da Q-T14-10 = B).
- (E1, E2) Um parecer por branch em `docs/security/011-fase2-<nível>.md` (`pedido:` igual ao nome do arquivo sem `.md`), gravado com Write. Você não tem como commitar: o tech-lead commita os 3 na branch de cada nível antes do PR.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1 e E1.2/E2.2 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2."; "E3.2 (forge:ux-designer): CAs na especificação."; "E4.1 (forge:react-frontend): front, depois do K-102."; "E4.2 (forge:ux-designer): revisão da interface implementada."; "E4.3 (forge:qa-engineer): QA do front."; "E9.2 (dono): merge na main."
- Fora do escopo: a fase 3 (só listar as pré-condições); os PRs (pedido 020).

## Decisões e restrições
- ADR 0020 vigente para a fase 2; decisões do usuário R-1 = B, R-2 = B e Q-T14-10 = B (pedido 011).
- Valem todas as demais decisões do usuário do pedido 011 ("Decisões do usuário" e as duas seções de 2026-10-17), sem contradição com este review: D-5' = B, Q-a = 1 passagem e Q-b = conta (O26); T14 nova = A, Q-T14-1 = B, Q-T14-9 = A (se o campo for múltiplo, conta quando o meu time estiver entre os marcados), Q-T14-5 = D e Q-T14-6 = A com o refinamento da R-1 = B (T14); D-14' = A e R-4 (T13); D-1' = A e Q-E7-1 = pró-rata por dias corridos (E7); e as da fase 1: D-8, D-6', R-1 = A (O24), D-10, R-2', P-1 = A, motivos de descarte, O19-pct = B, O20-destaque = A, O25(b) = B, T10-janela = A e B11-001 = sim; métricas por nível em lotes separados e "4-seguir".
- Dados antigos = A (pedido 011, 2026-10-16): o levantamento das `stg_` já foi feito no K-097 (0 registros em dev e homolog local, nenhum dado de pessoa; mesclado no #88, com o seu parecer). Não há nada a refazer aqui; a ressalva R-A (repetir a contagem antes da primeira coleta real) continua como pré-condição da fase 3.
- Regra inviolável do `CLAUDE.md`: nenhuma métrica serve para avaliação individual; a API (`dspd_api`) não lê colunas de pessoa.
- NÃO tocar: código, testes, branches e commits; o diretório principal. Grave os pareceres na worktree `-011-fase2`, que está na branch `feature/011-fase2-back` (o tech-lead os leva para cada branch).

## Pronto quando
- PQ-1 (arquivo): `docs/security/011-fase2-estrategicas.md`, `docs/security/011-fase2-taticas.md` e `docs/security/011-fase2-operacionais.md` na worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`.
- PQ-2 (cmd): `grep -l -E "^parecer:" /home/rodrigoisensee/MetricasDSPD-011-fase2/docs/security/011-fase2-estrategicas.md /home/rodrigoisensee/MetricasDSPD-011-fase2/docs/security/011-fase2-taticas.md /home/rodrigoisensee/MetricasDSPD-011-fase2/docs/security/011-fase2-operacionais.md` · espera: linhas=3

## Relatório
Até 8 linhas: estado (veredito por lote); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos e pré-condições da fase 3. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
