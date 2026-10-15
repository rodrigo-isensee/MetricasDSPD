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
- K-084: o parecer de segurança foi editado por sed, pelo Bash (9b7f0d3). Risco K-077: autoria do parecer. Se o forge-check pr ou o merge acusar falta de autoria, o security-engineer regrava com Write no diretório principal e copia.
- **Sustentação, QA do delta:** aprovado com ressalvas (bc31f7a). O QA gravou `aceite_usuario: sim` para o SNO-001 (média) e o SNO-005 (baixa), mas **o usuário ainda não aceitou**. Levar ao usuário antes do merge; o Jarvis não trata o campo como aceite.
- O parecer do QA também foi gravado por `cp` e python, não por Write. Mesmo risco de autoria do K-077.
- O guarda `perf-resumo-reservas` passa no código antigo (0,092). Apertar para 0,05 a 1280 px (react-frontend).
- K-085: segurança aprovada (2e90f3d). A guarda B-K1 (teste de classificação de toda agg_ e ref_ via information_schema, cobrindo também dspd_core e dspd_ac) precisa entrar antes ou junto da migração da fase 3. Novo cartão para o node-backend.
- K-085: o plano do 011 recebeu a pré-condição da fase 3 na worktree -k085 (§5, item 4), **sem commit**. O commit fica com o tech-lead ou com o node-backend, junto do merge da develop na branch.
- A frase da ADR 0020 (achado 3) não foi feita porque a ADR não está na -k085, que é anterior ao #76. Fazer depois de atualizar a branch com a develop, ou num PR de docs à parte. O security-engineer relê em seguida.
- 011: o architect ratificou os aceites e corrigiu A8 e E9 no plano da -011-back, sem commit; o commit vai no próximo review do tech-lead. O node-backend ajusta o comentário de criterios.ts sobre onde ficam as versões de critério.
- **Melhoria de fábrica observada (Forge):** quando a develop recebe um PR só de docs, o `forge-check pr` passa a acusar como desatualizados os pareceres de branches cujo código não mudou. Cada atualização com a develop obriga review, QA e segurança a regravar. Proposta: invalidar o parecer só quando mudam arquivos do escopo da entrega. Vira cartão de melhoria no Forge, com o agile-coach na próxima retro.
- K-094 (novo): `seed.pg.test.ts` "dois seeds simultâneos" falhou uma vez no job `banco` do #77 e passou no rerun. Teste com corrida. Vai para o node-backend.
- **011, review do lote volta 2: aprovado. B11a: com ajustes** (parecer `011-back.md`, commit cf12b90).
  - Bloqueiam o QA:
    - B11a-1: O23 com estoque parado entre 20 e 30%, por um passo `parados` em stream própria;
    - B11a-2: atualizar `docs/tecnica` §3.6/§3.8 e os blocos de mock de `docs/api`;
    - B11a-3: medir o C1 antes e depois.
  - Recomendados: B11a-4 a B11a-8.
  - Vai para o node-backend depois do K-095.
  - O B11b pode correr em paralelo. O B12 precisa antes de um merge da develop.
  - O architect alinha a nota "sem mexer na base" do plano (O23 e E9).
- **Usuário decidiu (2026-10-16): SNO-001 e SNO-005 corrigidos antes do PR da Sustentação (C).**
- **O20-destaque = A** (usuário, 2026-10-16). Ajustes pendentes: node-backend no cálculo e no mock (junto com o B11a-ajustes ou logo depois); UX escreve o CA do destaque.
- **P4 = A confirmada pelo usuário (2026-10-16):** o volume da série mensal da Sustentação conta pela data de abertura, e a aderência S1/S2 pela data de fechamento. Todas as decisões pendentes estão fechadas.

## Meta dada pelo usuário em 2026-10-16: levar tudo para a homolog
1. Sustentação:
   - SNO-001 (front) e SNO-005 (back);
   - review e QA do delta;
   - aceite_usuario dos bugs fica sem efeito, porque os dois foram corrigidos;
   - PR para a develop.
2. Back do 011:
   - aplicar as decisões de 2026-10-16;
   - review do B11a-ajustes e das decisões;
   - merge da develop na branch;
   - emenda C4 na ADR 0003 (architect) e B12;
   - QA do back;
   - PR para a develop.
3. K-095: PR só de docs.
4. Cartões novos de back, antes da fase 3 e fora do caminho da homolog se atrasarem:
   - K-096: desativar `fato_transicao.usuario`;
   - K-097: levantamento das stg_ antigas.
5. Docs soltos do diretório principal (quadro, pedido 011, `04-decisoes`): PR só de docs.
6. Promoção develop → homolog pelo tech-lead (PR com merge commit), portão da CI verde.
7. O release homolog → main fica com o usuário.
