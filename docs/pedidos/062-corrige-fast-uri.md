# Pedido 062: corrigir os alertas do fast-uri (produção)

- **Modo:** implementar
- **Objetivo:** corrigir os alertas do Dependabot que chegam à produção, pela escolha "A" do dono na triagem do pedido 060 (2026-11-02)
- **Clareza:** 1 confirmado; 1 suposição; 0 perguntas
- **Depende de:** 060-triagem-dependabot (parecer docs/security/060-triagem-dependabot.md na branch docs/060-triagem-dependabot)

## Escopo
- E1. Override de patch do fast-uri para a versão corrigida (alertas #18 a #25), com o lockfile atualizado e a suíte verde · `confirmado`

## Etapas
- E1.1 (node-backend): override e lockfile, pronto verde.
- E1.2 (tech-lead): code review.
- E1.3 (security-engineer): parecer de segurança (dependência).
- E1.4 (qa-engineer): QA.
- E1.5 (tech-lead): PR para a develop e merge.

## Fora do escopo
- #12, #14 e #15 (dompurify): já corrigidos na develop, fecham com a release · `confirmado`
- #13, #17 e #26 (lhci, só desenvolvimento): ficam para depois · `confirmado`
- #16 (zod 3 no lhci): risco aceito, registrado no parecer · `confirmado`
- Dispensar alerta no GitHub · `suposição` (base: os alertas fecham sozinhos quando a correção chega à branch padrão)

DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.

DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.

DECISÃO TÉCNICA (Jarvis, 2026-11-02): os overrides do projeto ficam em pnpm-workspace.yaml; o brief da E1.1 citava package.json por erro do Jarvis e é corrigido; a entrega 5c85b0e não muda.

## Suposições
- Os alertas fecham sozinhos depois da release na main · base: comportamento do Dependabot.

## Perguntas na fila

## Histórico
- 2026-11-02 19:59: pedido aberto pela escolha "A" do dono na triagem do 060. Recibo enviado.
- 2026-11-02 20:02: recibo confirmado pelo dono: "É isso". Cartão K-198. DECISÃO TÉCNICA (Jarvis): E1.1 na worktree 052h (branch mesclada feature/059-aba-front, limpa), branch nova feature/062-fast-uri a partir da develop, --no-track e push sem -u por causa do .git/config.lock parado; a suíte espera a trava da suíte única se o P1 do 060 estiver rodando.
- 2026-11-02 20:17: E1.1 cumprida pelo node-backend: feature/062-fast-uri em 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09, sem PR. Overrides fast-uri@3: 3.1.9 e fast-uri@4: 4.2.3 em pnpm-workspace.yaml (onde ficam os overrides do projeto; o brief dizia package.json), lockfile só com o fast-uri; pronto rc=0 (fora do sandbox pela store somente leitura).
- 2026-11-02 20:20: conferente em modo entrega: não cumpriu, porque pnpm-workspace.yaml estava fora do Entregar do brief (erro do brief, não do autor). Brief corrigido em nova versão e reconferido; a entrega 5c85b0e segue igual.
- 2026-11-02 20:33: entrega conferida 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09
- 2026-11-03 04:05: E1.3 cumprida pelo security-engineer: parecer de segurança APROVADO em 5c85b0e (parecer 77c463ce28bcaff9991bb85dca5e3336a85a7319); lockfile só com fast-uri 3.1.9 e 4.2.3, os corrigidos de #18 a #25; nenhum pacote nem fonte nova; alertas fecham pelo Dependabot depois do merge, sem fechar à mão. A1 recomendado: integridade não conferida contra o registry (sem rede; a instalação congelada da CI valida).
- 2026-11-03 04:06: E1.2 cumprida pelo tech-lead: code review APROVADO em 5c85b0e (parecer d5499aa88abcd981f19c21b7e500d2856b4c7d61); 2 arquivos, 25 linhas; overrides só de patch (3.1.8 para 3.1.9 e 4.2.2 para 4.2.3); nenhuma outra dependência muda. A1 recomendado: tirar os overrides quando fastify, swagger e type-provider exigirem a faixa corrigida. Próximo: conferente das duas entregas paralelas (review e segurança); QA (E1.4).
- 2026-11-03 04:11: entregas paralelas de review (E1.2) e segurança (E1.3) conferidas juntas (forge-check entrega com os dois briefs): as duas cumpriram.
- 2026-11-03 04:11: entrega conferida d5499aa88abcd981f19c21b7e500d2856b4c7d61
- 2026-11-03 04:16: E1.4 cumprida pelo qa-engineer: QA APROVADO em 5c85b0e (parecer 7123ec3), sem bugs; lockfile só com o fast-uri e os 4 consumidores em 3.1.9 ou 4.2.3; 222 testes unitários do server que passam pelo fastify verdes; pronto, testes com PostgreSQL, E2E e lhci ficam para a CI do PR (A1 recomendado).
- 2026-11-03 04:16: forge-check pr do 062 aponta só: docs/reviews/062-fast-uri.md sem registro de autoria do tech-lead. DECISÃO TÉCNICA (Jarvis): volta 1 da E1.2 ao tech-lead para regravar o parecer pela ferramenta Write, com o mesmo conteúdo e o mesmo veredito, antes do PR (E1.5).
- 2026-11-03 04:20: volta 1 da E1.2 cumprida pelo tech-lead: parecer de review regravado pela ferramenta Write (6984a2785b1803fae3f1bb8906f609ce2f1e6456), mesmo veredito e mesmo commit; forge-check pr do 062 sem saída. Próximo: conferente; PR e merge (E1.5).
- 2026-11-03 04:20: entrega conferida 7123ec3054ce52eebafe1e31507bc547e8dda7ed
- 2026-11-03 04:23: entrega conferida 6984a2785b1803fae3f1bb8906f609ce2f1e6456
- 2026-11-03 04:47: E1.5 cumprida pelo tech-lead: PR 206 (https://github.com/rodrigo-isensee/MetricasDSPD/pull/206) mesclado por squash na develop em c6a75a03245d6672c18c7c689df6e58ae930b51f; update-branch para 173e033, todos os checks verdes, CLEAN; sem --admin; nenhum alerta fechado à mão. Próximo: conferente; conferir depois se o Dependabot fechou #18 a #25.
