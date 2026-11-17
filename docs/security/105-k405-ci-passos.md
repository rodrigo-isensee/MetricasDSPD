---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-k405-diagnostico
commit: b67a4cbf7c408da87b2bf99722465c529e07258d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-17
---
# Review de segurança: 105-k405-ci-passos (K-405 passos 1 e 2a, E7.565)

Parecer novo, da branch inteira contra a `develop` (base acb62951), no head b67a4cbf. Revisão estática do diff: `.github/workflows/ci.yml` e `homolog.yml` (passo "Medir o runner" e a cobertura em dois passos), `changelog.d/ci-105-k405-diagnostico.md` e `docs/devops/105-k405-diagnostico.md`. **Aprovado**, com uma recomendação de baixa severidade (A1).

Suíte: não há PR; a suíte inteira fica para o CI do PR e este parecer não afirma CI verde. O autor não traz PQ de execução no runner (o próprio passo 1 é a medição, que só existe no primeiro run); conferi localmente, no head, a seleção dos dois filtros e o código de saída (sondas informativas no detalhe, fora do bloco `## Sondas`, porque nenhuma prova bloqueante).

## Gatilhos
`R-SEGURANCA`: alteração de workflow de CI (`ci.yml`, e `homolog.yml`, que é o portão de `homolog` lido pelo check `homolog-aprovada`). Sem dado pessoal, sem segredo, sem permissão nova, sem ação de terceiro nova.

## Conferência pedida
- **Permissões e ações.** O diff não toca `permissions:` (`contents: read` no topo, `ci.yml:14-15`, `homolog.yml:18-19`), nem gatilhos (`on:` sem `pull_request_target`), nem `uses:`. Nenhuma ação nova; as existentes seguem fixadas por SHA.
- **Injeção de expressão.** As linhas adicionadas não interpolam `${{ }}` em `run:`; os comandos são literais. O filtro `'!@metricas-dspd/web'` está entre aspas simples, sem expansão do shell.
- **Segredos.** Nenhum segredo, token ou senha nas linhas adicionadas (workflows, changelog e diagnóstico). `nproc`, `free -m` e `uptime` imprimem só contagem de CPU, memória e carga do runner efêmero, num repositório privado: informativo, sem valor para atacante.
- **Falha fechada.** Os três passos novos rodam em sequência sem `if:`, sem `continue-on-error` e sem retry; o shell padrão do runner é `bash -e`, e `time <comando>` devolve o código do comando (`time false` sai com 1). Se a cobertura dos demais pacotes falhar, o passo do web não roda e o job falha; o portão segue bloqueante. O `continue-on-error: true` existente em `ci.yml:300` é de outro job, anterior e fora do diff.
- **Cobertura do filtro.** `-r --filter '!@metricas-dspd/web'` seleciona os nove pacotes do workspace menos o web (contratos, metricas, mock, server, e2e, docs-contratos, homolog, pesquisa, spec-check; o e2e não tem script `cobertura` e é pulado por `--if-present`, como antes) e não seleciona a raiz, então não há recursão no script `cobertura` da raiz. Exclusão por nome exato: pacote novo entra sozinho (falha segura).
- **Escopo da variável.** `METRICAS_DSPD_ESPERA_ASYNC_MS` passa a valer só no passo do web (`ci.yml:66`, `homolog.yml:91`); só o web a lê (`web/vite.config.ts:76`, `web/src/test/setup.ts:24`). Escopo menor que antes, sem efeito nos outros pacotes.
- **Resumo e artefato.** Continuam lendo `server/coverage`, `web/coverage` e `tools/homolog/coverage` (`ci.yml:74-85`, inalterados); os dois passos escrevem nos mesmos diretórios.
- **Tempo.** Os passos ficam em sequência; o `timeout-minutes` do job (`ci.yml:42`, 25; `homolog.yml:69`, 20) estoura fechado (job falha, não passa). Estimativa de duração é do parecer de devops; sem impacto de segurança.
- **Custo.** Nenhum recurso novo nem runner maior (`R-CUSTO`).

## Achados
- A1 (recomendado) .github/workflows/ci.yml:64 · O passo do web filtra por nome sem --fail-if-no-match: se o pacote for renomeado, o filtro não casa e o passo sai 0 sem rodar nada (provado: rc=0). A cobertura do web ainda roda no passo anterior, sem a espera de 15 s. Acrescentar --fail-if-no-match aqui e em homolog.yml:89.

## Sondas

## Detalhe dos achados
**A1.** Evidência: `ci.yml:64` e `homolog.yml:89`, o passo "Cobertura do web" com `--filter @metricas-dspd/web`. Sonda local no head: filtro de um nome inexistente imprime "No projects matched the filters" e sai com 0; com `--fail-if-no-match`, sai com 1. Caminho: não há atacante; é falha silenciosa de controle por mudança futura (renomear o pacote do web). Nesse caso o passo anterior deixaria de excluí-lo e o rodaria, então a cobertura de 100% continua bloqueante; perde-se só a separação do diagnóstico e a folga de 15 s, e o passo do web fica verde sem testar nada, o que mascara a medição do K-405. Severidade: baixa. Correção mínima: acrescentar `--fail-if-no-match` ao passo "Cobertura do web" nos dois arquivos (`ci.yml:64`, `homolog.yml:89`). Esforço P. Dono: `devops-engineer` (envio pelo dono, sem escopo `workflow` no token). Não bloqueia.

Sondas informativas (não provam bloqueante; por isso fora do bloco `## Sondas`):
- filtro de exclusão sem o web, listando os pacotes · espera: todos menos web e raiz · obtido: tools/homolog, tools/spec-check, e2e, packages/contratos, tools/pesquisa, packages/metricas, packages/mock, server, tools/docs-contratos.
- filtro de nome inexistente, sem e com `--fail-if-no-match` · espera: 0 e 1 · obtido: rc=0 e rc=1.
- `bash -c 'time false'` · espera: 1 · obtido: rc=1.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do diff, sondas locais com o gerenciador de pacotes já instalado e validação de sintaxe YAML dos dois workflows (biblioteca de YAML do sistema: ok). Lacunas: o linter de workflows e o analisador de segurança de workflows não estão no PATH (não instalados, `R-CUSTO`); a varredura de segredos também não está, substituída pela leitura das linhas adicionadas.
