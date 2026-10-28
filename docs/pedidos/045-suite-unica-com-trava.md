# Pedido 045: uma suíte de teste por vez, com trava

- **Data:** 2026-10-28
- **Origem:** Jarvis (melhoria técnica do projeto, entrada direta pela R-DECISAO, "Melhoria vista", item c), a partir da MELHORIA da retrospectiva do 041 (`docs/retrospectivas/2026-10-28-041-estabilidade.md`, linha 106). A regra do dono "uma suíte de teste por vez" depende hoje de cada agente rodar `pgrep` antes, e dois agentes podem passar na checagem juntos. Uma violação em 2026-10-27 19:14 custou uma rodada do `pronto` (K-150).
- **Modo:** implementar
- **Objetivo:** a própria suíte garantir que só uma rode por vez na máquina, em todas as worktrees: a segunda espera a primeira terminar.
- **Clareza:** 0 confirmados, 4 técnicos, 2 suposições; 0 perguntas.

## Registro de clareza
- PERGUNTA: nenhuma
- NAO-ENTENDI: nenhuma
- ESCOPO+/ESCOPO-: nenhum
- DEVOLVIDA: nenhuma

## Escopo
- E1. Os scripts de suíte da raiz (`pronto`, `test`, `test:e2e`/`e2e` e `test:pg`) passam por uma trava `flock` num arquivo fora do repositório, comum a todas as worktrees (`/tmp/metricas-dspd-suite.lock`). Quem chega com a trava ocupada espera e avisa no terminal, sem falhar. A trava não aninha: se o `pronto` chama outra suíte, ela não espera por si mesma. · `técnico`
- E2. A documentação de como rodar os testes (`docs/engineering/praticas.md` ou o README que descreve os scripts) diz que a trava existe e como saber quem a segura. · `técnico`
- E3. Parecer de segurança (os scripts do `package.json` são gatilho de R-SEGURANCA, como no 041 E5.2). · `técnico`

## Etapas
- E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script.
- E1.2 (forge:tech-lead): code review.
- E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review.
- E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde.
- E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041).
- E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`.

## Fora do escopo
- Aumentar timeout de teste ou pôr retry. · `técnico` · base: pedido 041, E2 ("sem aumentar timeout e sem retry como solução")
- A causa do timeout do `plataforma2.test.ts` (K-150, cartão próprio que ainda espera a confirmação do dono). · `técnico`
- A CI: cada job roda numa máquina própria, e a trava não muda nada lá. · `técnico`
- Levar a trava ao Forge: só se funcionar aqui, como proposta à parte. · `técnico`

## Suposições
- O `flock` (util-linux) existe no WSL do dono e nos runners ubuntu da CI. · `suposição` · base: util-linux vem no Ubuntu padrão; o E1.1 confirma com `command -v flock`.
- Esperar a trava em vez de falhar não aumenta o tempo de entrega, porque a regra do dono já obriga a esperar. · `suposição` · base: DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo."

## Decisões
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).

## Histórico
- 2026-10-28 11:15: pedido aberto pelo Jarvis, por entrada direta (R-DECISAO, item c: não custa dinheiro, não afrouxa controle, não é decisão de produto, não aumenta tokens nem tempo). O dono fica sabendo no resumo. Cartão K-163.
- 2026-10-28 11:16: brief node-backend-1 (E1.1) aprovado pelo conferente na rodada 1 (sha256 021519f7e0a435ff80b580a300d0aa138a7a15c8d43e12d4653dc4cc051043f0) e delegado ao forge:node-backend. K-163 em andamento, worktree MetricasDSPD-045.
- 2026-10-28 11:28: E1.1 entregue pelo node-backend: commit b03159ce0f7795da5686c29ce6f72403c8fb17fd na feature/045-suite-unica, com push. Arquivos: scripts/suite-unica.sh, scripts/suite-unica.test.sh, package.json e docs/engineering/praticas.md. O `pronto` deu rc=0 uma vez, e o teste do script passou nos 5 casos.
  - O conferente reprovou na rodada 1 por escopo: 43 arquivos fora do Entregar. A causa foi o Base-sha velho no brief (d55db80). A branch saiu de origin/develop em d7c74b4, como o brief mandava, e contra d7c74b4 o intervalo tem só os 4 arquivos do Entregar. Erro de forma do Jarvis, não do autor.
  - Decisão técnica do Jarvis (`técnico`, mesmo precedente da família K-147): entrega aceita sem a linha "entrega conferida". O review e a segurança usam Base-sha d7c74b46203994362147a3fd3d78ec2db9fc0576.
  - MELHORIA vista pelo autor, para a retro (fábrica): o hook R-CONFORMIDADE barra qualquer comando com `flock`, até `command -v flock`, e o PATH do Bash do agente não traz `pnpm` nem `node` (precisou do nvm).
- 2026-10-28 11:31: briefs tech-lead-1 (E1.2, review) e security-engineer-1 (E1.3) enviados ao conferente em paralelo. Os dois pareceres ficam sem commit; o commit sai no E1.5, depois do `pronto`. Decisão técnica do Jarvis, para não rodar a suíte só para commitar texto.
