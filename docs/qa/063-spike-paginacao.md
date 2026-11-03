---
tipo: qa
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-spike-paginacao
commit: 95e1dad2e1bbe11ab103106a26ad13e104f94906
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---

# QA: script de spike da paginação do /loggedTime (E1.11)

Escopo: `scripts/bm-spike-paginacao.sh`, a entrada, `spike-paginacao.ts` e `server/tests/spike-paginacao-businessmap.test.ts`. Sem chamada à API do BusinessMap e sem leitura de `.env`.

## Veredito
**Aprovado.** Nenhum bug aberto. Nenhum código de produção alterado pelo QA.

## Obrigação → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Exatamente 1 GET em /loggedTime com `card_ids` e `page=2`, chave só no cabeçalho | "faz 1 GET em /loggedTime..." | URL sem a chave; método GET | verde |
| Sem repetição em 429 ou 500 | "não repete a chamada..." | 1 chamada por execução | verde |
| Saída só com status, contagem, chaves do envelope e números de paginação | "imprime só status, contagem..." e "descarta nomes de chave fora do padrão seguro" | nome de pessoa, e-mail, comentário, id de usuário, URL e chave ausentes; chave com `@` ou espaço descartada | verde |
| Id inválido recusado antes da rede | `it.each` de 9 ids (abc, 0, -5, 1.5, vazio, `1&page=1`, `../x`...) e "sem argumento ou com mais de um" | inteiro positivo de até 12 dígitos; 0 chamadas de rede | verde |
| Status de erro mostra só o status | "status de erro mostra só o status..." (403 com chave e nome no corpo) | corpo de erro nunca impresso | verde |
| Envelope inesperado (não JSON, lista direta, sem lista, `data` escalar, objeto vazio, paginação não numérica) | "corpo que não é JSON...", "aceita lista direta...", "lê paginação na raiz e formas sem lista" | `(não reconhecido)`, `(nenhum)`, sem exceção | verde |
| Falha de rede e tempo esgotado sem vazar chave, URL ou causa | "falha de rede...", "tempo esgotado e abortado..." | mensagem fixa | verde |
| Erro de configuração nomeia a variável, sem valor | "erro de configuração..." | URL `http` recusada | verde |

## Execução real
- PQ-3: `vitest run --maxWorkers=6 tests/spike-paginacao-businessmap`: 1 arquivo, 22 testes, 0 falhas (carga 7,4, MemAvailable 11,7 GB).
- Entrada real via `tsx` com ambiente limpo (`env -i`, sem API): id `abc` dá rc=2 com mensagem de uso; sem variáveis dá rc=2 `variável obrigatória ausente: BUSINESSMAP_URL_BASE`; host local inalcançável (127.0.0.1:1) dá rc=1 `GET /loggedTime: erro de rede`, sem chave nem URL; dois ids dão rc=2.
- O `tsx` direto exige `TMPDIR` gravável no sandbox (grava em /tmp): é limite do ambiente, não do script.

## Vermelho antes do verde
Os arquivos de módulo e de teste são novos na base `b446021`: o teste falha na base por falha de carga (módulo ausente), o que não prova regra. A prova de comportamento está nos asserts de abuso acima, todos específicos (chave, nome e e-mail fictícios como sentinelas). Mutação: o Forge não se aplica a este pedido (nenhum `bin/` ou hook); sem ferramenta de mutação rodada no módulo.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/spike-paginacao.ts:59 · resposta 3xx vira "erro de rede" por causa de `redirect: 'error'`; a mensagem não diz que houve redirecionamento. Não bloqueia: só afeta o diagnóstico do dono.
- A2 (recomendado) server/src/modulos/businessmap/spike-paginacao.ts:45 · `[1-9]\d{0,11}` recusa id com zero à esquerda; correto, e vale avisar o dono de que o id é o do card, sem zeros.
