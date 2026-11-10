Agente destino: forge:security-engineer
Pedido: 085-suite-unica-trava-no-pronto
Tipo: review
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: seguranca   Cobre: E1.6
Revisar-sha: 5369e9cc9e6c2df45a4f65670e8a9d98f56bf30d

## Objetivo
Parecer de segurança da correção do teste 4 de `scripts/suite-unica.test.sh` (pedido 085, K-256): o `forge-check pr` classifica o diff como classe C (arquivo sensível da catraca) e exige revisão de segurança. Correção 5369e9cc, parecer de devops bd718484, review 39c901d9 e QA bf81b471 aprovados. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/085-suite-unica-pronto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce bd71848448453830357a0b91207914a1237bfaa6 -- scripts` e `scripts/suite-unica.sh` (a trava que o teste prova).

## Entregar
- "E1.6 (security-engineer): parecer de segurança (o forge-check pr classifica o diff como classe C, arquivo sensível da catraca)." (E1.6)
- (E1) (E1.6) Revisão estática: a mudança no teste não afrouxa a trava da suíte (`scripts/suite-unica.sh` não mudou), não abre caminho para pular a trava fora de uma suíte que já a segura, não lê nem grava fora de `/tmp/claude-<uid>` e do diretório temporário do teste, e não depende de variável que um processo de fora possa forjar para esconder defeito. Grave `docs/security/085-suite-unica-pronto.md` (novo) pela ferramenta Write, uma vez só, no formato de parecer do projeto, com `pedido: 085-suite-unica-trava-no-pronto`, `branch: feature/085-suite-unica-pronto`, `commit: bd71848448453830357a0b91207914a1237bfaa6`, veredito e `## Achados` (até 300 caracteres por achado). O security-engineer não tem Bash: o parecer fica sem commit na worktree, e o tech-lead o leva ao PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 085-suite-unica-trava-no-pronto até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/085-suite-unica-trava-no-pronto.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056d/docs/security/085-suite-unica-pronto.md`
- PQ-2 (cmd): `grep -c '^commit: bd71848448453830357a0b91207914a1237bfaa6' /home/rodrigoisensee/MetricasDSPD-056d/docs/security/085-suite-unica-pronto.md` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
