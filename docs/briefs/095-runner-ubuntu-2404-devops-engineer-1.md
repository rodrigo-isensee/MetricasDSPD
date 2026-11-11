Agente destino: forge:devops-engineer
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: melhoria/runner-ubuntu-2404   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.1

## Objetivo
Os jobs com navegador falham no runner Ubuntu 26.04 (`ubuntu-latest` mudou): o apt não resolve os espelhos do Ubuntu ao instalar as dependências do Playwright. Fixar `ubuntu-24.04` só nesses jobs. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `melhoria/runner-ubuntu-2404` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (o diagnóstico).
- `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/ci.yml` e `/home/rodrigoisensee/MetricasDSPD-052h/.github/workflows/homolog.yml`.

## Entregar
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." (E1.1)
- (E1) (E1.1) Trocar `runs-on: ubuntu-latest` por `runs-on: ubuntu-24.04` só nos jobs que instalam navegador (os de e2e e perf, nos dois workflows), com um comentário curto do motivo; nada mais muda. Validar a sintaxe dos dois arquivos (actionlint se houver, senão um parser de YAML). Parecer `docs/devops/095-runner-ubuntu-2404.md` (novo) pela ferramenta Write, com o motivo, os jobs tocados e a volta ao `ubuntu-latest` quando a imagem 26 resolver o DNS. Commit com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos três caminhos); sem push (o dono envia).
- arquivos: .github/workflows/ci.yml, .github/workflows/homolog.yml, docs/devops/095-runner-ubuntu-2404.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -1 --format=%B` · espera: contém 'Cartão: K-269'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
