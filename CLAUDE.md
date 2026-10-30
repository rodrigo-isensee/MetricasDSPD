# MetricasDSPD

Sistema de métricas ágeis do DSPD: coleta dados do BusinessMap (fluxo de projeto) e do Acelerato (sustentação), mantém uma base analítica e publica painéis em três níveis (FL1 operacional, FL2 tático, FL3 estratégico) mais o de sustentação.

Projeto full-stack: back-end em Node.js (`server/`), front-end em React (`web/`) e testes E2E (`e2e/`).

## Fonte da verdade
- `docs/briefing-execucao-metricas.md`: **briefing de execução**. É a especificação: regras de cálculo, catálogo de métricas, frentes WS1 a WS6, tarefas e critérios de pronto. Leia só as seções que a tarefa exige (o pedido de delegação do Jarvis aponta quais); as regras invioláveis abaixo valem sempre e não dependem dessa leitura.
- `docs/proposta-metricas-ageis.md`: proposta original, com a justificativa de cada métrica. Use para entender o porquê; em caso de conflito, vale o briefing.
- `docs/referencia/`: os HTML originais dos dois documentos.

## Regras invioláveis (do briefing)
- **Nenhuma métrica pode servir para avaliação individual.** Não implementar ranking individual como visão principal, metas por pessoa nem comparação entre times. Se aparecer como requisito, recusar e sinalizar ao usuário.
- Métricas proibidas (seção 7.1): produtividade individual, velocidade em pontos como meta, comparação entre times, percentual de conclusão de tarefa, média de tempo de ciclo sem percentis, horas apontadas como esforço.
- **BusinessMap e Acelerato nunca se misturam** em nenhum cálculo, histograma, percentil ou previsão.
- Story, frente e projeto **nunca no mesmo histograma**.
- Tempo em horas/dias úteis; percentis 50/85/95 em janela móvel de 12 semanas; **abaixo de 20 itens, não publicar** estatística.
- Carga incremental: **nunca sobrescrever histórico**; cards arquivados e excluídos permanecem na base.
- Todo cálculo de tempo, percentil e Monte Carlo passa pela biblioteca compartilhada (T2.5); nenhuma métrica com cálculo próprio.
- Mudança de critério de cálculo é registrada com data e marcada nos gráficos (T2.6).
- Dúvida de regra de negócio **não se resolve por inferência**: vira pergunta ao usuário, nunca decisão no código.
- Ordem obrigatória: configuração (WS1, WS4) → coleta (WS2, WS5) → painéis (WS3).
- Credenciais (apikey do BusinessMap, usuário e senha do MySQL do Acelerato, usuários do PostgreSQL) só em `.env`, nunca no código. O Acelerato é lido somente da tabela MySQL mantida pelo time de ciência de dados (cópia do Acelerato), só com SELECT e com usuário de banco só leitor (nada é escrito no MySQL nem no Acelerato). Essa tabela traz dados de pessoa (nome, e-mail, ids de usuário) e texto livre (título, descrição, `raw`, campos livres): o coletor aplica uma lista fechada de colunas e campos (allow-list) na própria consulta e na fronteira, e nome, e-mail, `usuarioKey`, ids de agente e de solicitante, descrição e título do chamado nunca chegam ao staging nem a outra tabela. A API do projeto (papel `dspd_api`) não lê colunas de pessoa (GRANT por coluna).

## O que é código e o que não é
Frentes de implementação pelo time: WS2 (coletor e base analítica), WS3 (painéis do fluxo), WS5 (painéis de sustentação) e as automações externas da T4.3. As frentes WS1, WS4 e WS6 são configuração de ferramenta e governança feitas por pessoas; o time pode gerar apoio (relatórios, roteiros de teste, consultas), mas não as executa.

## Fábrica Forge
Este projeto é desenvolvido pela fábrica **Forge** (plugin `forge@forge`, https://github.com/rodrigo-isensee/Forge). O Jarvis (`forge:jarvis`, agente principal em `.claude/settings.json`) e o time (`forge:tech-lead`, `forge:software-architect`, `forge:ux-designer`, `forge:node-backend`, `forge:react-frontend`, `forge:qa-engineer`, `forge:agile-coach`), as skills e o processo geral vêm do Forge. Este arquivo guarda só o que é **deste sistema**: regras invioláveis, fluxo de branches e homologação, e as exceções locais abaixo.

**Fábrica × projeto:** mudanças em agentes, skills, fluxo e práticas gerais vão para o repositório Forge, nunca para este projeto. Não crie `.claude/agents/` nem `.claude/skills/` aqui: eles teriam prioridade sobre o Forge e divergiriam da fábrica.

**Exceções locais às regras da fábrica:**
- Teto de recursos: o do Forge (estação WSL com 8 GB e 8 núcleos) vale como está.
- Orçamento de performance: ADR 0003.
- Branches: `feature/*` → `develop` → `homolog` → `main` (abaixo), em vez do fluxo padrão da fábrica.
- Comando de pronto: `pnpm run pronto`.

## Fluxo de uma demanda
**Upstream (discovery)** — `ux-designer` e `software-architect` juntos: o UX conduz Design Thinking (empatizar → definir → idear → prototipar) e o arquiteto avalia em paralelo viabilidade, dados, integrações e riscos → **validação do usuário no protótipo** (ponto de compromisso).

**Trabalho em paralelo por padrão:** o discovery corre à frente da entrega (UX e arquiteto adiantam as próximas fases enquanto os desenvolvedores constroem a atual), e na entrega tudo o que não depende entre si roda ao mesmo tempo. Limite: 1 cartão em andamento por agente.

**Downstream (entrega)**
1. `software-architect` + `tech-lead`: plano técnico, modelagem, ADRs e práticas.
2. `tech-lead` cria a branch; `node-backend` e `react-frontend` implementam; `qa-engineer` prepara os testes em paralelo.
3. `tech-lead` faz code review de toda entrega.
4. `qa-engineer` testa — **todo desenvolvimento passa pelo QA**, sem exceção. Nenhuma branch é enviada sem o parecer do QA em `docs/qa/`; "enviada" quer dizer o pull request para a `develop`, que só abre com esse parecer. O push da feature branch para o remoto é liberado antes dele (decisão do usuário de 2026-10-27, vale para todas as branches).
5. `ux-designer` revisa a interface implementada.
6. `tech-lead` envia a branch e prepara o pull request para a `develop` (squash); mesclado por ele depois de review e QA.
7. **Homologação** (`docs/engineering/fluxo-homologacao.md`): o `tech-lead` promove `develop` → `homolog` por PR (merge commit); o push em `homolog` dispara o portão da CI (suíte completa, migração a partir da main, smoke) e uma rodada noturna agendada na CI. Documentação passa por `homolog` rodando só `docs:check`. O ambiente local de homologação sobe sob demanda (`pnpm run homolog:subir`).
8. **O usuário valida e faz o merge na `main`** do PR de release `homolog` → `main` (merge commit), liberado pelo check `homolog-aprovada` (candidato = ponta de `homolog`, portão verde; a rodada noturna é informativa por enquanto e será religada quando o usuário decidir). Release sob demanda; validação manual só quando a release muda a interface.

Correções e tarefas técnicas sem impacto de interface pulam o upstream, mas nunca o code review e o QA.

## A main é do usuário
Nenhum agente faz commit, merge ou push na `main`. Toda mudança chega lá por pull request validado e mesclado pelo usuário: o PR de release `homolog` → `main`, e só ele (hotfix sai da `main` com aprovação do usuário e volta a `homolog` e `develop` por PR). O fluxo é `feature/*` → `develop` → `homolog` → `main`; nada pula degrau e ninguém commita direto em `homolog` ou `main`. O `tech-lead` mescla em `develop` e em `homolog`; o usuário, na `main`. O hook `.githooks/pre-push` bloqueia envios para a `main`; `develop` e `homolog` são protegidas no GitHub.

## Quadro de atividades
Todas as atividades do time ficam visíveis no `KANBAN.md` (raiz), atualizado pelo Jarvis a cada mudança de estado. O `agile-coach` cuida das políticas do quadro, das métricas de fluxo e das retrospectivas.
