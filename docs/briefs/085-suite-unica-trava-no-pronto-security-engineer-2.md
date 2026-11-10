Agente destino: forge:security-engineer
Pedido: 085-suite-unica-trava-no-pronto
Tipo: review
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: seguranca   Cobre: E1.6
Revisar-sha: 5369e9cc9e6c2df45a4f65670e8a9d98f56bf30d

## Objetivo
Volta só para commitar e enviar o parecer já gravado. Parecer de segurança da correção do teste 4 de `scripts/suite-unica.test.sh` (pedido 085, K-256): o `forge-check pr` classifica o diff como classe C (arquivo sensível da catraca) e exige revisão de segurança. Correção 5369e9cc, parecer de devops bd718484, review 39c901d9 e QA bf81b471 aprovados. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/085-suite-unica-pronto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce bd71848448453830357a0b91207914a1237bfaa6 -- scripts` e `scripts/suite-unica.sh` (a trava que o teste prova).

## Entregar
- "E1.6 (security-engineer): parecer de segurança (o forge-check pr classifica o diff como classe C, arquivo sensível da catraca)." (E1.6)
- (E1) (E1.6) Volta (DECISÃO TÉCNICA do Histórico do 085 de 2026-11-10 12:07): o parecer `docs/security/085-suite-unica-pronto.md` já está gravado na worktree `/home/rodrigoisensee/MetricasDSPD-056d`, sem commit. Não mude o conteúdo. Commite só esse arquivo, com `git add` explícito pelo caminho e mensagem `docs(security): parecer de segurança do pedido 085` com `Cartão: K-256` (por `git commit -F` de arquivo gravado por Write no scratchpad); `docs/ux/080-revisao-leia-junto.md` (não rastreado, de outro pedido) fica fora. Push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/085-suite-unica-pronto` (`github.com` em allowed_domains); sem PR.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/085-suite-unica-pronto:docs/security/085-suite-unica-pronto.md` · espera: contém 'commit: bd71848448453830357a0b91207914a1237bfaa6'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
