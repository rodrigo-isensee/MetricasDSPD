---
tipo: review
contrato: 1
pedido: 089-apontamento-qualidade-d2-d3
branch: feature/089-apontamento-d2-d3
commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---

# Code review: 089 D2 e D3 do apontamento (back-end: servidor e biblioteca)

Escopo: diff `129fc3d5..2ea9c636` (19 arquivos, +146/-52), contra o plano `docs/analises/089-plano-apontamento-d2-d3.md` e o CLAUDE.md. Testes dos arquivos tocados rodados: `apontamento-classificador`, `apontamento-dicionario`, `apontamento-rota`, `criterios-apontamento` (4 arquivos, 130 testes, verdes). Os `.pg` não rodaram (sem banco), ficam para o QA.

## Conferência contra o plano e as regras
- Regra única no classificador puro (`classificarApontamento.ts`): `sem-vinculo` só para `nao-classificado`; o servidor não repete a regra. Conforme o plano (seção 2).
- Histórico: nenhum UPDATE em massa nem máscara na leitura; a releitura gera versão nova na staging pelo hash (`registro_sha256` inclui `flags_qualidade` e `versao_dicionario`), a antiga fica, e os bits 8 e 16 seguem preservados. O teste novo prova que a máscara nova muda o hash. Regra "nunca sobrescrever histórico" cumprida.
- T2.6: critério `089:sem-vinculo-so-sem-comentario` entra por INSERT idempotente pela `referencia` (teste confere que não há UPDATE/DELETE e que a data vem do argumento, não fixa), sem editar as linhas 059 e 067. A versão do dicionário mudou (`2026-11-10-v3`) e o rótulo de fallback também. Conforme.
- GRANT por coluna: as colunas usadas (`codigo`, `rotulo`, `incluido_por_versao_id`, `versao_id`, `metrica_id`) estão em `COLUNAS_API_APONTAMENTO`; nenhuma coluna de pessoa nem texto livre; o teste proíbe `v.referencia` e `vigente_ate` na consulta. Sem gatilho de segurança.
- Contrato, código do achado e id `nao-classificado` inalterados (decisão do plano 4.1).

## Desvios do plano
1. **Rótulo vigente por `DISTINCT ON (codigo) ... ORDER BY codigo, incluido_por_versao_id DESC`** em vez de `vigente_ate IS NULL`: aceito. `vigente_ate` não está no GRANT do papel e o plano não previa migração; `incluido_por_versao_id` é crescente e está no GRANT, então a linha mais recente do código é a vigente. Efeito colateral aceito e documentado no comentário: código retirado do dicionário mantém o último rótulo (rotula histórico).
2. **Família do critério pela métrica `apontamento-dicionario`** em vez de `referencia`: aceito, pelo mesmo motivo (`referencia` fora do GRANT). A métrica é registrada na mesma entrada, e a precedência dicionário > calendário > achados está comentada e testada (`dicionario-`, `calendario-`, `achados-`). Corrige o defeito A do plano (marca T2.6 não chegava à tela com dado real).

## Versão de critério e ordem de implantação
O código está claro: a data de vigência é argumento da entrada `criterios-apontamento <data>` (comentário diz que, para o 089, é a data da primeira varredura completa, Q3) e o plano fixa a sequência `ref:sync` → `criterios-apontamento <data>` → coleta de 12 meses. Falta só essa sequência estar escrita fora do plano (A1).

## Achados
- A1 (recomendado) docs/api/apontamento.md:1 · a ordem de implantação (1 `ref:sync` do dicionário v3, 2 `criterios-apontamento <data da primeira varredura completa>`, 3 coleta com janela de 12 meses; oráculo: zero linhas ativas com `subgrupo_codigo = 'execucao-tecnica'` e bit 4, zero com `versao_dicionario` diferente da vigente) só existe em `docs/analises/` (sem commit). Registrar numa nota de implantação do PR ou em `docs/architecture/features/059-dicionario-apontamento.md`, para quem opera não depender do plano.
- A2 (recomendado) server/tests/apontamento-rota.pg.test.ts:268 · `lerCriterios` e `lerRotulosSubgrupo` só têm prova de texto de SQL com dublê (`DISTINCT ON`, `incluido_por_versao_id DESC`); o `CASE` de família e o desempate do rótulo precisam de teste no Postgres (o pg-test de `lerCriterios` foi estendido, mas não rodou). Pendente do QA: rodar os `.pg` e o teste da releitura (append-only, bits 8 e 16), que o node-backend deixou fora da lista.
- A3 (recomendado) server/src/modulos/apontamento/repositorio.ts:111 · as marcas T2.6 ficam em duas datas se o `ref:sync` rodar em dia anterior ao da varredura completa (a versão do dicionário leva a data da carga, a do critério 089 a da varredura): duas marcas `dicionario-` para a mesma mudança. Não bloqueia; vale a nota na implantação (A1) para rodar os passos 1 e 2 no mesmo dia.

Nenhum achado bloqueante.

## Parecer
Aprovado. Pequeno, uma classe de comportamento, guardas com teste do ramo (`sem-vinculo` ligado só no `nao-classificado`, comentário não reconhecido sem flag), sem dado pessoal e sem sobrescrita de histórico. Os pareceres de QA e de segurança, quando houver, são independentes deste.
