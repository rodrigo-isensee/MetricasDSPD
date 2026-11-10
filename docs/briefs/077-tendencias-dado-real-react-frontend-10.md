Agente destino: forge:react-frontend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l6b-tela-ressalva   Base: develop   Base-sha: ab423d02fa03d131f2bf48841c83fb9b7e8009d9
Etapa: codigo   Cobre: E2.5

## Objetivo
Retomada da integração da develop no 6b (a sessão reiniciou com o merge em curso). Integrar a develop no Lote 6b das tendências com dado real (K-211, pedido 077, ressalva do S2 na tendência de SLA): o merge da develop deu conflito porque o 4b (janela incompleta na sustentação), já na develop, mexe nos mesmos arquivos de tela e de teste. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/077-l6b-tela-ressalva`, head local 7449086e (parecer de UX commitado, sem push; o remoto está em 9907be6e).

## Ler
- O conflito: `git -C /home/rodrigoisensee/MetricasDSPD-056d merge --no-ff origin/develop` e, nos arquivos em conflito, os dois lados (`web/src/features/operacional/resumo/componentes.test.tsx` e o parecer de review do lote 4b, que já ficou com a versão da develop).
- `web/src/features/operacional/resumo/TendenciaSustentacao.tsx` depois do merge (auto-merge), só as partes da janela incompleta (4b) e da ressalva do S2 (6b).

## Entregar
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." (E2.5) Nesta delegação, só a integração da develop no 6b.
- (E2) (E2.5) Retomada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56): a delegação anterior (react-frontend-9) parou com a sessão no meio do merge: a worktree está com `MERGE_HEAD`, sem arquivo em conflito, e `docs/ux/080-revisao-leia-junto.md` não rastreado (de outro pedido: não adicionar nem apagar). Conferir pelos critérios do item seguinte que a resolução já feita está certa (parecer do 4b igual ao da develop; teste com os casos dos dois lotes; tela com a janela incompleta e a ressalva); se estiver, concluir o merge com `git commit -F`; se não, corrigir só o necessário antes. Depois, trazer a develop atual de novo (`git fetch origin` e `git merge --no-ff origin/develop`; ela já tem os PRs 273, 274 e 275), com as mesmas regras de conflito, e seguir para a validação e o push.
- (E2) (E2.5) Na worktree, conferir `git branch --show-current` = `feature/077-l6b-tela-ressalva`; `git fetch origin`; `git merge --no-ff origin/develop` (mensagem `merge: develop em feature/077-l6b-tela-ressalva` por `git commit -F` de arquivo gravado por Write no scratchpad). Resolver: o parecer de review do lote 4b fica com a versão da develop, sem edição (no merge em curso ele já está assim no índice; num conflito novo nele, `git checkout --theirs` e `git add` só desse caminho, sem abrir o arquivo); `componentes.test.tsx` fica com os casos dos dois lotes (os do 4b, da develop, e os do 6b), sem apagar nem enfraquecer nenhum. Se o auto-merge de `TendenciaSustentacao.tsx` não juntar os dois comportamentos (janela incompleta e ressalva), ajuste só o mínimo para os dois valerem juntos, pela `docs/ux/077-tendencias.md`. Conflito em outro arquivo: `git merge --abort`, pare e relate.
- (E2) (E2.5) Validar com no máximo 2 workers: os testes de `web/src/features/operacional/resumo/` (vitest, `--maxWorkers=2`), o typecheck e o lint do pacote web; tudo verde. Push em primeiro plano, timeout de 600 s na ferramenta: `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/077-l6b-tela-ressalva` (`github.com` em allowed_domains); sem PR. O review e o QA incrementais do merge vêm em outras delegações.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- forge-check: use `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.45.0/bin/forge-check` (o `forge-check` do PATH aponta para a cópia do Windows, quebrada; DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056d merge-base --is-ancestor origin/develop origin/feature/077-l6b-tela-ressalva` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff origin/develop origin/feature/077-l6b-tela-ressalva -- docs/reviews/077-l4b-tela-janela-sust.md` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d status --porcelain --untracked-files=no` · espera: linhas=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
