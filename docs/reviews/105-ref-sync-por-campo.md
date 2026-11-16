---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-ref-sync-por-campo
commit: e8258656916af7598f418e6354e1959f8c70a220
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: bm:ref-sync grava por campo (K-383, E7.269; review E7.304)

## O que foi conferido
- Diff `ffc38fe7...e8258656` (1 commit, 6 arquivos): 103 linhas de código e teste, dentro da orientação de 150 (M14). `forge-check classe --base ffc38fe7 --head e8258656`: classe N, pareceres review e QA.
- **Pedido do cartão, item a item** (`planejarDominio` em `dominio-acelerato.ts:116-150`, chamado com `{ porCampo: true }` só em `dominio-businessmap.ts:229`):
  - campo igual ao vigente é pulado (`ins` e `fec` vazios, sem recusa nem escrita), mesmo com vigência aberta hoje: teste "campo igual ao vigente é pulado";
  - campo novo ou mudado sem vigência aberta hoje grava: teste "campo novo é gravado ao lado de campo igual";
  - campo mudado com vigência aberta hoje é recusado sozinho, com a mesma mensagem de antes, e os outros gravam: teste da recusa por campo (dublê) e o caso pg reescrito (`area_solicitante` recusado, `motivo_bloqueio` gravado, segunda carga idempotente);
  - saída com `recusados: [{campo, mensagem}]` e código 0: a entrada imprime o resultado inteiro (`ref-sync-businessmap.ts:27`) e só põe `exitCode = 1` no `catch`; no modo por campo `planejarDominio` não lança mais erro de vigência;
  - Acelerato segue tudo ou nada: `dominio-acelerato.ts:177` chama sem `opcoes`, e o ramo `if (!opcoes.porCampo) throw` mantém o `ErroDominio('vigencia')`. A ordem de checagem mudou (antes: a data retroativa no laço e a vigência aberta depois dele; agora as duas por campo, na ordem dos campos). Com mais de um campo em conflito a mensagem pode ser outra, mas a recusa e o rollback são os mesmos; os testes do Acelerato seguem verdes;
  - histórico só cresce: o SQL de escrita não mudou (INSERT de vigência e `UPDATE ... SET vigente_ate`), teste "nunca apaga" sem DELETE e sem TRUNCATE.
- **Data retroativa também passou a ser por campo.** Com `hoje < ultima` num campo que mudou, o bm:ref-sync antes lançava erro (saída 1) e agora lista o campo em `recusados` com saída 0. É coerente com "gravar por campo o que mudou" (decisão do dono de 2026-11-16 14:25) e está no teste do dublê reescrito. Só falta dizer isso na documentação (A1, A3).
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
- A1: hoje a seção ainda diz "numa transação (tudo ou nada)" e "Mesmas recusas de data do `ac:ref-sync`". Texto proposto: grava por campo; campo igual fica como está; campo mudado com vigência aberta na data, ou com data anterior à última vigência do campo, é recusado sozinho e listado em `recusados`, com saída 0, e os outros gravam. O `ac:ref-sync` (linha 220) segue tudo ou nada. É só documentação: a revalidação será pelo delta.
- A2: o campo recusado hoje e gravado amanhã com o mesmo arquivo entra sem marca T2.6 própria, e a marca fica um dia antes da mudança dele. O CHANGELOG diz que isso é intencional ("uma vez por texto"). Se a data da marca importar (por exemplo, a Causa Raiz do O14 e do O17), dá para seguir o `ac:ref-sync` e pôr a data na referência (`:<AAAA-MM-DD>`). A decisão é do arquiteto com o dono.

## Achados
- A1 (bloqueante) docs/architecture/server.md:224 · Definição de pronto não atendida: a seção do bm:ref-sync ainda diz "tudo ou nada" e "mesmas recusas do ac:ref-sync". Descrever a gravação por campo e os `recusados` com saída 0 (detalhe acima).
- A2 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:239 · versão de critério uma vez por hash, datada na carga parcial: o campo recusado que grava depois fica sem marca T2.6 na data dele. Avaliar a data na referência, como no ac:ref-sync.
- A3 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:213 · o comentário de `recusados` e o da entrada (ref-sync-businessmap.ts:12) não citam a recusa por data retroativa nem a saída 0; a linha 12 quebrou a largura dos comentários vizinhos.

## Riscos
- Saída 0 com `recusados` não vazio, como o cartão pede: o agendamento das 00:07 e quem roda à mão precisam ler `recusados` no JSON, porque o código de saída não avisa.
