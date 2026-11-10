---
tipo: review
contrato: 1
pedido: 079-trava-suite-tmpdir
branch: feature/079-trava-suite-tmpdir
commit: 61cafba2e287808c570be923193739ba5d3088ad
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-07
---
# Review: 079-trava-suite-tmpdir

## Parecer
Aprovado. Li o diff de 718d46be a d3832481 (o script em 61cafba2; d3832481 só soma o parecer de devops). Nada fora de `scripts/` e `docs/devops/`. O caminho por usuário (`/tmp/claude-<uid>`) em vez do `TMPDIR` mantém a trava única entre worktrees, agentes e o dono no terminal, que não tem a variável. `METRICAS_DSPD_SUITE_LOCK` segue trocando o arquivo; a recusa de link simbólico vale para o arquivo e agora para o diretório. O caso novo do teste exercita o caminho padrão com duas chamadas (a segunda espera a primeira) e checa o rc da primeira.

Provas: `bash scripts/suite-unica.test.sh` saiu com "tudo certo"; `shellcheck scripts/suite-unica.sh` aponta só o SC2174 da linha 25. Teto M14: 24 linhas de código e teste (13 no script, 11 no teste), abaixo de 150; um comportamento só. Mutantes: o PR não mexe em `hooks/` nem em `tests/catraca.py`, então a regra de mutante por guarda do Forge não se aplica aqui.

SC2174: `-m` vale para o último nível, que é o diretório da trava; `/tmp` já existe. Sem ação.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:24 · o diretório `/tmp/claude-<uid>` existente não tem dono nem modo conferidos; outro usuário poderia criá-lo antes. Estação de um usuário só, sem gatilho hoje; conferir dono se a estação passar a ter mais de um.
- A2 (recomendado) scripts/suite-unica.test.sh:53 · o caso novo usa a trava real da estação; com uma suíte rodando, a primeira chamada espera por ela e o teste fica lento, sem falhar. Reduzir se atrapalhar.
- A3 (recomendado) scripts/suite-unica.sh:25 · SC2174 sem `# shellcheck disable` com motivo; o aviso é benigno aqui. Anotar o motivo no próprio script na próxima mexida.
