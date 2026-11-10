---
tipo: revisao-devops
contrato: 1
pedido: 079-trava-suite-tmpdir
branch: feature/079-trava-suite-tmpdir
commit: 61cafba2e287808c570be923193739ba5d3088ad
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-07
---
# Review de devops: 079-trava-suite-tmpdir

## Parecer
Aprovado. A trava de `scripts/suite-unica.sh` passa de `/tmp/metricas-dspd-suite.lock` (somente leitura no sandbox dos agentes) para `/tmp/claude-<uid>/metricas-dspd-suite.lock`. `METRICAS_DSPD_SUITE_LOCK` continua trocando o arquivo, a recusa de link simbólico vale para o arquivo e agora também para o diretório, e o teste ganhou o caso do caminho padrão. `bash scripts/suite-unica.test.sh` e `pnpm run test:trava` saíram com rc=0. Ferramentas: `shellcheck` usado; `actionlint` ausente do PATH (não há workflow no diff).

### Motivo da escolha do caminho
Confirmado nesta sessão: `TMPDIR=/tmp/claude-1000`, gravável no sandbox; `/tmp` direto é somente leitura (`touch` recusado) e `/tmp/claude` não existe. A suposição do pedido ("`$TMPDIR` é o mesmo para todos") só está provada para esta sessão. Usar `$TMPDIR` como padrão dividiria a trava: o dono no terminal, sem a variável, cairia em `/tmp`. Por isso o caminho é fixo por usuário (`/tmp/claude-$(id -u)`), igual para agentes e dono (mesmo uid), com a trava única por estação mantida. Não ficou sem caminho comum; não há decisão pendente.

## Achados
- `scripts/suite-unica.sh:25` · shellcheck SC2174 (`mkdir -p -m` só aplica o modo ao último nível; aqui é o diretório da trava, `/tmp` existe) · sem ação · recomendado
- `scripts/suite-unica.sh` · se algum agente tiver `TMPDIR` diferente de `/tmp/claude-<uid>`, o sandbox dele pode não gravar o caminho e a suíte falha ao abrir a trava (falha alta, sem perda de exclusão) · conferir no primeiro uso · recomendado
- `scripts/suite-unica.test.sh:5` · SC2164 (`cd` sem `|| exit`), anterior a esta mudança · fora do escopo · recomendado

## Custo e rollback
Sem minutos de CI nem recurso novo (`R-CUSTO`); nada em `.github/`, `.githooks/` ou `package.json`. Rollback: reverter o commit do script (volta ao `/tmp` fixo) ou apontar `METRICAS_DSPD_SUITE_LOCK` para outro arquivo.
