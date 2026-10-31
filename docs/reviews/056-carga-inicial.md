---
tipo: review
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: 521dd1fa2e5a535f83c3e6e42b3e08256cf2f025
parecer: reprovado
revisor: tech-lead
data: 2026-10-31
---

# Code review: carga inicial do ref_dominio do Acelerato (056, E4.29, K-190)

Escopo: `git diff 0783caa...521dd1f` (10 arquivos, +662 -6), commits 7ec659d (listas do §12, arquivo de domínio) e 521dd1f (comando `ac:ref-sync`). O commit seguinte da branch, 33aa255, só traz o parecer de segurança e não muda o patch revisado. Lido: o diff inteiro, os §4 a §6, §11 e §12 de `docs/architecture/fontes/acelerato-listas.md`, as seções 6, 8 e 9 do `docs/engineering/praticas.md`, e, para contexto, a migração 0009 (`ref_dominio`), `ddl.ts` (`refVigencia`), `acelerato/referencia.ts` (leitura das listas) e `operacao/repositorio.ts` (`lerVersoes`). O `.env.example` não foi lido: uma regra de permissão desta sessão barra o caminho. Ele fica com o parecer de segurança, que o conferiu (placeholder local, sem valor real).

## Ferramentas (citadas, não refeitas)
- Autor (E4.28, Histórico do pedido): `pnpm run pronto` rc=0; `test:pg` 122 verdes; 18 unitários e 5 `.pg` novos.
- Segurança: `docs/security/056-carga-inicial.md` (33aa255), **aprovado**, com A1 e A2 recomendados (classe de caracteres do validador e texto livre de `versao_criterio`). Não refeito aqui.
- O `praticas.md` não tem regra de ferramenta nova que alcance este diff.

## O que confere
- **Vigência sem apagar nem sobrescrever.** Só há INSERT de vigência nova e UPDATE de `vigente_ate` (`dominio-acelerato.ts:146-151`). O fechamento vem antes da inserção, então o índice parcial `uq_ref_dominio_vigente` não colide. Uma vigência aberta no mesmo dia, ou depois, é recusada antes de gravar (`:116`). Os testes `.pg` provam que o papel `dspd_ref` não faz outro UPDATE nem DELETE (42501) e que o coletor não escreve.
- **Idempotência.** Sem diferença, nada é gravado, nem a versão (unitário e `.pg`, inclusive no dia seguinte). Mudar só a ordem não abre vigência: a decisão está explicada no comentário de `planejarDominio`.
- **Transação.** Tudo vai em `emTransacao`. No erro de vigência, o ROLLBACK é o último comando (unitário com dublê). O `.pg` prova que nada fica gravado.
- **Versão T2.6 por hash.** A referência `056:ref-dominio:<sha256>` (80 caracteres, cabe em 200) é gravada uma vez por hash. O hash é calculado sobre o texto exato do arquivo.
- **Validador.** O zod é `strict` e a lista de campos é fechada (`CAMPOS_DOMINIO`). Ele recusa código repetido, chave do recorte não numérica, `@` e caractere de controle. Os limites batem com a tabela: `codigo` 80 = `COD`, `rotulo` 120, `ordem` dentro do `smallint`. A mensagem de erro não traz o valor recusado.
- **Comando e config.** `ac:ref-sync` usa só `PG_REF_URL`, com `max: 1`. A saída traz só contagens e o hash, e o erro do banco vira texto fixo. `carregarConfigRef` segue o padrão das outras entradas.
- **Arquivo de domínio.** Tem 135 categorias (sem TESTADEV444, todas com chave numérica) e 19 descrições do workflow, como na decisão do dono de 2026-10-31 19:01. Os §4 a §6 ficam para a E4.32.
- **Regras invioláveis.** O comando grava só em `dspd_ac` e `dspd_core`, com o schema fixo no arquivo. Não há escrita no Acelerato, coluna de pessoa nem mistura com o BusinessMap.

## Teto de linhas (M14)
`git diff --numstat --no-renames 0783caa...521dd1f`, só código e teste (`server/src`, `server/tests`, `server/package.json`): **476 linhas** (1 + 29 + 168 + 3 + 4 + 119 + 152). Ficam fora da conta o JSON de domínio (dado de configuração, como o de conferência do 052), o `.md` e as 2 linhas do `.env.example`. O comportamento é um só: sincronizar o `ref_dominio` do Acelerato a partir do arquivo. Aceito a exceção, como na F2 do 052. O PR da E4.31 leva a linha `teto: excedido, <n> linhas, comando ac:ref-sync: sincronização do ref_dominio do Acelerato a partir do arquivo versionado (vigência, versão T2.6, testes contra PostgreSQL)`, com o `<n>` medido depois da volta. Se o PR for aberto sem essa linha, o teto vira achado bloqueante.

## Achados
- A1 (bloqueante) docs/architecture/fontes/acelerato-listas.md:6 · Diz `ref:sync` e nenhum doc ensina o `ac:ref-sync` (PG_REF_URL, argumento de data, recusa no mesmo dia). server.md:5 diz que não existe. Doc faltando bloqueia (praticas.md §7.7 e §8.10). Correção na E4.32.
- A2 (bloqueante) server/src/modulos/referencia/dominio-acelerato.ts:116 · Data retroativa: t1 fechado em D3 e reaberto por `ac:ref-sync D2` fica com [D1,D3) e [D2,∞) sobrepostos, e a versão T2.6 sai com data passada. Recusar data menor que a maior vigente_de ou vigente_ate do campo, com teste.
- A3 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:135 · A versão é gravada sem métrica e `lerVersoes` ignora versão sem métrica, então mudar a lista não marca gráfico. Quais métricas marcar é pergunta ao dono pelo Jarvis, sem inferência. A carga inicial não precisa de marca.
- A4 (recomendado) server/src/entradas/ref-sync-ac.ts:12 · A regex aceita 2026-02-30; o banco recusa e a saída diz "configuração ou banco inválidos". Validar a data civil antes (Date.UTC e comparar de volta) e devolver uso, código 2.
- A5 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:20 · `categoria` também tem chave numérica (§12: codigo = categoria_key) e fica fora da checagem numérica. Incluir na checagem, ou registrar no §12 por que fica fora.
