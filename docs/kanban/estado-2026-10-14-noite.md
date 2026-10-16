# Estado do trabalho — 2026-10-14 (noite) — ponto de retomada
Substitui o `estado-2026-10-14-tarde.md` no que for diferente. O usuário foi dormir às 21:10 e pediu "toque tudo que puder".

## Regras
- Valem as do arquivo da tarde.
- Agentes: com o usuário ausente, até 4 de forma equilibrada, sempre dentro do R-TETO.
- **Usuário (2026-10-16): o Jarvis pode subir mais de um tech-lead em paralelo quando precisar (ajustado no Forge). Cada instância cuida de uma entrega diferente.**
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
- QA: plano do 011-back gravado (docs/qa/011-back-plano.md, 80 casos). Leu um estado anterior: B11a-1, B11a-3 e o O20 já foram resolvidos em a310864 e 29b762f. Fila do node-backend, nesta ordem: SNO-005, B11b (T11), K-096, K-097. O B12 vem depois do merge da develop e da emenda C4.
- **Sustentação, volta 6 do review: reprovada** (branch atualizada com a develop em 54c4ebf; EXIT=0).
  - Bloqueante V6-1 (node-backend): o aquecimento roda no `onReady`, que tem prazo de 10 s. Se o aquecimento passar disso, a API não sobe. Correção: limitar a espera do hook a cerca de 5 s, terminar o aquecimento em segundo plano e testar com banco lento.
  - Recomendados: V6-2 e V6-3 (back); V6-4, borda das refs de foco (front).
  - V6-5: a recarga depois de cada coleta ainda leva de 160 a 560 ms. Vira o cartão K-098.
  - UX: revisar as telas a 375 px depois do SNO-001.
  - Ordem: o node-backend faz o V6-1 antes do B11b. O front e o UX entram quando houver vaga no R-TETO (a carga está em 12).
- Sustentação: UX aprovou o efeito do SNO-001 a 375 px (seção 8 de 06-revisao-implementada.md na worktree -sust, sem commit; o tech-lead commita na volta 7). Pendências para o K-075: seletor 2x2, faixa de calibração, cabeçalho a 100% (MOB-CA-9), tablet a 200%, D-04.
- K-096 e K-097: segurança aprovada (6a88742). Falta o QA (depois da Sustentação), depois o PR. Ressalva R-A (devops): repetir a contagem das stg_ antes da primeira coleta real fora do ambiente local. Entra no checklist da fase 3.
- K-096 e K-097: QA aprovado (40bba2f). Falta o tech-lead renovar o review, que o forge-check acusa como desatualizado (ADR 0020), e depois o PR. Recomendação do QA, não bloqueante: teste automatizado para o aborto da 0015; vira cartão K-099 depois do merge, para não invalidar os pareceres agora.
- **Melhoria de fábrica (Forge), segunda ocorrência:** o `diff_efetivo` do forge-check compara os cabeçalhos `@@`. Quando um merge da develop só desloca a numeração de linhas, o parecer é acusado de desatualizado (K-096: `server.md`, 162 → 170). Proposta: ignorar o número de linha dos `@@` e comparar só o conteúdo. Junta com a melhoria anterior, de invalidar o parecer só pelo escopo da entrega.
- 011: o review do B11b + B12 reprovou só pelo B11b-1 (o T11 conta entradas depois do corte). O B12 foi aprovado. O node-backend está corrigindo.
- Cartão novo K-100: adaptador da fonte real do T11 (`dim_card` e carga de 24 meses). Na fonte real, o T11 fica vazio até isso existir.
- B11c-1: o node-backend parou na regra de escalada. O núcleo do BM levou 165 ms de CPU, medido sob carga de 4 a 5 e já existente antes do 011; o B11a leva 42 ms e o Acelerato 106 ms. A API gerarBaseMockEmFases está pronta, sem commit e sem pronto rodado. O Jarvis espera a medição do C6 do front com o (a1) e as fases para levar os dois números ao architect, que decide entre fatiar e Web Worker.
- **Homolog (2026-10-17 00:50):** portão e CI de push verdes (ddf0af1). O PR de release #90 (homolog → main) foi aberto. O "Homologação aprovada" ficou verde depois do rerun (era corrida). O `perf` do #90 falhou duas vezes: Lighthouse em `/operacional?cadencia=semanal` deu 0,87 a 0,89, contra o mínimo de 0,9. É defeito real, por margem pequena.
  - Plano: a correção (a1) do B11c-1, que faz o navegador ceder antes de cada cálculo no MockFonteMetricas, não depende do 011 e deve reduzir a tarefa longa e o TBT. Se a medição do front confirmar, ela vira uma branch `fix/` a partir da develop e segue develop → homolog. Depois, o QA da candidata.
  - O merge do #90 é do usuário. Conferir se o `perf` é check exigido na main.
  - K-101: rodada noturna da main falhou em 2026-10-15; investigar (o K-094 é candidato).
- **C6 e perf do #90 (2026-10-17 01:30), decisão do architect (`notas/c6-011.md`):** caminho (b), Web Worker para a geração, o contexto e o cálculo do mock no front. O a1 não teve ganho e o a2 fica guardado como referência.
  - O Worker leva **de 2 a 3 dias**: o #90 e o 011 não ficam verdes esta noite. **Prazo ameaçado: levar ao usuário de manhã (reunião extraordinária, só o resumo).**
  - Passos 1 em paralelo:
    - 1a: devops, TBT ou LCP no artefato do Lighthouse;
    - 1b: QA, sonda `perf-api` e perfil do navegador;
    - 1c: architect, ADR do Worker como proposta;
    - 1d: node-backend, guardar o a2 e medir a primeira métrica a frio e o `gerarExtensoesMock`.
  - Depois: 2, o architect confirma o caminho; 3, `fix/` pelo tech-lead; 4, Worker pelo react-frontend; 5, review, QA, develop e homolog; 6, rebase do 011.
  - Se o 1a mostrar LCP, a correção do #90 é de render, numa `fix/` separada e mais rápida.
- #90: o devops provou que a causa é TBT de render (duas long-tasks do React, 222 e 119 ms, nos blocos da visão semanal), não a geração. Caminho (c), K-102: o react-frontend fatia ou adia o render da semanal na branch fix/perf-visao-semanal, a partir da develop. É mais rápido que o Worker e destrava o release. O Worker continua para o C6 do 011.
- K-094: review aprovado (a4718eb; a cópia na worktree foi por cp, com risco de autoria K-077). Falta o QA, que vem depois do QA final do 011, e depois o PR. Recomendação R1, não bloqueante: um teste de banco determinístico da trava. As 7 falhas do pesquisa.pg voltaram na -k094 porque o .env copiado tem a senha divergente (ação do usuário no K-095).
- **011 (2026-10-17 manhã):** a1 revertido (d73474a), com referência em `ref/c6-cede-por-metrica`; merge do #88 (4e6b29c); pronto EXIT=0 e test:pg EXIT=0; review revalidado (4c7efee). Falta o QA regravar `docs/qa/011-back.md` sobre 4e6b29c, com Write no diretório principal, depois cópia e commit. Em seguida: PR e merge.
  - O tech-lead trocou o `pedido:` do review para `011-metricas-tambem-disponiveis-back`, o mesmo id do QA desta branch, porque o forge-check pega o parecer mais recente do pedido em todas as branches pelo nome. **Informar o usuário.** Melhoria para o Forge: o cmd_pr deveria filtrar os pareceres pela branch (é a terceira observação do mesmo problema).
  - Card possível: `FatoTransicao.usuario` continua no mock, mas não existe mais no banco.
