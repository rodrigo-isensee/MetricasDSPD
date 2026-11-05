Agente destino: forge:node-backend
Pedido: 062-corrige-fast-uri
Tipo: codigo
Branch: feature/062-fast-uri   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E1.1

## Objetivo
Corrigir os alertas #18 a #25 do Dependabot (fast-uri, que chega à produção pela cadeia do fastify) com override de patch (pedido 062, E1.1, K-198). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch nova `feature/062-fast-uri`.

## Ler
- Na branch `docs/060-triagem-dependabot` do remoto: `docs/security/060-triagem-dependabot.md`, linhas dos alertas #18 a #25 (versão instalada e corrigida, cadeia).
- `pnpm-workspace.yaml` (bloco `overrides`, onde ficam os overrides do projeto) e `pnpm-lock.yaml`.

## Entregar
- "E1.1 (node-backend): override e lockfile, pronto verde." (E1.1)
- (E1) Esta versão é a referência para reconferir a entrega já feita (5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09): não refazer os passos; a branch `feature/062-fast-uri` já existe a partir da develop d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9.
- (E1) Override do fast-uri em `pnpm-workspace.yaml` para a menor versão corrigida indicada no parecer, na mesma linha maior; `pnpm install` atualiza o lockfile; `pnpm why fast-uri` mostra só a versão corrigida.
- (E1) `pnpm run pronto` verde na raiz da worktree.
- (E1) Commit pela seção de commits do `docs/engineering/praticas.md` com `Cartão: K-198`, `git add` de `pnpm-workspace.yaml` e `pnpm-lock.yaml` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/062-fast-uri`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.
- DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.
- 2026-11-02 20:02: recibo confirmado pelo dono: "É isso". Cartão K-198. DECISÃO TÉCNICA (Jarvis): E1.1 na worktree 052h (branch mesclada feature/059-aba-front, limpa), branch nova feature/062-fast-uri a partir da develop, --no-track e push sem -u por causa do .git/config.lock parado; a suíte espera a trava da suíte única se o P1 do 060 estiver rodando.
- DECISÃO DO DONO (2026-11-02): "isso" (recibo da triagem): o security-engineer tria os 15 alertas do Dependabot só lendo, com parecer e recomendação por alerta; nenhuma dependência é atualizada e nenhum alerta é dispensado nesta etapa; a correção vira pedido próprio depois da escolha do dono.
- DECISÃO DO DONO (2026-11-02): "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes": o painel deixa de usar o mock e nada regera dado fictício.
- DECISÃO DO DONO (2026-11-02): "É isso é urgente para não misturar dados reais com falsos" (recibo do E2): o software-architect levanta onde o painel e a API leem o mock e o que regera dado fictício e traz o plano; a base real não é tocada nesta etapa; prioridade urgente.
- DECISÃO DO DONO (2026-11-02): "A" (autorizar o P1 já): o P1 do plano 060-sem-mock (seed nunca grava na base real; coleta recusa esquema com seed) começa agora, num PR próprio para a develop, antes das perguntas Q1 a Q5.
- DECISÃO DO DONO (2026-11-02): "A" na Q1 (cartão sem dado real): o cartão aparece com o estado "Sem dado real" e o motivo, sem número; não some do painel.
- DECISÃO DO DONO (2026-11-02): "A" na Q2 (PV1): a pesquisa de percepção entra no mapa real agora e mostra "sem pesquisa" enquanto não houver carga.
- DECISÃO DO DONO (2026-11-02): "A" na Q3 (homologação): a homologação continua com o mock e o selo global; o mock nunca toca a base real.
- DECISÃO DO DONO (2026-11-02): "A, mas pode planejar o desenho para a próxima etapa" na Q4 (VISAO_GERAL): a Visão Geral fica "Sem dado real" agora; o desenho dela com dado real é planejado para a próxima etapa.
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do E3): ux-designer e software-architect planejam em paralelo o desenho da Visão Geral com dado real, BusinessMap e Acelerato lado a lado e nunca no mesmo cálculo, para o dono validar; nada é implementado agora.
- DECISÃO DO DONO (2026-11-02): "A, mas quando eu pedir para subir eu quero dados reais para demonstrar" na Q5 (modo demonstração): o modo mock local continua só por escolha explícita, para testes; quando o dono pedir para subir o sistema, ele sobe com dado real.
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 (alertas): corrigir já os 11 recomendados (#12, #14 e #15 do dompurify fecham com a release; #18 a #25 do fast-uri por override de patch); #13, #17 e #26 ficam para depois; #16 com risco aceito e registrado. A correção vira o pedido 062.
- DECISÃO DO DONO (2026-11-02): "A" (E3.3, validar o desenho da Visão Geral): desenho validado como está, dois blocos independentes por fonte, sem total nem alerta único; vira a especificação da próxima etapa.
- DECISÃO DO DONO (2026-11-02): "A" (P1 do UX da Visão Geral): cartões sem fonte real ficam visíveis, cada um com o motivo.
- DECISÃO DO DONO (2026-11-02): "A" (P2 do UX da Visão Geral): blocos lado a lado em tela larga e empilhados em tela estreita.
- DECISÃO DO DONO (2026-11-02): "A" (P3 do UX da Visão Geral): a exportação segue a separação em duas partes, BusinessMap e Acelerato, sem total geral.
- DECISÃO DO DONO (2026-11-02): "A" (QV1, BLOQUEADOS): a métrica de bloqueados entra no mapa real junto com P2 e P3, porque a carga real já lê os bloqueios.
- DECISÃO DO DONO (2026-11-02): "A" (QV2, corte da Visão Geral): cada bloco usa a data de corte da própria coleta, sem corte comum entre BusinessMap e Acelerato.
- O agente nunca abre nem lê o `.env`.
- O `.git/config.lock` do repositório principal está parado: crie a branch com `--no-track` e envie sem `-u`; recusa de hook ou do sandbox: pare e relate a mensagem literal.
- R-VERIFY: nunca `--no-verify` nem `--force`. Uma suíte de teste por vez na máquina: o `pronto` usa a trava da suíte única; se estiver ocupada, espere.
- O registro de pacotes pode precisar de `registry.npmjs.org` em `allowed_domains`.
- NÃO tocar: dompurify, lhci, zod, outras dependências, código, o `.env`, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (dependência)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin refs/heads/feature/062-fast-uri` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052h run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).