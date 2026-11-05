---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l7-calendario
commit: 025ec57b46016414602e75ca9b7650ca651cd44b
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---
# Code review: 069 L7-a, arquivo versionado do calendário e ref:sync-calendario (K-220)

## Parecer

Aprovado. O lote entrega o que o desenho (seção "Lote L7-a") e a ADR 0027 pedem: o arquivo `docs/architecture/fontes/calendario.json` com um calendário por domínio, o módulo `server/src/modulos/referencia/calendario.ts` e a entrada `ref:sync-calendario`. Nada de cálculo muda nas métricas (o L7-b é outro lote); muda só a aba Apontamento, e só depois de o dono rodar o comando.

## O que foi lido

- Diff `origin/develop...025ec57` (dois commits: e4964de só a ADR 0027; 025ec57 o lote), o desenho e a ADR 0027.
- Arquivo do calendário: `dspd-businessmap` e `dspd-acelerato`, `offset_minutos` -180, 26 feriados `nacional` em cada (52 datas), aplicações `businessmap/fluxo`, `businessmap/apontamento` e `acelerato/sustentacao`. O teste unitário afirma que as datas são exatamente as de `FERIADOS_NACIONAIS`, sem data nova (decisão do dono "A"). Os nomes dos feriados são conferência do QA.
- Carregador: esquema zod `strict` em todos os níveis; data pela `dataCivilValida`; escopo no enum igual ao `CHECK` da 0010; classe num conjunto fechado por domínio; aplicação que aponta para calendário de outro domínio é recusada (BusinessMap e Acelerato não se misturam); nome, data e aplicação repetidos recusados. A validação do arquivo inteiro e o planejamento (`planejarCalendario`, puro) vêm antes de qualquer escrita, e a gravação fica numa transação só.
- Gravação: só INSERT e `UPDATE (vigente_ate)`; `ref_feriado` com `ON CONFLICT DO NOTHING` sobre a chave `calendario_id, data`, então o feriado gravado nunca muda (divergência só contada em `feriadosDivergentes`); offset diferente do gravado é recusado; vigência que não é posterior à última aplicação ou anterior à última versão do calendário é recusada. Idempotente: sem diferença, nada é escrito nem versionado. Sem GRANT novo (o `dspd_ref` já tem o que precisa).
- Versão de critério por domínio: uma `ref_versao_criterio` por domínio e hash (`069:calendario:<domínio>:<sha256>`), `vigente_desde` = a data do comando, só no domínio que mudou; `ref_versao_criterio_metrica` com `METRICAS_CALENDARIO` do domínio (24 ids do BusinessMap; S1, S4, S9, S10 e EI_SUST no Acelerato). `apontamento-capacidade` fica fora porque o id não existe no catálogo da aba, como o desenho condiciona. A conferência da lista contra as chamadas de calendário é do QA.
- Entrada: data padrão em horário de Brasília, data inválida ou argumento a mais sai com código 2; erro de banco ou de configuração sai com mensagem fixa, sem URL, senha nem texto do banco; `pool.end()` no `finally`.
- Desvio aceito: o `export` de `textoSeguro` em `dominio-acelerato.ts:37` é o reaproveitamento que o desenho manda (mesma decisão do L2-a); nenhuma mudança de comportamento.
- Testes: unidade do esquema, do planejador e da gravação por dublê (transação, ausência de DELETE, idempotência, feriado novo, troca de calendário, ROLLBACK na recusa); pg de carga idempotente, segunda carga, recusa sem gravar, feriado imutável e papel sem UPDATE nem DELETE em `ref_feriado`; rota do apontamento com feriado carregado (um dia útil a menos e a versão em `criterios`). Os testes pg não rodaram no sandbox do autor (ECONNREFUSED); a prova deles é o `test:pg` do CI no PR, e o merge só sai com ele verde.
- Ferramentas: o autor relata testes unitários verdes com cobertura 100%; não refeitos aqui.
- Regras invioláveis: arquivo sem dado de pessoa; nada individual; um calendário e uma versão por domínio; histórico append-only; mudança de critério com data (T2.6).
- Segurança: sem gatilho (desenho e decisão técnica do Jarvis); nenhum cartão para o security-engineer.
- Teto M14: 317 linhas de código (calendario.ts 280, entrada 30, index 4, dominio-acelerato 2, package.json 1) e 413 de teste, total 730 (`git diff --numstat --no-renames`), acima do teto. Exceção aceita neste review: um comportamento só (a entrada nova e o seu carregador), dividir em validação e gravação deixaria um PR com código sem uso, e 57% do volume é teste. A exceção depende da linha no corpo do PR (A1).

## Achados

- A1 (recomendado) server/src/modulos/referencia/calendario.ts:1 · 730 linhas de código e teste, acima do teto M14; exceção aceita aqui, desde que o corpo do PR traga `teto: excedido, 730 linhas, um comportamento (a entrada nova e o carregador), 57% teste`. PR sem a linha volta.
- A2 (recomendado) server/src/modulos/referencia/calendario.ts:232 · o SELECT de `calendario_id` por nome repete o que `lerEstado` já leu (`estado.calendarios`); dá para usar o id do estado e consultar só os novos. Não devolve.
