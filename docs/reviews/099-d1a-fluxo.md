---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-fluxo-chamado
commit: 54d69ddc26823ce5c2c4e30de4bc20576939c397
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-14
---
# Code review: D1a do 099, fluxo do chamado em dim_chamado (E3.247)

Diff lido: `git diff origin/develop...54d69ddc` (15 arquivos, 3 commits: `5abfbfe5`, `a853e860`, `54d69ddc`). Tamanho: cerca de 143 linhas de código e teste (`git diff --numstat`), dentro da orientação M14; um comportamento.

## Ferramentas (citadas, não refeitas)
- CI do head `54d69ddc` verde: run 43667674559 (suíte completa e os `.pg`, que não rodam aqui sem banco).
- `server` `vitest run` de `acelerato-projetor`, `migracoes.estatico` e `acelerato-l9c.pg` (`--maxWorkers=2`): 35 passaram, 4 pulados (o `.pg`, sem banco local).
- Mutante na guarda `normalizador.ts:136` (`distintos.size > 1` para `> 2`): morto por 2 testes de `acelerato-projetor.test.ts` (o de dois workflows e o do projetor). Fonte restaurada.

## Conferência
- **Migração 0038 tem caminho de volta:** `down` é `DROP COLUMN IF EXISTS fluxo`, sem dado perdido de origem (coluna derivada, refeita pelo projetor). Coberta pelo ida e volta inteiro de `migracoes.pg.test.ts:36` (down de todas e up). Checksum novo, 0037 intocada, snapshot e contagem estática (523) atualizados.
- **Histórico:** `ADD COLUMN ... NULL` sem reescrever linha; `dim_chamado_versao` e staging não mudam; só a projeção ganha a coluna (teste prova que a versão não a recebe).
- **Exclusão de `fluxo` em `acelerato-l9c.pg.test.ts:25` não afrouxa o teste:** antes da 0038 a coluna não existia, então nunca esteve na comparação; `to_jsonb(d) - 'fluxo'` tira só essa chave e todas as demais colunas seguem comparadas antes e depois, nos dois lados pela mesma função. `to_jsonb` ainda guarda o timestamp com precisão do banco (mais fiel que o `Date` do driver). Sem a exclusão o teste quebraria só porque a subida recria a coluna, o que não é objeto do L9-c.
- **Regra de negócio:** fluxo é o único `descricao_workflow` não vazio; mais de um dá nulo e conta `fluxo_multiplo`, sem escolher (não é inferência). Fonte só do Acelerato; nada do BusinessMap.
- **GRANT:** `gerarGrants` deriva do esquema; `fluxo` não está em `COLUNAS_PESSOA`, então o `dspd_api` a lê pela regra geral. Segurança é do `security-engineer`, não refeita.
- **Helper `migracoesDesde`/`quantasDesde`:** tira a dependência de "a última é a N" dos `.pg`; correto (lista o diretório, ordena e inverte).

## Achados
- A1 (recomendado) server/src/modulos/acelerato/normalizador.ts:136 · `fluxo_multiplo` soma por versão do staging no lote, não por chamado; mesmo critério de `sem_agente` (`normalizador.ts:157`), mas o CHANGELOG e o teste falam em "chamado": alinhar o texto.
- A2 (recomendado) server/tests/acelerato-l9c.pg.test.ts:51 · comentário "desfaz a 0037, a 0036 e a 0035" ficou velho: agora desfaz da última até a 0035 (inclui a 0038).
- A3 (recomendado) server/tests/pesquisa.pg.test.ts:145 · o esperado `migracoesDesde(13)` vem da mesma listagem de diretório que o migrador usa; ainda prova a ordem do down, mas deixou de pegar uma migração faltando no diretório. Aceitável; fica registrado.

## Entregar
- E3.247: review do D1a, este parecer. Sem item pendente.

## Parecer
Aprovado no head `54d69ddc`.
