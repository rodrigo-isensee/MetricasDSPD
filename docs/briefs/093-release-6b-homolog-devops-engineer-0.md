## Objetivo
O portão da homolog (workflow homolog.yml, run 43042533708, sobre o merge do PR 313) e o CI do PR de release 314 (run 43042964812) falharam só nos jobs com navegador (`e2e-homolog` partes 1 e 2, `perf-homolog`, `e2e-parte` 1 e 2, `perf`), no passo de instalar as dependências do Playwright: "Failed to install browser dependencies" com `Temporary failure resolving 'security.ubuntu.com'`, num runner com a imagem Ubuntu 26 ("resolute"). Os demais jobs passaram. Com o portão vermelho, o check `homolog-aprovada` do PR 314 fica reprovado e a release do 6b não pode ir à main.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/.github/workflows/homolog.yml` e o workflow do CI do PR (os jobs com navegador e o `runs-on` deles).
- `gh run view 43042533708 --repo rodrigo-isensee/MetricasDSPD --log-failed` (só o trecho do passo que falhou).

## Entregar
- "E1.9 (devops-engineer): desbloqueio do portão da homolog (reexecução dos jobs com navegador que falharam por DNS no runner; se repetir, diagnóstico e correção do runner em PR próprio)." (E1.9)
- (E1) (E1.9) Primeiro, reexecutar só os jobs que falharam: `gh run rerun 43042533708 --repo rodrigo-isensee/MetricasDSPD --failed` e `gh run rerun 43042964812 --repo rodrigo-isensee/MetricasDSPD --failed`, e esperar o resultado em laços de até 170 s por chamada. Se passarem, conferir que o `homolog-aprovada` do PR 314 ficou verde (ele se reavalia sozinho) e relatar. Se falharem de novo pelo mesmo erro de DNS do apt, não mudar nada nesta delegação: gravar pela ferramenta Write o diagnóstico em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (novo) com a causa provável (imagem nova do runner) e a correção proposta (fixar `ubuntu-24.04` nos jobs com navegador, ou nova tentativa no apt), sem commit; a mudança de workflow vai em branch e PR próprios depois, com o envio do arquivo de workflow pelo dono. Sem commit nem push nesta delegação.
- arquivos: docs/devops/093-runner-ubuntu26-dns.md

## Pronto quando
- PQ-1 (cmd): `gh run view 43042533708 --repo rodrigo-isensee/MetricasDSPD --json conclusion --jq .conclusion` · espera: contém 'success'
