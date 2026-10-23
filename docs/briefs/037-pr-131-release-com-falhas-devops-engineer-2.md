Agente destino: forge:devops-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: homolog   Base: main   Base-sha: 17fee180dbb798955eaaed9517e371652f7ca9ce

## Objetivo
Destravar o PR de release #144 (homolog → main): o check `homolog-aprovada` falhou às 16:35:58Z porque rodou antes de o job `portao 7486836...` do `homolog.yml` (run 39984250260) terminar, e esse job terminou verde depois. É a corrida do K-108. Etapa E2.9 do pedido 037, cartão K-113. Basta rodar de novo o check.

## Ler
- `gh pr checks 144` e `gh run view 39988086638 --log-failed` (a falha "portão de homolog sem sucesso em 7486836").
- `gh run view 39984250260` (portão verde no mesmo sha).

## Entregar
- (E2) Conferir que o head do #144 continua 7486836addd257f6f0bd358e946a5cfd7d1802b2 e que o portão (run 39984250260) está `success`.
- (E2) Rodar de novo só o job que falhou do run 39988086638 (`gh run rerun 39988086638 --failed`) e esperar terminar.
- (E2) Relatar o resultado do `homolog-aprovada` e o `mergeStateStatus` do #144. Se falhar de novo, pare e relate o log, sem mudar workflow nem regra.
- (E2) Parecer de devops: não se aplica, porque nada em `.github/`, Dockerfile, compose ou IaC muda. A corrida em si é o K-108, que fica no pedido 041 (E3.2).

## Fora do escopo
- "E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar." · etapa de outro papel, cumprida (#144).
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." e "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." · etapas de outro papel, cumpridas.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde. Feito pelo dono em 2026-10-21 13:10 (merge 17fee18), antes do 037 entrar: a correção do C6 vai na próxima release (E2.8)." · etapa do dono.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Mesclar o #144 (é do dono, R-MAIN); mudar workflows; commit; corrigir o K-108.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136. (Superada pelo ato do dono: o #136 foi mesclado em 2026-10-21 13:10; ver E2.5 e E2.8.)
- DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).
- DECISÃO DO DONO (2026-10-23): homolog-aprovada do #144, opção A ("A"): o devops-engineer roda de novo o check, com o custo de ~7 s de Actions; o merge do #144 na main continua do dono.
- ADR 0003 (citada no pedido): os checks de performance não mudam nesta etapa; o `perf-homolog` já passou no portão.
- ADR 0021 (citada no pedido): nada a mudar nesta etapa.
- R-MAIN: nada na `main`. R-CONFORMIDADE: check vermelho não se contorna. O hook barra `$`, crase e `?` no Bash.

## Pronto quando
- PQ-1 (run): `gh run view 39988086638 --json conclusion --jq .conclusion` · espera: igual 'success'
- PQ-2 (pr): `gh pr view 144 --json state,mergeStateStatus` · espera: contém 'OPEN'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
