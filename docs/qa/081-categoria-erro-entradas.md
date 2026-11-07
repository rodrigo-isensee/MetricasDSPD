---
tipo: qa
contrato: 1
pedido: 081-categoria-erro-entradas
branch: feature/081-categoria-erro-entradas
commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 081 categoria do erro nas entradas de referência (E1.4, K-241)

Código testado: `1f8a19c6`. O HEAD `5f906a66` só soma `docs/security/081-categoria-erro-entradas.md` (`dbdbb417`) e `docs/reviews/081-categoria-erro-entradas.md`. Obrigação: `## Escopo` e `## Fora do escopo` do pedido. Sem tela nem contrato novo: não há E2E nem acessibilidade.

## Escopo
- Dentro: `categoriaDoErro` e `ErroConfiguracao` (`plataforma/categoria-erro.ts`), o lançamento em `config.ts` e as três entradas `ref:sync-calendario`, `ac:ref-sync` e `bm:ref-sync`.
- Fora: código de saída (continua 1 e 2) e as entradas do coletor e do apontamento.
- Conferido contra o diff `852b9406..1f8a19c6`: 10 arquivos de código e teste em `server/`; `git diff --stat 852b9406 HEAD` em `web/`, `packages/`, `server/migrations` e `.github` sem diferença (vazio). `ref-sync-apontamento` fora do diff.

## Conferência contra o escopo
| Obrigação | Teste ou leitura | Fronteira protegida | Resultado |
|---|---|---|---|
| Configuração sai com os nomes das variáveis | `categoria-erro.test.ts` (nomes ordenados do Zod e variável removida da API); subprocesso do calendário: `ref:sync-calendario falhou: configuração: PG_REF_URL\n` | vários nomes; env vazio | passou |
| Autenticação (classe 28, direta e em `AggregateError`) | `categoria-erro.test.ts`; dublê do calendário com `28P01` | classe 28 inteira, não só 28P01 | passou |
| Conexão (4 códigos de rede, `AggregateError`, "timeout") | `categoria-erro.test.ts`; dublê com `ECONNREFUSED` | código no pai e nos filhos; texto de tempo esgotado | passou |
| Outro (sem código, 42P01, `code` não string, não-`Error`, nulo) | `categoria-erro.test.ts`; subprocesso do BusinessMap: `bm:ref-sync falhou: outro\n` | `null`, texto cru, código de outra classe | passou |
| Nenhum valor, URL, senha, host, papel nem texto do banco na saída | `categoria-erro.test.ts` (cinco erros com texto carregado de senha e URL); asserções de saída exata nos testes de entrada | senha, URL, host, papel, texto do banco | passou |
| `ErroCalendario` e `ErroDominio` mantêm a mensagem própria | leitura do diff: ramo `instanceof` mantido nas três; testes existentes do calendário e do BusinessMap seguem verdes | n/a | passou |
| Código de saída 1 na falha, 2 no uso errado | subprocesso e dublê afirmam `status` 1 e `exitCode` 1; testes de uso afirmam 2 (calendário, BusinessMap e AC, 3 passam) | falha e uso errado | passou |
| Formato `<entrada> falhou: <categoria>[: <nomes>]` nas três entradas | calendário e BusinessMap afirmados por saída exata; AC por leitura do diff (`ref-sync-ac.ts:26`, mesma troca) | n/a | passou (AC só por leitura, ver A1) |

## Execução
- Com `--maxWorkers=2`, na worktree: `categoria-erro.test.ts`, `ref-sync-calendario-entrada.test.ts` e `ref-sync-businessmap-entrada.test.ts`: 3 arquivos, 22 testes, 22 passaram, 0 falharam (os de subprocesso rodaram no sandbox).
- `ref-sync-ac-entrada.test.ts` (não alterado pelo diff): 3 passaram.
- Suíte completa não rodada local; vale a CI do push (run 42367687534, verde pelo brief).

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-engineer-081/`: `server/` da base `852b9406` com os três arquivos de teste do head; worktree intacta. 5 falhas e 11 passam; 3 arquivos com falha.
- `categoria-erro.test.ts`: falha de carga (`Cannot find module '../src/plataforma/categoria-erro.js'`); prova só a ausência do código, por isso a mutação abaixo.
- Calendário, 4 testes caem: "sem configuração do banco ... a categoria com o nome da variável", "erro do banco: código 1, só a categoria", e os dois de código `28P01` e `ECONNREFUSED` (a base imprime a frase fixa "configuração ou banco inválidos").
- BusinessMap, 1 teste cai: "URL inválida com senha marcador" (esperava `outro`, a base imprime a frase fixa).

## Mutação à mão (cópia descartável de `categoria-erro.ts` do head, contra `categoria-erro.test.ts` e o teste do calendário)
| Mutante | Resultado |
|---|---|
| `startsWith('28')` para `startsWith('99')` | morto (2 falhas) |
| código `EAI_AGAIN` trocado | morto (1 falha) |
| `nomes.join(', ')` para vazio | morto (3 falhas) |
| remove o teste de texto de tempo esgotado | morto (1 falha) |
| remove os códigos dos filhos do `AggregateError` | morto (2 falhas) |
| autenticação devolve `outro` | morto (2 falhas) |

Sem sobrevivente.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/tests/ref-sync-ac-entrada.test.ts:1 · nenhum teste afirma a saída de falha de `ac:ref-sync` no formato novo; um caso de subprocesso sem `PG_REF_URL` esperando `ac:ref-sync falhou: configuração: PG_REF_URL` cobre a terceira entrada.
