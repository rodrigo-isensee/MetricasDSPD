---
tipo: review
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-homolog-aprovada
commit: a411f9fe2d6d7c2e63b92b68549f35317026690e
parecer: aprovado
veredito: aprovado
revisor: tech-lead
data: 2026-10-28
---

# Code review: homolog-aprovada sem espera paga (K-108, decisão B)

Diff lido: `origin/develop...HEAD`, 4 arquivos (2 workflows, parecer do devops, `fluxo-homologacao.md`). Sem teste local: a CI do push é a prova (brief). Segurança (E5.3) é parecer à parte; pipeline tem parecer próprio do devops (`docs/devops/041-homolog-aprovada.md`), citado e não refeito.

Nenhum achado bloqueante.

## Leitura

- Aderência à decisão B: sem espera paga, sem `sleep` no check; o fim do portão dispara a reexecução (`workflow_run`). Critério de aprovação intocado (`aprovacao.ts` da base).
- `homolog-aprovada.yml`: gatilho e `permissions` (`contents: read`, `actions: read`, suficientes para `gh api .../runs`) inalterados; `timeout-minutes: 5`; `if node ...; then exit 0` mantém o código de saída da regra e só diagnostica na falha; sai sempre 1 quando a regra falha; checkout da base, sem código da branch.
- `homolog-reavalia.yml`: `workflows: [Homologação]` confere com `name:` do `homolog.yml`; filtro `event == push` e `head_branch == homolog`; `permissions` mínimas para o rerun; sem checkout; `head_sha` por `env`; `timeout-minutes: 5` cobre o laço (6 x 10 s). Os dois casos de saída limpa (sem PR, sem execução do check) estão corretos: o `pull_request` seguinte avalia com o portão já concluído.
- Condição de reexecução: casa PR aberto para a `main` pelo `head.sha` e a execução `pull_request` do mesmo sha; rerun da mesma execução atualiza o check do próprio PR. Premissa só se prova na primeira release (o devops declara; se falhar, volta a opção A ao dono).
- Documentação (`fluxo-homologacao.md`): descreve o desenho e o limite da primeira release (workflow_run só com o arquivo na `main`; "Re-run jobs" manual).
- Limites do devops que seguem ao dono: workflow_run só dispara com o arquivo na `main`; envio de workflow exige o escopo `workflow` no token; mudança em `.github/` pede o rótulo `afrouxa-regra`. Nenhum é defeito do diff.
- Pendência de ferramenta: `actionlint` e `shellcheck` não estão no PATH (lacuna já registrada pelo devops); a validação foi `yaml.safe_load` e `bash -n`, citadas do parecer dele.
- M14 (teto por PR): a mudança é de workflow e texto, pequena; sem exceção a declarar.

## Achados

- A1 (recomendado) .github/workflows/homolog-aprovada.yml:55 · a mensagem final promete reexecução automática, mas também sai com o portão já vermelho ou em PR `hotfix/*` (ignorado pelo `homolog-reavalia`); a promessa é falsa nesses casos. Sugestão: texto neutro ou ramo próprio.
- A2 (recomendado) .github/workflows/homolog-reavalia.yml:34 · `rerun` recusado por motivo diferente de "execução em andamento" (permissão, execução expirada) consome 60 s antes de falhar. Sugestão: registrar a resposta de erro da API no log (hoje vai a `/dev/null`).
- A3 (recomendado) docs/devops/041-homolog-aprovada.md:1 · a prova do rerun só vem na primeira release real; registrar no quadro de leituras que ela é o teste do desenho B, com a opção A como volta.

## Detalhe dos achados

- A1: o check segue vermelho, que é o comportamento correto, e o hotfix já exigia reexecução manual antes; por isso não bloqueia. Texto sugerido: "se o portão ainda rodava, reexecute pelo Re-run jobs".
- A2: não bloqueia; ajuda o diagnóstico na primeira release.
- A3: não bloqueia.

## Revalidação

Primeira rodada; nada de delta anterior a ler. A develop já estava integrada em a411f9f (sem necessidade de nova integração antes do QA).
