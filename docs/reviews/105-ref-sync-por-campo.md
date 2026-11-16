---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-ref-sync-por-campo
commit: 20ef77beec16d6788053a0d973db69eb02753e7c
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: bm:ref-sync grava por campo (K-383, E7.269; review E7.304, revalidação E7.312)

## O que foi conferido
- Diff `ffc38fe7...e8258656` (1 commit, 6 arquivos): 103 linhas de código e teste, dentro da orientação de 150 (M14). `forge-check classe --base ffc38fe7 --head e8258656`: classe N, pareceres review e QA.
- **Pedido do cartão, item a item** (`planejarDominio` em `dominio-acelerato.ts:116-150`, chamado com `{ porCampo: true }` só em `dominio-businessmap.ts:229`):
  - campo igual ao vigente é pulado (`ins` e `fec` vazios, sem recusa nem escrita), mesmo com vigência aberta hoje: teste "campo igual ao vigente é pulado";
  - campo novo ou mudado sem vigência aberta hoje grava: teste "campo novo é gravado ao lado de campo igual";
  - campo mudado com vigência aberta hoje é recusado sozinho, com a mesma mensagem de antes, e os outros gravam: teste da recusa por campo (dublê) e o caso pg reescrito (`area_solicitante` recusado, `motivo_bloqueio` gravado, segunda carga idempotente);
  - saída com `recusados: [{campo, mensagem}]` e código 0: a entrada imprime o resultado inteiro (`ref-sync-businessmap.ts:27`) e só põe `exitCode = 1` no `catch`; no modo por campo `planejarDominio` não lança mais erro de vigência;
  - Acelerato segue tudo ou nada: `dominio-acelerato.ts:177` chama sem `opcoes`, e o ramo `if (!opcoes.porCampo) throw` mantém o `ErroDominio('vigencia')`. A ordem de checagem mudou (antes: a data retroativa no laço e a vigência aberta depois dele; agora as duas por campo, na ordem dos campos). Com mais de um campo em conflito a mensagem pode ser outra, mas a recusa e o rollback são os mesmos; os testes do Acelerato seguem verdes;
  - histórico só cresce: o SQL de escrita não mudou (INSERT de vigência e `UPDATE ... SET vigente_ate`), teste "nunca apaga" sem DELETE e sem TRUNCATE.
- **Data retroativa também passou a ser por campo.** Com `hoje < ultima` num campo que mudou, o bm:ref-sync antes lançava erro (saída 1) e agora lista o campo em `recusados` com saída 0. É coerente com "gravar por campo o que mudou" (decisão do dono de 2026-11-16 14:25) e está no teste do dublê reescrito. Faltava dizer isso na documentação (A1, A3), o que a volta 20ef77be fez.
- **Regras invioláveis.** BusinessMap e Acelerato não se misturam (cada sync lê e escreve o próprio esquema; o planejador é compartilhado e puro). Nenhum dado de pessoa: `recusados` traz o nome do campo (vem do arquivo versionado, com coluna em enum fechado) e a data; nenhum valor de opção. Histórico não é sobrescrito.
- **Gatilho de segurança (R-SEGURANCA): não há.** Não há migração, GRANT, SQL novo nem consulta com entrada nova. As consultas são as mesmas, parametrizadas, com o papel `dspd_ref` de antes. A entrada continua com o caminho do arquivo fixo e a data validada (`dataCivilValida`), e a mensagem de erro segue fixa. `forge-check classe` não pede parecer de segurança. O que muda é a semântica de escrita dentro da transação: parte do arquivo grava e parte é recusada. É regra de negócio, já coberta por este review e pelo QA.
- **Ferramentas, no head (cópia `git archive` fora da worktree, para não atrapalhar o QA):** `eslint` nos 5 arquivos `.ts` do diff passou sem erro. O `format:check` do projeto não cobre `server/`.
- **Teste novo e mutantes**, todos rodados na cópia com `vitest run` em `dominio-businessmap.test.ts`, `dominio-acelerato.test.ts` e `dominio-acelerato.qa.test.ts`; fonte restaurada depois de cada um:
  - M1 `if (!opcoes.porCampo) throw` trocado por `if (false) throw` (o Acelerato vira por campo): morto, 4 falhas;
  - M2 `throw` sempre (o BM volta a tudo ou nada): morto, 3 falhas;
  - M3 sem a checagem de vigência aberta (`else if (false)`): morto, 3 falhas;
  - M4 sem a checagem de data retroativa (`if (false)`): morto, 3 falhas;
  - M5 o campo recusado grava mesmo assim: morto, 2 falhas;
  - M6 retroativo sem `ins.length + fec.length > 0` (recusa campo igual): morto, 1 falha.
  Sem mutante: os 4 arquivos de domínio (`dominio-businessmap`, `dominio-acelerato`, `dominio-acelerato.qa`, `dominio-motivo-bloqueio`) com 147 testes verdes.
- **Banco.** O `dominio-businessmap.pg.test.ts` foi pulado aqui (7 skipped): este ambiente não tem a URL do PostgreSQL de teste. Ele fica para o QA e para o CI do PR. Pelo brief, o autor rodou o `test:pg` completo e teve 13 falhas: 1 dele, corrigida (o arquivo de domínio passou 7 de 7), e 12 em `apontamento-rota.pg.test.ts` e `migracoes.pg.test.ts`, que o diff não toca e que o autor atribui a execuções concorrentes na base de teste, sem ter confirmado. Não confirmei nem descartei essa causa. Não há PR, então não afirmo CI verde: o CI do PR decide antes do merge.
- Commit `e8258656`: Conventional Commits em português, com pedido, cartão e etapa no assunto. O CHANGELOG foi atualizado.

## Detalhe dos achados
- A1: a seção dizia "numa transação (tudo ou nada)" e "Mesmas recusas de data do `ac:ref-sync`". Texto proposto: grava por campo; campo igual fica como está; campo mudado com vigência aberta na data, ou com data anterior à última vigência do campo, é recusado sozinho e listado em `recusados`, com saída 0, e os outros gravam. O `ac:ref-sync` (linha 220) segue tudo ou nada. Atendido em 20ef77be.
- A2: o campo recusado hoje e gravado amanhã com o mesmo arquivo entra sem marca T2.6 própria, e a marca fica um dia antes da mudança dele. O CHANGELOG diz que isso é intencional ("uma vez por texto"). Se a data da marca importar (por exemplo, a Causa Raiz do O14 e do O17), dá para seguir o `ac:ref-sync` e pôr a data na referência (`:<AAAA-MM-DD>`). A decisão é do arquiteto com o dono.

## Achados
- A1 (bloqueante) docs/architecture/server.md:224 · resolvido em 20ef77be. Definição de pronto não atendida: a seção do bm:ref-sync dizia "tudo ou nada" e "mesmas recusas do ac:ref-sync". Agora descreve a gravação por campo, os dois motivos de recusa, os `recusados` e a saída 0.
- A2 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:239 · versão de critério uma vez por hash, datada na carga parcial: o campo recusado que grava depois fica sem marca T2.6 na data dele. Avaliar a data na referência, como no ac:ref-sync.
- A3 (recomendado) server/src/entradas/ref-sync-businessmap.ts:12 · atendido em parte em 20ef77be: os comentários de `dominio-businessmap.ts:212` e `:216` já citam os dois motivos. O comentário da entrada ainda cita só a vigência aberta, não fala da saída 0 e continua mais largo que os comentários vizinhos. Fica para quando o arquivo for tocado de novo.

## Riscos
- Saída 0 com `recusados` não vazio, como o cartão pede: o agendamento das 00:07 e quem roda à mão precisam ler `recusados` no JSON, porque o código de saída não avisa.

## Revalidação do delta e8258656..20ef77be (2026-11-16)

Li só a saída de `forge-check parecer delta docs/reviews/105-ref-sync-por-campo.md`. Arquivos no domínio: `docs/architecture/server.md`, `server/src/modulos/businessmap/dominio-businessmap.ts` e `server/src/modulos/referencia/dominio-acelerato.ts`. Os pareceres (`docs/qa/`, `docs/reviews/`) ficam fora do domínio.

- `server.md:224`: a seção do bm:ref-sync agora descreve a gravação por campo e os dois motivos de recusa (data anterior à última vigência do campo e vigência já aberta na data para o mesmo código). Diz também que `recusados` traz só o nome do campo e a mensagem fixa, que a saída é 0 e que a versão de critério só é registrada quando algo grava. O `ac:ref-sync` segue tudo ou nada, com código 1. Isso fecha o A1.
- `dominio-businessmap.ts:212` e `:216` e `dominio-acelerato.ts:115` e `:146`: só comentários (JSDoc e `//`), agora com os dois motivos. Nenhuma linha executável mudou no delta e não há guarda nova nem mudada. Por isso não rodei mutante nem suíte: os mutantes M1 a M6 acima valem para o mesmo código.
- O A3 foi atendido em parte (ver Achados). O A2 segue recomendado, com a decisão do arquiteto e do dono.
- Sem PR, não afirmo CI verde. A suíte inteira e o `test:pg` ficam para o CI do PR antes do merge. Isso inclui as 12 falhas fora do diff, em `apontamento-rota.pg.test.ts` e `migracoes.pg.test.ts`, que o autor atribui a execuções concorrentes sem ter confirmado.

Parecer: **aprovado** em 20ef77be.
