# K-213: qualidade do apontamento, bits da flag e "não classificado" (pedido 087, E3.3)

Parecer do software-architect, só leitura de código; nada foi rodado contra a base, sem commit. Origem: linha M7 de `docs/analises/064-lacunas-dado-real.md` (40,0% "não classificado", 95,8% com alguma flag, 8,3% sem tipo).

**Ressalva de fonte.** A `develop` (528ae770) não está em nenhuma worktree aberta. Li o código na worktree `/home/rodrigoisensee/MetricasDSPD-052g` (branch `feature/087-k244-erro-ref-sync-apont`, saída da `develop`). Os arquivos citados abaixo pertencem ao apontamento e, pelo histórico da worktree, não foram alterados por ela; o tech-lead confere os números de linha na `develop` se for citá-los. Caminhos relativos à raiz do repositório.

## 1. Bits de `fato_apontamento.flags_qualidade` (smallint)

A ordem vem de `FLAGS_QUALIDADE` (`packages/contratos/src/apontamento.ts:55-61`); bit = `1 << índice` (`packages/metricas/src/coletor/classificarApontamento.ts:69-71`).

| Bit | Flag | Significado | Onde é calculado |
|---:|---|---|---|
| 1 | `sem-comentario` | comentário ausente, vazio ou sem nenhuma palavra após a normalização (só pontuação conta como vazio, decisão do dono 2026-11-02). Comentário é `comment` do worklog; se o campo não vier string, vale `null` = vazio | `classificarApontamento.ts:180,195`; origem do campo em `server/src/modulos/businessmap/apontamento/registro.ts:110` |
| 2 | `generico` | comentário escrito com 1 a 3 palavras (vazio não entra) | `classificarApontamento.ts:197` (`LIMITE_GENERICO_PALAVRAS = 3`, linha 63) |
| 4 | `sem-vinculo` | o subgrupo resultante é um dos dois residuais, `execucao-tecnica` ou `nao-classificado`; isto é, nenhuma regra por termo ou por tipo casou | `classificarApontamento.ts:198-199` |
| 8 | `sem-iniciativa` | a raiz do card (ou do pai) não é um card de iniciativa (`dim_card.granularidade = 'projeto'`), ou o card não está em `dim_card` (COALESCE de `rc` e `rp` nulo cai em 8). Gravado depois da classificação, preservado pela projeção (`& 24`) | `server/src/modulos/businessmap/apontamento/gravacao.ts:191-198` (preservação em `gravacao.ts:74`); leitura em `server/src/modulos/apontamento/servico.ts:21,63` (também vale `projetoId === null`) |
| 16 | `valor-atipico` | reservado: **nunca gravado**. A tela calcula na leitura: soma do dia da pessoa (só do time) acima de 10 h (pedido 067) | `packages/metricas/src/businessmap/apontamento/filtros.ts:12-32`; limite `servico.ts:15`; reserva documentada em `gravacao.ts:61` |

Consequência para a leitura dos números: a Q16 mede a coluna, então enxerga só os bits 1, 2, 4 e 8. A tela de Qualidade (`qualidade.ts:16-30`) soma também o `valor-atipico` calculado na leitura. "Completo" = nenhuma das cinco; as flags não são excludentes (`flagsNaoExcludentes: true`), então os percentuais por flag somam mais de 100%.

## 2. Regra do subgrupo "não classificado"

Código `nao-classificado`, prioridade 12, residual avaliado pelo código, não pela tabela (`classificarApontamento.ts:13,191-192`; especificação em `docs/architecture/features/059-dicionario-apontamento.md:36-37,84`).

Ordem de decisão (a primeira regra que casa vence; menor prioridade primeiro):
1. Regras por tipo e por termo do dicionário vigente (prioridades 1 a 10: Kaizen "sempre", termos por início de palavra, Incidente de Produção só com comentário vazio).
2. Nenhuma casou e há comentário: `execucao-tecnica` (prioridade 11).
3. Nenhuma casou e **não há comentário**: `nao-classificado` (prioridade 12).

Portanto "não classificado" = **apontamento sem comentário** que nenhuma regra por tipo capturou. Não mede falha do dicionário de termos: sem comentário não há texto para casar termo. O rótulo "Não classificado" (`servico.ts:19`) sugere que faltou classificar, mas o que faltou foi o comentário.

Regras por tipo só casam por `type_id` exato (`classificarApontamento.ts:189`). Se o `type_id` é `null`, nenhuma regra por tipo casa, e o apontamento sem comentário de Kaizen ou de Incidente de Produção cai em `nao-classificado` em vez de `gestao-backlog-rituais` ou `incidente-sem-detalhe`. O tipo vem do mapa `x.tipos` pelo card ou pelo pai (`coleta.ts:133-134`); sem entrada no mapa, `null`.

## 3. Leitura do M7

| Número | O que o código diz | Veredito |
|---|---|---|
| 6334 de 15826 (40,0%) "não classificado" | 40% dos apontamentos não têm comentário e nenhuma regra por tipo os capturou. A conta fecha com a flag `sem-comentario` (mesma condição, mais os que as regras de tipo de Kaizen e Incidente já classificaram) | Retrato do preenchimento **se** o campo `comment` do worklog vem preenchido na API; ver dúvida D1 |
| 15169 de 15826 (95,8%) com alguma flag | Só 657 apontamentos (4,2%) têm zero flags entre os bits 1, 2, 4 e 8. A flag `sem-vinculo` (bit 4) já cobre todo `nao-classificado` mais todo `execucao-tecnica`; somando `generico`, `sem-comentario` e `sem-iniciativa`, a cobertura de 95,8% é plausível | **Mecânica correta, mas a regra de `sem-vinculo` merece revisão**: ver dúvida D2. A Q16 não separa os bits, então não dá para dizer qual flag domina sem a distribuição por bit |
| 1310 (8,3%) sem `type_id` | `type_id` é gravado com COALESCE e só entra quando o card está no mapa de tipos da coleta (`gravacao.ts:76`, `coleta.ts:133-134`). A 064 registra "linha ainda não relida pela coleta" (`servico.ts:22`). Esses apontamentos viram "Sem tipo" e ficam fora do filtro | Lacuna de carga/releitura, não retrato. Também contamina "não classificado" (seção 2) |
| Q16 diz 0 sem iniciativa | A Q16 provavelmente conta `iniciativa_card_id IS NULL`. O bit 8 liga também quando a raiz existe mas não é iniciativa. Os dois números não se contradizem, mas "0 sem iniciativa" **não** prova que o bit 8 está desligado | Conferir bit 8 separado (pedido de medição abaixo) |

Conclusão: nada indica bug de cálculo; os bits e o subgrupo fazem o que a especificação manda. Os números são, em boa parte, o retrato do **preenchimento do comentário** (D1), amplificado por duas decisões de desenho que o dono deve ver antes de ler a tela como "qualidade": a `sem-vinculo` agrupa dois residuais de natureza diferente (D2), e o `type_id` nulo derruba regras por tipo (D3). A tela de Qualidade mostrar 95,8% "com problema" sem esse contexto induz a leitura errada.

## 4. Dúvidas de regra de negócio (ao dono; sem decisão por inferência)

**D1. O comentário vazio é de fato o retrato?** Se a API do BusinessMap devolve o worklog sem `comment` (campo ausente ou outro nome), os 40% são artefato de coleta. O código trata campo ausente como vazio (`registro.ts:110`).
Recomendação: o dono (ou o node-backend, em amostra de uma página do worklog sem gravar nada) confirma que `comment` vem preenchido nos apontamentos que a pessoa vê com texto no BusinessMap. Só depois se lê o 40% como retrato.

**D2. `sem-vinculo` deve incluir `execucao-tecnica`?** Hoje, comentário presente e sem termo do dicionário (`execucao-tecnica`) conta como "sem vínculo" e, portanto, como apontamento de má qualidade. O comentário existe; o que falta é um termo no dicionário. Isso mistura qualidade de preenchimento (da pessoa) com cobertura do dicionário (do time de métricas), e infla a flag.
Pergunta: "`execucao-tecnica` (há comentário, o dicionário não reconheceu termo) é falha de qualidade do apontamento, ou só pede ampliar o dicionário?"
Recomendação: `sem-vinculo` só para `nao-classificado`; `execucao-tecnica` fica como subgrupo informativo e vira insumo para ampliar os termos. Se o dono aceitar, é mudança de critério de cálculo: registrar com data e marcar nos gráficos (T2.6), via `ref_versao_criterio`, e atualizar `059-dicionario-apontamento.md:85`. Sem a resposta, nada muda.

**D3. Rotular `nao-classificado` como "Sem comentário"?** O rótulo atual induz a ler falha de classificação. Recomendação: o dono decide o rótulo; sem decisão, manter e acrescentar na tela a nota "sem comentário no apontamento".

## 5. Medições para fechar a dúvida (para o dono ou o devops rodar; eu não rodei)

Consultas agregadas, sem coluna de pessoa:
- contagem por bit: `count(*) FILTER (WHERE flags_qualidade & 1 > 0)` e o mesmo para 2, 4 e 8, e `= 0` (completos);
- `nao-classificado` e `execucao-tecnica` separados, e `nao-classificado` com `type_id IS NULL` versus `NOT NULL`;
- amostra, sem texto, do campo `comment` na API (D1): só a contagem de worklogs com e sem a chave.

## 6. Achados de segundo plano

- A 064 (L6, linhas 101 e 188) cita o limite de atipicidade como 16 h; o código vigente é 10 h (`servico.ts:15`, pedido 067). Os 10 dias acima de 16 h da Q19 subestimam o que a tela marca hoje. Releia a Q19 com 10 h antes de falar de atípicos.
- Nenhuma métrica aqui serve a avaliação individual: a qualidade por pessoa só existe com piso de 20 apontamentos (`qualidade.ts:16-30`), mas, com 95,8% de flag e o rótulo "Não classificado", a visão por pessoa pode ser lida como ranking de quem escreve menos. Recomendo o dono ver D1 e D2 antes de a tela ser exposta por pessoa. Isso reforça a regra de não usar a métrica como avaliação individual (CLAUDE.md).

Melhoria vista: nenhuma além das dúvidas D1 a D3.
