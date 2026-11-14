---
tipo: revisao-devops
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: bdb6669e
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-14
---
# Review de devops: fix-forge0442-001

## Achados

## Detalhes
Aprovado. Merge de origin/develop na branch (merge commit, sem rebase). Conflitos resolvidos em dois arquivos.

- package.json: o lint da develop (`eslint . && pnpm --filter @metricas-dspd/server run lint`) foi mantido, com o eslint da raiz rodando sob `node --max-old-space-size=4096`. O server segue no seu próprio script.
- scripts/suite-unica.test.sh: vale o teste 4 com trava própria (METRICAS_DSPD_SUITE_DIR em diretório temporário), que não disputa a trava de /tmp/claude-<uid>. Substitui o "pulado" da develop e prova o caminho padrão também dentro do pronto (K-256). A suite-unica.test.sh passou solta e sob `bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh`, que reproduz a trava do pronto: "tudo certo" nas duas.

Medição do heap (`pnpm run lint`, máquina livre, 18 GB na estação, limite padrão do node aqui 4288 MB):
- sem NODE_OPTIONS: rc=0, 1:27, pico 3,73 GB
- com 4096: rc=0, 1:37, pico 3,62 GB
- com 2048 (equivale ao padrão sob o teto de 8 GB): rc=134, "JavaScript heap out of memory" aos 1:02

Conclusão: o heap é necessário sob o teto de 8 GB. Sem ele, o padrão do node seria cerca de 2 GB e o lint estoura. Nesta estação o padrão já é 4 GB, por isso a medição sem opção passa. Heap mantido.

Ferramentas: actionlint e shellcheck não foram usados (nenhum workflow nem Dockerfile mudou; os scripts mudaram só no teste).

## Custo e rollback
Sem minutos novos de CI nem recurso pago. Volta: reverter o merge ou o commit do package.json.
