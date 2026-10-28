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
- 2026-10-28 11:32: brief tech-lead-1 (E1.2) aprovado pelo conferente na rodada 1 (sha256 c6a77ebe114f459bd48af4710c9269bb9f2aeeb96a686acc370b48f4530f5c22) e delegado ao forge:tech-lead (instância própria, worktree MetricasDSPD-045).
- 2026-10-28 11:32: brief security-engineer-1 (E1.3) aprovado pelo conferente na rodada 1 (sha256 e3c28ebdd3dd611fcf5b2bda28616786b65674345cd98097a0925a9c40c079f9) e delegado ao forge:security-engineer. Aviso informativo do conferente: o teste do script não é suíte (não usa banco nem navegador).
- 2026-10-28 11:34: E1.2 entregue pelo tech-lead: aprovado, sem bloqueante (docs/reviews/045-suite-unica.md na worktree -045, sem commit). O Jarvis conferiu PQ-1 (o arquivo existe) e PQ-2 (1 seção Achados). Recomendados: A1 (scripts/suite-unica.sh:29, o fd 9 é herdado por processos filhos, e um órfão do e2e pode segurar a trava; vai para o QA conferir o `fuser` depois do `test:e2e`) e A2 (espera sem teto; aceito pela regra do dono). MELHORIA vista: o brief não diz onde está o modelo de parecer (`find /` estourou o tempo).
- 2026-10-28 11:35: E1.3 entregue pelo security-engineer: aprovado, sem bloqueante (docs/security/045-suite-unica.md na worktree -045, sem commit). O Jarvis conferiu PQ-1 e PQ-2. Recomendados: A1 (nome fixo em /tmp; sem ator na estação de um usuário), A2 (retorno do `flock` de espera não checado: falha aberta), A3 (a variável de não aninhar, se exportada, desliga a trava; filho órfão segura o fd). A4 informativo. O parecer diz que nenhum deles devolve a entrega. Decisão técnica do Jarvis (`técnico`, base: parecer "não devolvem a entrega"): segue para o QA (E1.4); A1 a A3 viram o cartão K-171 (endurecer a trava), e o QA confere o sintoma de A3 e do A1 do review (`fuser` vazio depois do `test:e2e`).
- 2026-10-28 11:37: aviso do forge-check: o QA exige parecer de review registrado na branch. Os dois pareceres estão sem commit, então o QA não pode começar. Brief tech-lead-2 (E1.2, fechamento: commit e push dos pareceres de review e de segurança, sem `pronto`, porque não é o commit final) passou no forge-check. O envio ao conferente foi barrado pelo R-TETO (load 18.6 de 16, por causa do `pronto` do 026 rodando); o Jarvis espera a carga baixar.
- 2026-10-28 11:41: DECISÃO TÉCNICA do Jarvis (`técnico`; base: aviso do forge-check de 11:37, "o QA exige parecer de review registrado na branch", R-REVIEW antes do R-QA). Substitui a decisão técnica de 11:31: os pareceres de review e de segurança são commitados e enviados no fechamento do E1.2, antes do QA, sem `pronto`, porque não é o commit final. O `pronto` completo roda no QA (E1.4) e antes do commit final do E1.5. O brief tech-lead-2 tinha sido reprovado pelo conferente na rodada 1 por trocar a decisão de 11:31 sem este registro.
- 2026-10-28 11:44: brief tech-lead-2 (fechamento do E1.2: commit e push dos pareceres) aprovado pelo conferente na rodada 2 (sha256 108e92d47c178e40b8030b13f8102d0b969926f6d689f26c26339c5e7a079ffd) e delegado.
- 2026-10-28 11:47: E1.2 fechado em 8cdb5abf85737f04047350e964e389b64b3fdeab (só os dois pareceres; PQ-1 a PQ-4 cumpridos). O conferente deu "não cumpriu" só pelo escopo da branch inteira, porque o E1.1 não tem linha conferida. DECISÃO TÉCNICA do Jarvis (`técnico`; família K-147): entrega aceita.
- 2026-10-28 11:47: brief qa-engineer-1 (E1.4) aprovado pelo conferente na rodada 1 (sha256 5825561534eeee2c9d7dffb94450425dc88b7b6b46a3188274b94bcdd13df0cf) e delegado. Avisos do forge-check sobre a forma do parecer de review: A1 com mais de 300 caracteres, a linha "Nenhum bloqueante." fora do formato e a falta do registro de autoria. Ficam para o tech-lead corrigir no E1.5, antes do PR. Aviso informativo: o brief não cita o sintoma do A3 da segurança; o QA o registra se o observar.
- 2026-10-28 12:33: QA (E1.4, qa-1) aprovado sem bloqueante; parecer sem commit em docs/qa/045-suite-unica.md (commit no E1.5); PQ-1 a PQ-3 conferidos pelo Jarvis; aceito por decisão técnica (K-147, sem commit a conferir). Achados recomendados: A1 órfão segura a trava (cartão só se passar de minutos), A2 espera sem teto (retro E1.6), A3 pronto não roda e2e (tech-lead, fora do 045). MELHORIA vista do QA: brief dizia que o pronto roda test:e2e (falso); pkill de órfão negado pelo classificador.
- 2026-10-28 12:38: brief tech-lead-3 (E1.5) reprovado pelo conferente na rodada 1: o parecer de segurança commitado não tem registro de autoria do papel seguranca (o registro de 11:35 é de outra versão do texto) e o cabeçalho dizia qa com PR e merge. Brief security-engineer-2 (regravar o parecer idêntico, para registrar a autoria) aprovado na rodada 1 (sha 48633912ff6039d2fce0b2d804ed3e101c199b70458cc218a5e5c8447846b69e) e delegado; o tech-lead-3 volta corrigido depois.
- 2026-10-28 12:39: security-engineer-2 entregue: parecer regravado idêntico, autoria registrada (PQ-1 e PQ-2 conferidos pelo Jarvis, sem commit a conferir). tech-lead-3 corrigido: cabeçalho Etapa merge-integracao e E1.3 com a autoria; volta ao conferente na rodada 2.
- 2026-10-28 12:42: brief tech-lead-3 (E1.5) aprovado pelo conferente na rodada 2 (sha 17dd9f93d946f04cc93a8258153b9fb44ce5a89b5a2976f59fffa841c21c884b) e delegado. O registro da leitura no CLAUDE.md é o E3.1 do pedido 026 (espera o K-162), fora deste brief.
- 2026-10-28 13:36: E1.5 PR #156 mesclado na develop por squash (7873c1876257b311484f1058752aaf6100d33811), checks verdes, pronto rc=0 antes do primeiro commit; segundo commit 3e86f79 só de autoria do review. MELHORIA: ajuste de parecer por script não registra autoria; vai por Edit.
- 2026-10-28 17:55: brief agile-coach-1 (E1.6, retrospectiva) aprovado pelo conferente na rodada 1 (sha256 bf386f198f2263b5d34558aa3b84ca182e9529460105601abdf7593674d705e9) e delegado ao forge:agile-coach.
- 2026-10-28 17:59: E1.6 entregue pelo agile-coach (bda18097fbad5fcfd7cc496df025c84d28454549, retrospectiva com 3 MELHORIAs; usou um sed para tirar nomes de instância, desvio do "só Write ou Edit"). Conferência da entrega em curso. MELHORIA 1 virou o K-175 (endurecer a trava: A1 a A3 da segurança e A1 do review, que o registro de 11:35 apontou por engano para o K-171, que é outro cartão) e MELHORIA 2 o K-176 (registro das esperas, na Entrada: depende do K-175); MELHORIA 3 (onde está o modelo de parecer no brief e afirmação falsa sobre scripts) vai à lista do Forge do pedido 046.
- 2026-10-28 18:01: conferência da entrega bda1809 (retro do 045): PQ-1 a PQ-4 cumpriram; o commit traz só a retrospectiva. Não cumpriu por forma: a linha 58 cita "tl-3" (abreviação do brief tech-lead-3), e o intervalo sem Desde não isola o commit. DECISÃO TÉCNICA do Jarvis (`técnico`): aceito pelo mérito, sem linha conferida. "tl-3" nomeia um arquivo de brief, não avalia instância de agente, e a regra de nomes de instância existe para não medir agente; o sed usado pelo agente fica registrado como desvio. 045 fechado: E1.1 a E1.6 entregues; MELHORIAs no K-175, no K-176 e na lista do Forge (046).
