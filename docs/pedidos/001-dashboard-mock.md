# Pedido 001 — Dashboard de métricas com dados mockados

Solicitante: Rodrigo Isensee · Data: 2026-10-09

## Objetivo
Construir o sistema de dashboards de métricas do DSPD **com dados fictícios (mock)**, para validar a experiência com as áreas antes de existir coleta real. Prioridade máxima: **a melhor usabilidade possível**, desenhada pelo `ux-designer`, com **front-end moderno** feito pelo `react-frontend`.

A especificação das métricas é o `docs/briefing-execucao-metricas.md` (seções 01, 02, 04, 06 e 07). A justificativa de cada métrica está em `docs/proposta-metricas-ageis.md`. As regras invioláveis estão no `CLAUDE.md` e valem também para o mock.

## Escopo
Somente front-end, em `web/`. Não há back-end nesta etapa.

### Painéis
1. **Visão geral** — entrada do sistema: um resumo por nível com os poucos números que pedem atenção agora e o caminho para cada painel.
2. **Operacional (FL1)** — núcleo: O1, O2, O3, O4, O7, O9, O10, O12, O15, O18.
3. **Tático (FL2)** — núcleo: T1, T2, T3, T4, T5, T7, T9.
4. **Estratégico (FL3)** — núcleo: E1, E2, E3.
5. **Sustentação (Acelerato)** — núcleo: S1 a S7.
6. **Espera invisível (EI)** — presente em cada nível, com visão do cliente e visão do time sempre lado a lado.

As métricas fora do núcleo ficam fora desta etapa.

### Filtros
Equipe, tipo de demanda, sistema e período, conforme o briefing. Sustentação filtra por equipe (SSSC TOTVS, SSSC SENIOR, SSSC FLUIG), prioridade e período. Filtros refletidos na URL, para poder compartilhar o link de uma visão.

### Dados mockados
- Gerador determinístico (semente fixa) que produza dados **no formato do modelo analítico** da seção 4.5: `dim_card`, `fato_transicao`, `fato_bloqueio`; e, para a sustentação, chamados com prioridade P1–P5, etapas da seção 3.4, campos de motivo e status de SLA.
- Volume e distribuição realistas: hierarquia projeto → frente → story com vínculos, várias equipes e sistemas (Protheus, Fluig, Senior, marketing, 5G...), 12+ meses de histórico, caudas longas no tempo de ciclo, bloqueios, bugs por fase de detecção, algumas classes com menos de 20 itens (para exercitar a regra de amostra mínima).
- As métricas são **calculadas a partir desses dados** por uma biblioteca de cálculo única (horas úteis, percentis 50/85/95 em janela móvel de 12 semanas, mínimo de 20 itens), com testes unitários — nada de números fixos no componente. Assim, a troca do mock por API real no futuro não muda os painéis.

### Regras que o mock também precisa respeitar
- Nenhuma visão individual, ranking de pessoas ou comparação entre times.
- BusinessMap e Acelerato nunca no mesmo cálculo ou gráfico; story, frente e projeto nunca no mesmo histograma.
- Percentis sempre com a mediana ao lado; média nunca sozinha.
- Abaixo de 20 itens: não exibir a estatística, mostrar "amostra insuficiente" com a base declarada.
- Toda métrica mostra a base amostral e tem uma nota metodológica acessível (o que é, como se calcula, como ler, meta).
- Aviso permanente e discreto de que os dados são fictícios.

## Usabilidade esperada (direção para o UX, não especificação final)
- Público: gerente, coordenadores e times — pessoas não técnicas em métricas de fluxo. Cada gráfico precisa responder uma pergunta clara (as perguntas dos rituais da seção T6.1 são um bom ponto de partida).
- Hierarquia: primeiro o que pede ação, depois o detalhe.
- Leitura por cadência: o operacional abre na visão diária (O2, bloqueios, O1) com acesso à semanal.
- Acessível (WCAG 2.2 AA), tema claro e escuro, responsivo, navegação por teclado.

## Fluxo do time
1. `ux-designer`: especificação completa em `docs/ux/dashboard-metricas.md` (arquitetura de informação, navegação, layout de cada painel, tipo de gráfico de cada métrica e o porquê, estados, microcopy, critérios de aceite).
2. `software-architect` (enxuto, em paralelo): ADR com a stack do front (biblioteca de gráficos, roteamento, estado de filtros na URL), estrutura do gerador de mock e da biblioteca de cálculo.
3. `react-frontend`: implementação seguindo a especificação e o ADR, com testes.
4. `qa-engineer`: E2E com Playwright dos fluxos principais e verificação de acessibilidade com axe.
5. `ux-designer`: revisão da interface pronta; ajustes voltam ao `react-frontend`.

## Critério de pronto
- `npm install && npm run dev` em `web/` abre o sistema funcionando.
- Lint, type-check, testes unitários e E2E passando — reportar o resultado real.
- Todos os painéis e métricas do núcleo implementados com filtros, estados e notas metodológicas.
- Revisão de UX sem problemas críticos ou altos em aberto.
- `README.md` na raiz explicando como rodar.

## Git
Trabalhar na branch `feature/dashboard-mock`, com commits por etapa. Ao final, enviar a branch ao `origin`. Não existe `gh` instalado: em vez de abrir o pull request, informar o link de comparação do GitHub para o usuário abrir.

## Ambiente
WSL Ubuntu 24.04, Node LTS via nvm. Perguntar ao usuário só o que bloquear o trabalho; o resto, decidir, registrar em ADR ou na especificação, e seguir.
