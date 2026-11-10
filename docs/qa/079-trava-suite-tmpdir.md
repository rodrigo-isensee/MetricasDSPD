---
tipo: qa
contrato: 1
pedido: 079-trava-suite-tmpdir
branch: feature/079-trava-suite-tmpdir
commit: 61cafba2e287808c570be923193739ba5d3088ad
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 079-trava-suite-tmpdir

Aprovado. A E1 do pedido (K-201) foi conferida contra o escopo no commit 61cafba2 (o script e o teste); os commits seguintes da branch só somam pareceres em `docs/`. Diff contra a base 718d46be: 4 arquivos, 70 inserções e 2 remoções, todos em `scripts/` e `docs/`; nada em `.github/`, `.githooks/`, `hooks/` ou `package.json`. Sem gatilho de segurança no pedido, então não há casos de abuso a transformar em teste. Sem mutante declarado: o pedido não toca `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`.

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:52 · nenhum teste exercita a recusa de link simbólico (arquivo ou diretório) no caminho padrão; a guarda da linha 24 do script só foi conferida por leitura. Cobrir quando o K-175 endurecer a trava.
- A2 (recomendado) scripts/suite-unica.sh:25 · a suposição do pedido (todos os agentes com TMPDIR igual a /tmp/claude-uid) só foi provada nesta sessão; agente com outro TMPDIR pode não gravar o caminho. Conferir no primeiro uso de cada agente.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1: duas suítes em worktrees diferentes esperam uma pela outra na trava nova | `suite-unica.test.sh` caso 4 (caminho padrão: a segunda chamada espera a primeira, aviso com o caminho novo) | trava única por estação, sem a variável | passou |
| E1: a variável METRICAS_DSPD_SUITE_LOCK ainda troca o arquivo | casos 1 a 3 do teste (rodam com a variável) e verificação manual: com a variável apontando para um arquivo novo, rc 0 e o arquivo criado | caminho trocado | passou |
| E1: link simbólico no arquivo é recusado | verificação manual: arquivo da trava como link, rc 1 e mensagem "link simbólico; recusado" | link no arquivo | passou |
| E1: link simbólico no diretório é recusado | leitura do script (linha 24, teste de link antes do mkdir); não executado para não trocar o diretório real da estação | link no diretório | passou por leitura (A1) |
| E1: sem a variável, a trava cai em /tmp/claude-uid, gravável no sandbox | caso 4 do teste, rodado no sandbox dos agentes: o caminho `/tmp/claude-1000/metricas-dspd-suite.lock` abriu e travou | caminho gravável | passou |
| E1: nada muda fora de `scripts/` e `docs/` | `git diff --stat` base..61cafba2: só `scripts/suite-unica.sh` e `scripts/suite-unica.test.sh` | escopo | passou |

## Cenários e resultado real
Suíte do script, rodada na worktree, sem pipe nem variável: `bash scripts/suite-unica.test.sh`, rc=0, 7 verificações ok ("suite-unica.test: tudo certo"). Não rodei a suíte completa do projeto: a mudança só toca o script da trava e o teste dele, sem back-end, front-end nem E2E.

Vermelho do caso novo contra a base (cópia em `/tmp/claude-1000/qa-engineer-079/`, com o script de 718d46be e o teste novo; a worktree não foi tocada):

```
ok - quem esperou avisou no terminal
ok - chamada aninhada roda direto (rc=0)
ok - rc do comando é repassado
FALHOU - caminho padrão /tmp/claude-1000/metricas-dspd-suite.lock: segunda chamada espera a primeira
FALHOU - caminho padrão: primeira chamada termina com rc=0
suite-unica.test: 2 falha(s)
rc=2
```

Os dois casos novos caem na base e passam no commit testado; os casos antigos passam nos dois. Os achados A1 a A3 do review (dono do diretório, teste com a trava real, SC2174) seguem como recomendados do tech-lead; a observação do teste usar a trava real (A2 do review) não afetou a rodada: a trava estava livre.
