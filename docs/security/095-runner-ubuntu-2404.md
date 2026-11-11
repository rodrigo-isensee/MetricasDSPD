---
tipo: revisao-seguranca
contrato: 1
pedido: 095-runner-ubuntu-2404
branch: melhoria/runner-ubuntu-2404
commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: 095-runner-ubuntu-2404

Propósito: parecer de segurança (gatilho CI/CD, `R-SEGURANCA`) da troca de runner dos jobs com navegador, commit `60bdc206` sobre a develop `eac38a64`. Revisão estática do diff e do parecer de devops (`docs/devops/095-runner-ubuntu-2404.md`); nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- CI/CD: alteração em `.github/workflows/ci.yml` e `.github/workflows/homolog.yml`.

## Resultado
- **Só os `runs-on` dos jobs com navegador mudaram: conforme.** O diff em `.github/` tem 4 linhas removidas e 8 adicionadas, todas `runs-on: ubuntu-latest` para `runs-on: ubuntu-24.04` mais um comentário com o motivo e o cartão K-269: `ci.yml:195` (`e2e-parte`), `ci.yml:262` (`perf`), `homolog.yml:131` (`e2e-homolog-parte`) e `homolog.yml:179` (`perf-homolog`). Os demais jobs seguem em `ubuntu-latest`.
- **Nenhuma permissão, segredo, gatilho, ação ou passo novo: conforme.** `permissions: contents: read` no topo dos dois arquivos (`ci.yml:14`, `homolog.yml:18`) sem diff; nenhuma referência a `secrets.` nos dois arquivos; `on:` sem diff; sem `pull_request_target`; as ações dos jobs tocados seguem fixadas por SHA (checkout, pnpm/action-setup, setup-node, cache, upload-artifact) e sem diff; nenhum passo incluído ou removido.
- **Cache: conforme.** A chave do Playwright (`playwright-${{ runner.os }}-<versão>`) não muda; `runner.os` é `Linux` nas duas imagens. O escopo do cache (repositório e branch) é o mesmo de antes, sem nova fonte de envenenamento.
- **Efeito de fixar a imagem: aceitável.** `ubuntu-24.04` é imagem hospedada e mantida pelo GitHub, atualizada semanalmente com os pacotes de segurança da distribuição; fixar a versão não congela patches, só adia a troca de versão maior. O passo `playwright install --with-deps` continua instalando dependências pelos espelhos oficiais do Ubuntu, como antes. O risco residual é esquecer a volta e chegar ao fim do suporte da imagem 24.04 no GitHub (A1).
- **Custo (`R-CUSTO`): conforme.** Runner padrão gratuito, mesmos minutos.
- **Lacunas de ferramenta:** `actionlint`, `zizmor` e `gitleaks` não estão no PATH; não rodei nenhum. A mudança é de valor de `runs-on`, sem expressão, script ou segredo novos; fica com o CI.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:194 · fixar ubuntu-24.04 sem data de revisão arrisca esquecer a volta; abrir cartão de retorno a ubuntu-latest (4 jobs: ci.yml e2e-parte e perf, homolog.yml e2e-homolog-parte e perf-homolog) com revisão a cada trimestre. Dono: devops-engineer.

## Plano em cartões
Nenhum bloqueante. A1 ao devops-engineer em cartão próprio (o envio de workflow é do dono, escopo `workflow`), se o tech-lead concordar. O A1 do parecer de devops (nova tentativa na instalação do navegador) não tem efeito de segurança.

## Riscos aceitos
Nenhum.
