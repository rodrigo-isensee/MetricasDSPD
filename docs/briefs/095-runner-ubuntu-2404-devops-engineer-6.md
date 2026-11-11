Agente destino: forge:devops-engineer
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: melhoria/runner-ubuntu-2404   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.9

## Objetivo
Os jobs com navegador seguem falhando no PR 318 mesmo no ubuntu-24.04 (Image 20261101.360.1): "Temporary failure resolving 'azure.archive.ubuntu.com'" no `playwright install-deps chromium` (run 43058313572). A falha não é da imagem, é do apt do runner. Branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 4a59c880.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/ci.yml` (linhas 190 a 300), `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/homolog.yml` e `/home/rodrigoisensee/MetricasDSPD-052h/.github/actions/playwright/action.yml`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md`.
- O log do run 43058313572 (`gh run view 43058313572 --log-failed`, com `api.github.com` e `*.actions.githubusercontent.com` em allowed_domains).

## Entregar
- "E1.9 (devops-engineer): a troca de imagem não resolveu (PR 318); diagnóstico e correção que não dependa do apt do runner na instalação do navegador (por exemplo, rodar os jobs com navegador no container oficial do Playwright, de versão fixada, ou instalar com nova tentativa e espelho alternativo), na mesma branch e worktree; commit sem push (workflow: o envio é do dono)." (E1.9)
- (E1) (E1.9) Escolher a correção com o motivo (comparar ao menos container fixado por digest e nova tentativa com espelho), sem afrouxar o que os testes provam, sem `continue-on-error` e sem pular teste; a versão do Playwright do container igual à do `pnpm-lock.yaml`. Se a escolha manter `ubuntu-24.04` ou voltar ao `ubuntu-latest`, dizer. Validar a sintaxe dos workflows (actionlint, se houver; senão um parser de YAML). Atualizar o parecer `docs/devops/095-runner-ubuntu-2404.md` pela ferramenta Write com o diagnóstico novo e `commit:` do commit da correção. Dois commits com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito): primeiro a correção, depois o parecer. Sem push (o dono envia, porque o commit toca workflow).
- arquivos: [.]github/workflows/ci.yml, [.]github/workflows/homolog.yml, [.]github/actions/playwright/action.yml, docs/devops/095-runner-ubuntu-2404.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código (60bdc206), enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -2 --format=%B` · espera: contém 'Cartão: K-269'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
