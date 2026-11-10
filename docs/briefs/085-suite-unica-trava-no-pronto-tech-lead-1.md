Agente destino: forge:tech-lead
Pedido: 085-suite-unica-trava-no-pronto
Tipo: review
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: review   Cobre: E1.2
Revisar-sha: 5369e9cc9e6c2df45a4f65670e8a9d98f56bf30d

## Objetivo
Review da correção da trava do teste 4 de `scripts/suite-unica.test.sh` sob `pnpm run pronto` (pedido 085, K-256): commit 5369e9cc (teste) e parecer de devops bd71848448453830357a0b91207914a1237bfaa6, entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/085-suite-unica-pronto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce bd71848448453830357a0b91207914a1237bfaa6` (o teste e o parecer de devops).

## Entregar
- "E1.2 (tech-lead): review." (E1.2)
- (E1) (E1.2) Review: o teste 4 não pendura dentro de uma suíte que segura a trava padrão e, fora dela, continua provando que a segunda chamada espera a primeira; a trava do `scripts/suite-unica.sh` e a CI não mudaram; avalie a observação do conferente (o caso pulado é só impresso, sem asserção, e o ramo da sonda `flock -n` não foi exercitado) e diga se fica como recomendado ou volta. Rode `bash scripts/suite-unica.test.sh` sozinho e `bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh` na worktree. Grave `docs/reviews/085-suite-unica-pronto.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 085-suite-unica-trava-no-pronto`, `branch: feature/085-suite-unica-pronto`, `commit: bd71848448453830357a0b91207914a1237bfaa6`, veredito e `## Achados` (até 300 caracteres por achado); commit só do parecer com `Cartão: K-256` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/085-suite-unica-pronto` (`github.com` em allowed_domains); sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 085-suite-unica-trava-no-pronto até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/085-suite-unica-trava-no-pronto.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/085-suite-unica-pronto:docs/reviews/085-suite-unica-pronto.md` · espera: contém 'commit: bd71848448453830357a0b91207914a1237bfaa6'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
