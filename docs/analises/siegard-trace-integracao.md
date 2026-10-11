# Siegard: ligação Regra/Cenário -> teste (experimento)

Experimento real em `/tmp/claude-1000/siegard-estudo/bindtest/repo` (fora do repositório): repositório git com
`siegard.json`, piloto como raiz `spec/`, dois testes TypeScript falsos. Sem plan-work, implement-task ou LLM; `python3 -B`, sem rede. Os pontos abaixo são resultados observados, não suposições.

## 1. Montagem

`siegard.json` mínimo (válido para `project.py`):

```json
{"specification_root":"spec","targets":{"backend":"server"},
 "tests":{"backend":[{"under":"test","suffix":".test.ts"}]}}
```

- `server/test/stats.test.ts`: `it` citando `rules/metrics/minimum-sample-of-20`, e os dois cenários da regra.
- `server/test/flow.test.ts`: `it` citando `rules/flow/archived-cards-stay-in-base` e um nó inexistente
  (`rules/metrics/does-not-exist`).
- O identificador de um nó é o caminho sem `.md` a partir da raiz da especificação.

## 2. `--bind` funciona sozinho

`trace.py --bind server spec <nó> <arquivo>` funciona sem nenhuma outra etapa do plugin. Pontos observados:

- `<alvo>` é o diretório do código (`server`). O arquivo é relativo AO ALVO (`test/stats.test.ts`), não à raiz do
  repositório; `server/test/...` é recusado com mensagem explicativa.
- Nó inexistente é recusado: `cannot bind: spec holds no node rules/nope`. Arquivo inexistente também é recusado.
- Cada bind imprime um aviso: "binding rests on no record" (a ligação manual não guarda o julgamento). É só aviso;
  o script Node pode ignorá-lo. Não há marca no JSON da diferença.
- Grava `siegard-trace.json` na RAIZ GIT (toplevel), ao lado de `siegard.json`, mesmo com o alvo em `server/`.
  Os caminhos gravados são relativos a esse arquivo (`server/test/stats.test.ts`).
## 3. `--check` e `--owed`

- `--check server` sem desvio: `no drift: 3 binding(s) match ...`, código de saída 0.
- Com desvio: lista as linhas e o resumo por classe (`orphaned`, `moved`, `proof`, `code`); código de saída 1.
- `--owed server`: "nothing owed: no reconciliation record ..." Só olha registros de `/reconcile` (pasta
  `siegard-reconcile`). Sem esses registros, não diz nada útil para nós: não lista nós sem teste. Não serve
  como "cobertura".

## 4. Falso alarme de desvio

| Edição | Resultado do `--check` |
|---|---|
| Acrescentar um `it` de outro assunto no arquivo de teste | 2 achados `code` (1 por nó ligado àquele arquivo), saída 1 |
| Acrescentar uma frase ao texto de um nó | 1 achado `moved` só daquele nó, saída 1 |
| Apagar o arquivo de teste | achado `code` ("file no longer exists"), saída 1 |

Conclusão: o digest do arquivo é o SHA-256 do arquivo INTEIRO (conferido com `sha256sum`), então qualquer edição
no arquivo, mesmo alheia, dá desvio em TODOS os nós ligados a ele. O falso alarme é proporcional ao número de nós
ligados ao arquivo: um arquivo de teste agregador com 20 nós gera 20 achados por um `it` não relacionado. O digest
do nó é o SHA-256 dos bytes do `.md`, inclusive de espaços e correção de grafia; um `moved` real e um cosmético
são indistinguíveis. Mitigação: um arquivo de teste por nó (ou poucos), e `--bind` de novo (rebind) como ato do
revisor após ler o diff. A classe `code` pode ser suprimida por alvo com `edits_freely`, mas isso não serve aqui:
não queremos esconder desvio de teste.

## 5. O que o plugin NÃO verifica (cabe ao nosso script Node)

1. Que cada identificador citado no nome de um `it`/`describe` EXISTE como nó. O plugin só confere nós no
   momento do bind; nome de teste com nó apagado ou com erro de digitação passa despercebido.
2. Que todo nó Regra/Cenário tem >= 1 teste ligado (o plugin não tem "cobertura de nós"; `--owed` não faz isso).
3. Que o nome do teste e a ligação no `siegard-trace.json` concordam: o plugin não lê o conteúdo do teste. Um nó
   citado no `it` mas sem ligação, ou ligado mas sem citação, não é detectado.
4. Que o arquivo ligado é de teste e que o teste passa (só digest; qualquer arquivo do alvo é aceito).
5. A convenção de nomes em si (formato da citação, por exemplo prefixo `[<nó>]` no `it`).

## 6. Formato exato de `siegard-trace.json`

Esquema `schemas/trace.json` do plugin (`additionalProperties: false`), ligação manual:

```json
{"specification": "spec",
 "bindings": [{"node": "rules/metrics/minimum-sample-of-20",
   "digest": "sha256:<64 hex>",
   "files": [{"path": "server/test/stats.test.ts",
              "digest": "sha256:<64 hex>",
              "node_digest": "sha256:<64 hex>"}]}]}
```

- `specification`: caminho relativo ao arquivo, sem `/` inicial. `bindings`: no máximo uma entrada por nó.
- `node`: caminho sem `.md`. `digest`: SHA-256 dos bytes do `.md` do nó (igual a `spec.py --digest`).
- `files[].path`: relativo à raiz git (não ao alvo). `files[].digest`: SHA-256 dos bytes do arquivo.
- Opcionais que `--bind` manual NÃO escreve: `judged`, `decided_by` (`reading`|`test`), `step`, `proof`. O script
  Node deve tolerar a presença deles (se um dia `/reconcile` for usado), mas não depender deles.
- Digest é `sha256:` + hex (`sha256sum`): o Node recomputa sozinho, sem Python.

## 7. Riscos de rodar `trace.py` no CI

- Exige Python 3 e PyYAML e jsonschema no runner (confirmado: o script os importa); o time é Node, é mais uma
  cadeia de suprimentos a fixar e atualizar.
- O plugin NÃO tem licença: não há direito explícito de copiar, redistribuir nem vendorizar o script no nosso
  repositório. Clonar no CI é uso sem licença, ainda que o autor seja de confiança (a saída é uma licença
  escrita pelo autor).
- Clonar o repositório do plugin no CI = código de terceiros executando no pipeline com acesso ao repositório e
  possivelmente a segredos; precisaria de commit SHA fixo e job sem segredos.
- A saída do `--check` é texto (só o código de saída 1 é máquina-legível) e o formato não tem versão contratual.
- Alternativa local: o dev roda `--bind`/`--check` na máquina (plugin instalado) e COMMITA o
  `siegard-trace.json`. O CI roda só o script Node, que lê o JSON e recomputa os digests (SHA-256 de arquivos).

## 8. Desenho mínimo do script Node (`scripts/check-spec-links.mjs`)

Entradas: raiz da especificação (`siegard.json`), `siegard-trace.json`, testes `*.test.ts`. Só `node:fs/crypto/path`.

Passos e erros (saída 1 se qualquer um falhar; mensagens com nó e arquivo):

1. Listar nós: todo `.md` sob `rules/` e `scenarios/` (não `_context.md`), identidade = caminho sem `.md`.
2. Ler os testes e extrair identificadores citados em `it(`/`test(`/`describe(` (regex sobre a convenção
   escolhida). ERRO: identificador citado que não é nó (`nó inexistente`).
3. ERRO: nó Regra/Cenário sem nenhum teste citando (`nó sem teste`). Opcional por tipo: domínio isento.
4. Ler `siegard-trace.json`; validar `specification`, sem nó duplicado. ERRO: `node` ausente na especificação
   (`orphaned`); `files[].path` inexistente.
5. ERRO: citação no teste sem ligação para aquele arquivo, e ligação sem citação no arquivo (divergência).
6. Digests: recomputar SHA-256 do nó e do arquivo e comparar (equivale ao `--check`); relatar `moved`/`code`.
7. Saída: lista legível, uma linha por problema, e resumo; código 0 só sem problemas.

## Recomendação

Rodar o `--check` do plugin SÓ LOCALMENTE (hook de pre-push ou ritual do revisor), e no CI rodar apenas o script
Node (passos 1 a 5 e, se desejado, 6, só com SHA-256). Motivos: licença ausente, Python mais PyYAML e jsonschema,
código de terceiros no pipeline. O falso alarme por edição alheia (seção 4) é tratado por um arquivo de teste por
poucos nós. Se o autor publicar licença, reavaliar.
