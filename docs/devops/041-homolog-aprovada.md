---
tipo: revisao-devops
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-homolog-aprovada
commit: 31fc37055cf5650b652d6b5d6dc66290681bf051
parecer: aprovado
revisor: devops-engineer
data: 2026-10-23
---

# homolog-aprovada sem corrida com o portão (K-108)

## Mudança

`homolog-aprovada.yml`: antes de chamar `aprovacao`, o passo consulta (`gh api`, `actions: read`) as execuções `push` do `homolog.yml` para o sha do candidato. Enquanto houver alguma não concluída (fila ou em curso), espera com sondagem de 60 s, limite de 45 min; `timeout-minutes` de 5 para 50. Depois chama `aprovacao`, que é quem decide, com o mesmo critério. `fluxo-homologacao.md` atualizado.

## Por que não há corrida

- O resultado nunca é decidido pelo YAML: a avaliação continua em `tools/homolog/src/aprovacao.ts`, da base do PR. A espera só adia a leitura até o portão do mesmo sha concluir.
- Portão concluído com falha ou cancelado: sai do laço e `aprovacao` falha, como hoje. Estouro do limite: aviso e falha pela avaliação (portão sem sucesso). Nada vira verde por tempo.
- Sem execução pendente (sha que não é ponta de `homolog`, portão já concluído): não espera; o comportamento é o de antes.
- Alternativa descartada: `workflow_run`. O check exigido do PR precisa ser publicado no head do PR; um `workflow_run` roda no contexto da branch padrão e não se associa ao PR, deixando o check obrigatório pendente.

## Checklist de workflow

- `permissions` inalteradas (`contents: read`, `actions: read`). Entradas não confiáveis (`BRANCH_ORIGEM`, sha, repo) seguem por variável de ambiente; `GH_TOKEN` é o token do job, só neste passo; `REPO_BASE` vem de `github.repository`. Nenhuma ação nova; sem escrita em `main`, sem `continue-on-error`, sem retry de teste.
- Custo (`R-CUSTO`): minutos de runner só enquanto o portão roda (até 45 min, o portão leva cerca de 30 nas últimas execuções), apenas em PR para `main` (poucos por release), dentro da franquia. Cada sincronização do PR durante o portão repete a espera.
- Risco residual: o limite de 45 min é medido contra um portão de cerca de 30 min; se o portão passar disso, o check falha e pede re-run, como hoje.

## Validação (nada rodou no GitHub)

- `actionlint`: não está no PATH (lacuna registrada).
- YAML carregado com `yaml.safe_load` sem erro; o script do passo `run` extraído e conferido com `shellcheck -s bash`: sem achados.
- Leitura do diff: aspas nas expansões, `$(( ))` aritmético, `set` padrão do `bash -e` do Actions: erro de `gh api` falha o passo (visível, não mascarado).
- Primeira execução real só ocorre no próximo PR `homolog` para `main`; mudança em `.github/` exige o rótulo `afrouxa-regra` do dono (catraca) e o envio do workflow é do dono (token do bot sem `workflow`).
