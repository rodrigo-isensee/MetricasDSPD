# Estado do trabalho — 2026-10-14 (noite) — ponto de retomada
Substitui o `estado-2026-10-14-tarde.md` no que for diferente. O usuário foi dormir às 21:10 e pediu "toque tudo que puder".

## Regras
- Valem as do arquivo da tarde.
- Agentes: com o usuário ausente, até 4 de forma equilibrada, sempre dentro do R-TETO.
- Suposições provisórias (P-1, Q-a, Q-b, Q-E7-1) estão no pedido 011. Levar ao usuário na volta.

## Frentes e próximo passo
1. **Sustentação (K-072+K-073)**, worktree `-sust`:
   - review aprovado (67624ba); QA em andamento;
   - depois: revisão de UX, texto da A6 = B no front, PR para a develop, promoção para a homolog.
2. **Teste vermelho IF-A (K-083)**, branch `fix/e2e-if-a`:
   - o react-frontend investiga; depois vêm review, QA e merge;
   - o merge destrava o #74 (ADR 0003, orçamento móvel).
3. **Pedido 011, back (K-078)**, worktree `-011-back`:
   - o B1 está com o node-backend; depois, B2 a B12 em ordem, com review a cada cartão ou lote;
   - a ADR 0020 precisa do review do security-engineer antes da fase 2.
4. **Docs sem commit no diretório principal** (branch `docs/orcamento-movel`):
   - pedido 011, `02-especificacao`, `04-decisoes`, plano vigente, ata de revisão, ADR 0020, `data-model`, adendo da Sustentação;
   - vão num PR de docs depois do #74.
5. **Fila do front:** K-074 (depois que a Sustentação entrar), K-075, front do 011.

## Ações do usuário
`~/MetricasDSPD-local/pendencias-do-usuario.md`: push dos 3 PRs do Forge e registro da versão 0.13.0.

## Notas para as próximas delegações do back do 011 (review do B1, aprovado)
- Depois do B2, o node-backend aplica os ajustes R1 a R4 do parecer `011-back`:
  - R1: o teste aninhado do O21;
  - R2: o regex de equipe passa a cobrir `porEquipe`, `equipeId` e `quadro`;
  - R3: o lint cita a P-T6, não a ADR 0020;
  - R4: a data futura em `O2.md`.
- No B3, o `pctDoTotal` do O19 usa n = bloqueios (R6). Se for pedido sobre dias úteis, vira pergunta ao usuário.
- No B4 e no B5, testar que a faixa do O20 e do O21 nunca é uma equipe (R5).
- O architect alinha o texto do plano a `taxaSchema` (`{k, n, taxa}`, e `{itens, pct}` no E7).
- O E9 do plano (§2, com `deslizeDiasUteis` e `naData`) diverge do `resultadoE9` do B1 (com `idadeDiasUteis` e `faixa`). O tech-lead e o architect conferem no B5 (E7 e E9) qual dos dois segue a especificação.

## Sustentação: revisão de UX (aprovada com ressalvas, `06-revisao-implementada.md`)
- Depois das correções SNO-002, SNO-004 e A6, o react-frontend faz a volta de UX:
  - D-01: h2 dentro de h2 na faixa "Pede atenção";
  - D-02: anúncio aria-live também em Voltar, nos links e no hash;
  - baixos D-03, D-05, D-06 e D-08;
  - D-04 depende de verificação visual.
- O UX reconfere depois.
- D-09 (série da Sustentação por data de fechamento × abertura): antes de corrigir a especificação, o architect confirma nos documentos qual data vale. Se os documentos não decidirem, vira pergunta ao usuário. Na fila do R-TETO.
- QA do K-083 (IF-A): na fila do R-TETO.
- B4: o mock dá k = 0 no T12, porque o gerador não cria bloqueio antes do início nem retorno ao backlog. O tech-lead decide no review do lote B2 a B4 se isso entra no B11 (extensão do mock).

## Para o review do lote B2 a B9 do 011 (tech-lead)
Prioridade: decidir sobre o mock (B11 antecipado?). Os dados não exercitam T12, O21, O25, E9 nem o destaque do O20 em "Todas".

Pontos a revisar:
- O25(c): o aviso de preenchimento ignora o período.
- O20(b): papel misto conta como execução.
- O20: o Backlog pode ser o destaque.
- O20: a fotografia foi regravada por fora do `aceitas.json` (0e426e3).
- O20: no teste do QA `filtros.intensivo.test.ts`, o INV-F7 ganhou uma exceção. Precisa do QA.
- O20(c): a janela do destaque é o período do filtro. A especificação fala em "entre o início e o fim do período"; as 4 semanas são só do exemplo.
- B3: aceite do VISAO_GERAL.
