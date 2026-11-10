Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: review
Branch: feature/077-l6b-tela-ressalva   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: review   Cobre: E2.2
Revisar-sha: 832583168c7c0247bd0a9093c73649b7a31b5417

## Objetivo
Review incremental do Lote 6b das tendências com dado real (K-211, pedido 077, ressalva do S2 na tendência de SLA) depois da integração da develop (o 4b, já na develop, mexe nos mesmos arquivos de tela e de teste): o parecer de review (b9291559) ficou desatualizado. Head 832583168c7c0247bd0a9093c73649b7a31b5417 (enviado). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/077-l6b-tela-ressalva`.

## Ler
- O seu parecer na branch (`docs/reviews/077-l6b-tela-ressalva.md` (novo), na worktree) e a saída do `forge-check parecer delta` desse parecer, rodada pelo Jarvis na worktree (o `forge-check` do PATH está quebrado): intervalo 1335576d27fca37b7e7781b18c5a31fc89dbc91a..832583168c7c0247bd0a9093c73649b7a31b5417, "escopo: sem o que veio da base (develop)", "delta: nenhum arquivo do domínio mudou". O `forge-check pr` marca o parecer como desatualizado porque `componentes.test.tsx` mudou depois dele pelo merge da develop.

## Entregar
- "E2.2 (tech-lead): review por lote." (E2.2) Nesta delegação, só o review incremental do 6b.
- (E2) (E2.2) Conferir que a resolução do merge junta os dois lotes sem perda: em `web/src/features/operacional/resumo/TendenciaSustentacao.tsx`, a janela incompleta (4b) e a ressalva do S2 (6b) valem juntas; `componentes.test.tsx` tem os casos dos dois lotes, sem caso enfraquecido; o resto do diff é só o que a develop trouxe. Regrave `docs/reviews/077-l6b-tela-ressalva.md` inteiro pela ferramenta Write, com `commit: 832583168c7c0247bd0a9093c73649b7a31b5417`, veredito e bloco `## Achados` (até 300 caracteres por achado; os antigos que seguem valendo continuam); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s na ferramenta, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/077-l6b-tela-ressalva` (`github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- paralelo na mesma branch: parecer, lê a branch sem escrever nela (Z10)
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; `docs/ux/080-revisao-leia-junto.md` (não rastreado, de outro pedido) fica como está.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/077-l6b-tela-ressalva:docs/reviews/077-l6b-tela-ressalva.md` · espera: contém 'commit: 832583168c7c0247bd0a9093c73649b7a31b5417'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
