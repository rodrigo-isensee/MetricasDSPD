Agente destino: forge:qa-engineer
Pedido: 083-pre-push-lint-alterados
Tipo: qa
Branch: feature/083-pre-push-lint   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: qa   Cobre: E1.3

## Objetivo
QA do pedido 083 (K-249): o pre-push com lint só nos `.ts`/`.tsx` alterados, com cache, pulando quando não há nenhum; a CI segue com o lint inteiro. Código em e19c23b3674a660cad88150b218c7897a6d77d5a (review aprovado em 2ae86c46). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/083-pre-push-lint`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052e diff 54f02c42b51aba3355e9f0428f058113f916c4c9...e19c23b3674a660cad88150b218c7897a6d77d5a` e o review da branch (`git -C /home/rodrigoisensee/MetricasDSPD-052e show origin/feature/083-pre-push-lint:docs/reviews/083-pre-push-lint-alterados.md` (novo)).

## Entregar
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." (E1.3)
- (E1) (E1.3) Testar em cópia descartável fora da worktree (por exemplo, `git worktree add` em `/tmp/claude-1000/qa-083/` de e19c23b3, removida no fim): rodar `bash scripts/lint-alterados.sh` (1) sem nenhum `.ts`/`.tsx` alterado contra origin/develop: pula com a linha esperada; (2) com um `.ts` alterado com erro de lint: reprova; (3) com o mesmo arquivo corrigido: passa; (4) só com `.md` alterado: pula; (5) com `.ts` removido: não vai ao eslint; conferir que a CI do projeto (`.github/workflows/`) segue rodando `eslint .` inteiro (leitura); rodar `bash scripts/lint-alterados.test.sh`; mutação à mão no script (tirar `--diff-filter=d`, inverter o teste de lista vazia) e registrar se os testes reprovam. Nada de push de teste ao GitHub. Parecer em `docs/qa/083-pre-push-lint-alterados.md` gravado inteiro pela ferramenta Write, com `pedido: 083-pre-push-lint-alterados`, `branch: feature/083-pre-push-lint`, `commit: e19c23b3674a660cad88150b218c7897a6d77d5a`, veredito, contagem de bugs e bloco `## Achados` (até 300 caracteres, regra só pelo ID); commit só do parecer com `Cartão: K-249` (mensagem por `git commit -F` com arquivo gravado por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-083.txt`, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052e pull --ff-only origin feature/083-pre-push-lint`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/083-pre-push-lint` em segundo plano, com corte em 15 minutos; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- - 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- 2026-11-09 02:07: DECISÃO TÉCNICA (Jarvis): etapa E1.6 (security-engineer) acrescentada: o forge-check pr do 083 exige revisão de segurança (o pre-push é controle local). Corre em paralelo ao QA.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`; comandos com mais de 2 minutos em segundo plano.
- NÃO tocar: `.githooks/` (do dono), os scripts e o código do lote, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e show origin/feature/083-pre-push-lint:docs/qa/083-pre-push-lint-alterados.md` · espera: contém 'commit: e19c23b3674a660cad88150b218c7897a6d77d5a'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
