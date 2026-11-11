---
tipo: revisao-devops
contrato: 1
pedido: 095-runner-ubuntu-2404
branch: melhoria/runner-ubuntu-2404
commit: 1049e819040425ce256d3bba45a53dc4478c039b
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-11
---
# Review de devops: 095-runner-ubuntu-2404

## Achados
- A1 (recomendado, resolvido) o passo de instalação do navegador não tinha nova tentativa. Resolvido pela raiz: o job com navegador não usa mais o apt do runner (container oficial).
- A2 (recomendado) .github/workflows/ci.yml:197 e homolog.yml · a tag e o digest do container não são vistos pelo Dependabot de pacotes; ao subir o `@playwright/test`/`playwright-core` no lock, trocar a tag e o digest no mesmo PR. A ação `.github/actions/playwright` falha alto se divergirem (Chromium ausente). Cartão futuro opcional: bloco `docker` do Dependabot não cobre `container:` de workflow.

## Detalhes
Aprovado, com o diagnóstico revisto.

Diagnóstico novo: a troca para `ubuntu-24.04` (commit `60bdc206`) não resolveu. No run 43058313572 (PR 318, imagem `ubuntu-24.04` 20261101.360.1) o `playwright install-deps chromium` falha no `apt-get update` do host: `Temporary failure resolving 'azure.archive.ubuntu.com'` (o `/etc/apt/apt-mirrors.txt` do runner aponta para esse espelho, com timeout de cerca de 20 s por índice). Os outros hosts resolvem (checkout, pnpm, npm, cache). Logo a falha é do apt/espelho do runner, independente da versão da imagem; o parecer anterior atribuía a causa ao 26.04, o que o run contradiz.

Correção (commit `1049e819`): os quatro jobs com navegador (`e2e-parte` e `perf`, em `ci.yml` e `homolog.yml`) rodam no container `mcr.microsoft.com/playwright:v1.64.0-noble@sha256:06a9939e57531807f8d5fd76ce44b53165ffb7d7501d87ab10e285c20b1e971f` (`options: --ipc=host`, recomendado para Chromium). Chromium e as bibliotecas de sistema já estão na imagem: somem o `apt`, o download do navegador e o cache `~/.cache/ms-playwright`. Versão do container = `playwright-core` do `pnpm-lock.yaml` (override `1.64.0`, que é o que `playwright --version` e o `chromium.executablePath()` usam; `@playwright/test` está em 1.64.1 e depende dele). A ação local `.github/actions/playwright` virou conferência: se o Chromium esperado não existir (versão do container diferente da do lock), o job falha com mensagem clara. `ci.yml` passou a usar a ação em vez de repetir os passos.

Comparação das opções:
- Container fixado por digest (escolhida): remove a dependência do apt do host, reprodutível (digest), navegador e libs na mesma versão do teste, menos minutos (sem apt e sem download de navegador). Custo: pull da imagem (cerca de 1,5 GB, do `mcr.microsoft.com`, host que não falhou no run) e troca manual de tag e digest ao subir o Playwright (A2).
- Nova tentativa com espelho alternativo (descartada): continua no apt do host, que é justamente o que falha; o espelho alternativo (`archive.ubuntu.com`) também não resolveu no diagnóstico do 093, então o ganho não está provado; exige `sudo` e edição de `apt-mirrors.txt`, e o retry só mascara a falha com mais minutos (cada tentativa gasta cerca de 80 s de timeout).

Mantido `runs-on: ubuntu-24.04` nos quatro jobs (host conhecido, mudança mínima; o container independe da versão do host). Voltar a `ubuntu-latest` fica possível sem mexer no container. Jobs sem navegador seguem em `ubuntu-latest`, sem alteração. Os nomes dos jobs e dos checks não mudam (ruleset e `portao` intactos). Nada de `continue-on-error`, teste pulado ou check desligado (`R-VERIFY`); `permissions:` e ações fixadas por SHA inalteradas. O container roda como root (padrão da imagem) sem segredos montados além dos do job; o `e2e-parte` não usa `services:` (o Postgres é de outro job), então a rede do container não afeta nada.

Validação: `actionlint` ausente do PATH (lacuna registrada; o agente não instala ferramenta). Sintaxe dos três arquivos validada com `yaml.safe_load` (ok). A prova real só vem de um run: o digest foi obtido do manifesto `v1.64.0-noble` no `mcr.microsoft.com` (HTTP 200). Se algum job de container falhar por incompatibilidade (por exemplo, `actions/cache` ou `setup-node` no container), o run do PR mostra e se corrige na mesma branch. Pendências do fluxo: o envio é do dono (commit toca workflow, escopo `workflow`); arquivo protegido de `.github/` pede o rótulo `afrouxa-regra` no PR (catraca).

## Custo e rollback
Custo zero (`R-CUSTO`): imagem pública, runner padrão gratuito, menos minutos que o apt; sem cache de navegador (menos uso da franquia de cache). Rollback: reverter o commit `1049e819` (volta à instalação por apt, que hoje falha) ou trocar para outra tag/digest do mesmo container.
