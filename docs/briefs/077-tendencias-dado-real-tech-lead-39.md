Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: merge
Branch: feature/077-l8b-tela-contagem-parcial   Base: develop   Base-sha: 04fe7b86568705c17e4da922d54febbe8148ec2d
Etapa: merge-integracao   Cobre: E2.4

## Objetivo
Preparar o Lote 8b das tendências com dado real (K-211, pedido 077) para o PR, agora que o 6b está na develop (PR 276, squash): commitar o parecer de interface já escrito pelo ux-designer, trazer a develop e enviar a branch. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/077-l8b-tela-contagem-parcial` (head 74e413d17be23dd923247c432c508afed8ab16e5).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/077-revisao-l8b.md` (novo), só o cabeçalho (branch, commit e veredito).

## Entregar
- "E2.4 (tech-lead): PR por lote, depois do QA." (E2.4) Nesta delegação, só a preparação da branch do 8b (o PR vem em delegação própria).
- (E2) (E2.4) Na worktree, conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` = `feature/077-l8b-tela-contagem-parcial`; commitar só `docs/ux/077-revisao-l8b.md` (`git add` explícito pelo caminho; mensagem `docs(ux): revisão de interface do lote 8b do 077` com `Cartão: K-211`, por `git commit -F` de arquivo gravado por Write no scratchpad).
- (E2) (E2.4) `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052d merge --no-ff origin/develop` (mensagem `merge: develop em feature/077-l8b-tela-contagem-parcial` por `git commit -F`). Conflito: o 6b entrou na develop por squash com o mesmo conteúdo dos commits do 6b que a branch já tem; em arquivo do 6b, fique com a versão da branch do 8b (`git checkout --ours` e `git add` desse caminho) e confira depois que `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 74e413d17be23dd923247c432c508afed8ab16e5 HEAD -- web` lista só o que a develop trouxe de fora do 6b e do 8b; conflito em outro arquivo: `git merge --abort`, pare e relate.
- (E2) (E2.4) Push em primeiro plano, timeout de 600 s: `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/077-l8b-tela-contagem-parcial` (`github.com` em allowed_domains); sem PR.
- (E2) (E2.4) Herdados da branch do 8b, nada a entregar aqui: `web/src/features/operacional/resumo/SerieMensal.tsx`, `web/src/features/operacional/resumo/componentes.test.tsx` e `web/src/features/operacional/resumo/modelo.ts` (commit aa137dd451a22454409ccd833ecd0d11925590a1, entrega conferida) e os pareceres de review e QA do 8b; o merge da develop não os muda (`git diff 74e413d1 HEAD -- web` vazio).
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- 2026-11-10 09:56: DECISÃO TÉCNICA (Jarvis): a conferência do preparo do 8b (tech-lead-36) deu "fora do escopo" só porque o Entregar não nomeia os três arquivos do 8b (web/src/features/operacional/resumo/SerieMensal.tsx, componentes.test.tsx e modelo.ts, commit aa137dd4, conferido às 09:30), que o diff da branch contra a develop lista. O brief tech-lead-39 é o -36 com esses arquivos nomeados como herdados; não é delegado: a entrega c55c5a64 é conferida contra ele.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; `docs/ux/080-revisao-leia-junto.md` (não rastreado, de outro pedido) fica como está.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d merge-base --is-ancestor origin/develop origin/feature/077-l8b-tela-contagem-parcial` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/077-l8b-tela-contagem-parcial:docs/ux/077-revisao-l8b.md` · espera: contém 'commit: aa137dd451a22454409ccd833ecd0d11925590a1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
