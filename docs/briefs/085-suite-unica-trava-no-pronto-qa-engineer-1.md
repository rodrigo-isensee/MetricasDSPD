Agente destino: forge:qa-engineer
Pedido: 085-suite-unica-trava-no-pronto
Tipo: qa
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: qa   Cobre: E1.3
Revisar-sha: 5369e9cc9e6c2df45a4f65670e8a9d98f56bf30d

## Objetivo
QA da correção da trava do teste 4 de `scripts/suite-unica.test.sh` sob `pnpm run pronto` (pedido 085, K-256): commit da correção 5369e9cc, parecer de devops bd71848448453830357a0b91207914a1237bfaa6, review aprovado (39c901d9). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/085-suite-unica-pronto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce bd71848448453830357a0b91207914a1237bfaa6 -- scripts`.

## Entregar
- "E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar)." (E1.3)
- (E1) (E1.3) Rodar na worktree `bash scripts/suite-unica.test.sh` sozinho (o caminho padrão provado) e `pnpm run pronto` inteiro (tarefa pesada, uma por vez; instale as dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile --store-dir` num diretório do scratchpad, `registry.npmjs.org` em allowed_domains), registrando que o teste 4 não pendura e o tempo total; falhas do `pronto` que já existiam na develop e não têm relação com a correção (como as dos testes de entrada do server que lançam `tsx` no sandbox) ficam como achado com a evidência. Grave `docs/qa/085-suite-unica-pronto.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 085-suite-unica-trava-no-pronto`, `branch: feature/085-suite-unica-pronto`, `commit: bd71848448453830357a0b91207914a1237bfaa6`, veredito, contagem de bugs e `## Achados` (até 300 caracteres por achado); commit só do parecer com `Cartão: K-256` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/085-suite-unica-pronto` (`github.com` em allowed_domains); sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 085-suite-unica-trava-no-pronto até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/085-suite-unica-trava-no-pronto.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/085-suite-unica-pronto:docs/qa/085-suite-unica-pronto.md` · espera: contém 'commit: bd71848448453830357a0b91207914a1237bfaa6'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
