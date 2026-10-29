---
tipo: revisao-devops
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-homolog-aprovada
commit: a361c36c0dc6b7d9ffcc46936ba289e873194162
parecer: aprovado
revisor: devops-engineer
data: 2026-10-27
---

# homolog-aprovada sem corrida com o portão (K-108), opção B

## Mudança (substitui a sondagem do commit 31fc370)

- `homolog-aprovada.yml`: sem sondagem nem `sleep`; `timeout-minutes` de volta a 5. O passo chama `aprovacao` (critério inalterado, do código da base do PR). Se falhar, consulta uma vez as execuções `push` do `homolog.yml` do sha: com execução em curso, `::error::` "Portão ainda não terminou ... será reexecutado sozinho"; sem execução em curso (ausente, ainda não listada pela API, ou concluída sem sucesso), `::error::` equivalente. Sempre sai 1.
- `homolog-reavalia.yml` (novo): `workflow_run` do workflow `Homologação`, tipo `completed`, só `event == push` e `head_branch == homolog`. Acha o PR aberto para a `main` com o mesmo head sha, acha a execução `pull_request` de `homolog-aprovada.yml` desse sha e faz `POST /actions/runs/{id}/rerun`. Como é reexecução da mesma execução, o resultado atualiza o check do próprio PR (o problema de um `workflow_run` isolado, que publicaria o check no sha da branch padrão, não existe aqui).
- `fluxo-homologacao.md` atualizado.

## Por que não há corrida nem execução perdida

- O `portao` é o último job do `homolog.yml` (depende de todos): `workflow_run completed` só dispara com o portão concluído e listado. A reavaliação roda depois, então a avaliação vê o portão no estado final.
- Check avaliou antes do fim (portão em curso, na fila ou ainda não listado na API, a brecha vista): falha, e o fim do portão dispara a reexecução. Nenhuma execução de portão fica sem reavaliação, pois o gatilho é o evento de término, não uma leitura da API.
- Check avaliou depois do fim: passa direto; a reexecução, se vier, repete o mesmo resultado.
- Reexecução recusada porque a execução do PR ainda está terminando (janela de segundos): o laço tenta 6 vezes com 10 s; se esgotar, falha o job com instrução de "Re-run jobs".
- Portão que termina vermelho também reexecuta: o check passa a mostrar a causa real, em vez de "ainda não terminou". Nada vira verde por tempo nem por exceção.
- PR aberto ou sha novo depois do portão: o `pull_request` (opened/synchronize) avalia já com o portão concluído.

## Checklist de workflow

- `homolog-reavalia.yml`: `permissions` `contents: read`, `actions: write` (necessário para rerun), `pull-requests: read`; sem checkout nem código de branch; `head_sha` por variável de ambiente (não interpolado no `run`), `github.token` só no passo; sem ação de terceiros; `timeout-minutes: 5`; sem `continue-on-error`; não escreve na `main`.
- `homolog-aprovada.yml`: permissões inalteradas (`contents: read`, `actions: read`).
- Custo (`R-CUSTO`): segundos de runner por release, sem espera paga.

## Limites e prova que falta

- Nada rodou no GitHub (regra desta entrega): a premissa de que reexecutar a execução `pull_request` atualiza o check do PR é o comportamento documentado do endpoint de rerun, mas só se prova na primeira release real. Se não funcionar, a opção A volta ao dono.
- `workflow_run` só dispara com o arquivo na branch padrão: na primeira release (arquivo ainda fora da `main`), vale "Re-run jobs" manual depois do portão. A reexecução usa o código do workflow e da regra da base, como antes.
- O token com `actions: write` pode reexecutar qualquer workflow do repositório; mitigado por ser só neste job, sem entrada não confiável e sem checkout.
- Mudança em `.github/` exige o rótulo `afrouxa-regra` do dono (catraca) e envio do workflow pelo dono (token do bot sem `workflow`). `homolog-reavalia` não afrouxa critério.

## Validação

- `actionlint` e `shellcheck`: não estão no PATH (lacuna registrada).
- YAML dos dois arquivos carregado com `yaml.safe_load`; scripts dos passos `run` conferidos com `bash -n`: sem erro. Leitura do YAML: aspas nas expansões, erro de `gh api` fora do `if` falha o passo.

Revalidação (E3.2): `commit:` passa a a361c36c0dc6b7d9ffcc46936ba289e873194162 porque o `.gitignore` (e o resto do PR #150) veio da develop pelo merge a411f9f, e os pareceres de review, segurança e QA mudaram por commits da própria branch; nenhum arquivo em `.github` mudou desde 72ca360. Veredito, `branch:` e achados iguais.
