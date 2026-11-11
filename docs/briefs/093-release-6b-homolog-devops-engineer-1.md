Agente destino: forge:devops-engineer
Pedido: 093-release-6b-homolog
Tipo: merge
Branch: origin/homolog   Base: main   Base-sha: 9bb2a5bee0a2af4cf9eee71863da1b662ff25fc1
Etapa: pedido-de-merge-ao-dono   Cobre: E1.9

## Objetivo
O portão da homolog (workflow homolog.yml, run 43042533708, sobre o merge do PR 313) e o CI do PR de release 314 (run 43042964812) falharam só nos jobs com navegador (`e2e-homolog` partes 1 e 2, `perf-homolog`, `e2e-parte` 1 e 2, `perf`), no passo de instalar as dependências do Playwright: "Failed to install browser dependencies" com `Temporary failure resolving 'security.ubuntu.com'`, num runner com a imagem Ubuntu 26 ("resolute"). Os demais jobs passaram. Com o portão vermelho, o check `homolog-aprovada` do PR 314 fica reprovado e a release do 6b não pode ir à main.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/.github/workflows/homolog.yml` e o workflow do CI do PR (os jobs com navegador e o `runs-on` deles).
- `gh run view 43042533708 --repo rodrigo-isensee/MetricasDSPD --log-failed` (só o trecho do passo que falhou).

## Entregar
- "E1.9 (devops-engineer): desbloqueio do portão da homolog (reexecução dos jobs com navegador que falharam por DNS no runner; se repetir, diagnóstico e correção do runner em PR próprio)." (E1.9)
- (E1) (E1.9) Primeiro, reexecutar só os jobs que falharam: `gh run rerun 43042533708 --repo rodrigo-isensee/MetricasDSPD --failed` e `gh run rerun 43042964812 --repo rodrigo-isensee/MetricasDSPD --failed`, e esperar o resultado em laços de até 170 s por chamada. Se passarem, conferir que o `homolog-aprovada` do PR 314 ficou verde (ele se reavalia sozinho) e relatar. Se falharem de novo pelo mesmo erro de DNS do apt, não mudar nada nesta delegação: gravar pela ferramenta Write o diagnóstico em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (novo) com a causa provável (imagem nova do runner) e a correção proposta (fixar `ubuntu-24.04` nos jobs com navegador, ou nova tentativa no apt), sem commit; a mudança de workflow vai em branch e PR próprios depois, com o envio do arquivo de workflow pelo dono. Sem commit nem push nesta delegação.
- arquivos: docs/devops/093-runner-ubuntu26-dns.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até 632e60e947bfed72300e678824bbe825e99937da2a24a179a76b2ade3f5f0472 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh run view 43042533708 --repo rodrigo-isensee/MetricasDSPD --json conclusion --jq .conclusion` · espera: contém 'success'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
