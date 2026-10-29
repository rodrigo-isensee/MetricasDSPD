Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E5.1 do pedido 048 (E4; cartão K-074): re-review (R-REVIEW) da branch `feature/048-usabilidade` depois das voltas do QA, intervalo c984b0f5dc621751d488456d6dda19f4ee0d06e7..1451778df5d9da9ed380bd0684a0b19960f99006 (o review aprovado anterior cobriu até c984b0f5dc621751d488456d6dda19f4ee0d06e7): specs E2E do QA e os 5 specs antigos ajustados por ele (f82b656), as correções dos bugs 048-01 e 048-02 e do A4 do QA (ba9c002), a decisão 048-03 = A (d1df428) e o teste do `scroll-padding-top` (1451778). Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, head 1451778df5d9da9ed380bd0684a0b19960f99006, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-048b diff c984b0f5dc621751d488456d6dda19f4ee0d06e7 1451778df5d9da9ed380bd0684a0b19960f99006` (21 arquivos).
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/048-usabilidade.md`, seção `## Achados`, e os três `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/bugs/048-0*.md` (048-01 a 048-03).
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md`, critérios CA-A a CA-E.
- O parecer atual `/home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md` (é o que você atualiza).

## Entregar
- (E5.1, E4) Code review do intervalo c984b0f5dc621751d488456d6dda19f4ee0d06e7..1451778df5d9da9ed380bd0684a0b19960f99006: os bugs 048-01 (índice cobre o título) e 048-02 (largura reservada do aviso do "Copiar link") corrigidos com teste; o A4 do QA (`rootMargin` do índice); a decisão 048-03 = A cumprida (barra de filtros sem sticky a partir de 768 px, fixos só cabeçalho e índice) contra CA-A a CA-E; o `web/src/styles/tokens.test.ts` falha sem a mudança do `tokens.css`; os specs E2E do QA e os 5 specs antigos ajustados por ele (preferencias, shell, complementares, intensivo-sistemico, sustentacao-no-operacional) testam o comportamento novo sem afrouxar asserção; o assert "a barra sticky" e a anotação `fVar` de `e2e/tests/responsivo.spec.ts` que ficaram obsoletos pela 048-03 viram achado para o reteste do QA (não corrija); nenhum dado de pessoa nem métrica individual.
- (E5.1) Atualizar o parecer `/home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md` pela ferramenta Write ou Edit: `commit: 1451778df5d9da9ed380bd0684a0b19960f99006`, `data:` de hoje, veredito e o bloco `## Achados` no formato que o `forge-check pr` lê, cada achado com arquivo:linha e até 300 caracteres; os achados do review anterior ficam com o estado (RESOLVIDO ou aberto).
- (E5.1) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-074` e `git add docs/reviews/048-usabilidade.md`; o commit com heredoc vai sozinho na chamada; antes do push, `git branch --show-current` deve dar `feature/048-usabilidade`; push com `git push origin HEAD:refs/heads/feature/048-usabilidade`, sem `--force` e sem PR.
- (E1, E2, E3, E6) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a4)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f60)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (9b97e9d)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; já entregue em parte (O23 em d9979ee, review em 45991e4, K-093 sem código); o K-129 continua no pedido, em PERGUNTA ao dono
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E3.4 (forge:react-frontend): na `feature/048-ajustes-front`, o `web/scripts/size.mjs` mede o F9 como o E3.3 decidir (K-127), na mesma delegação do E3.2, depois do E3.5." · etapa de outra delegação; continua no pedido
- "E3.5 (forge:tech-lead): commit e push do E3.3 na `feature/048-ajustes-front` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981)
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.5 (forge:tech-lead): worktrees e branches do E3 a partir da develop depois do PR #161: `/home/rodrigoisensee/MetricasDSPD-048c` com `feature/048-ajustes-back` (E3.1) e `/home/rodrigoisensee/MetricasDSPD-048d` com `feature/048-ajustes-front` (E3.2 e E3.3), com push das duas e `pnpm install --frozen-lockfile` em cada uma, sem testes (sem as dependências os desenvolvedores não rodam testes nem typecheck)." · etapa de outra delegação; já entregue (7c94348, worktree 048c)
- "E6.0 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-048e` com `feature/048-dompurify` a partir da develop 7c94348, com `pnpm install --frozen-lockfile` (feito em 2026-10-29 08:03, sem commit)." · etapa de outra delegação; já entregue (worktree 048e, sem commit)
- "E6.1 (forge:tech-lead; executor em PERGUNTA ao dono de 2026-10-29 08:07): na worktree `/home/rodrigoisensee/MetricasDSPD-048e`, branch `feature/048-dompurify`, subir o dompurify para a 3.4.17 (E6) no lockfile (versão mínima que corrige o alerta #12), com `pronto` uma vez, commit e push, sem PR." · etapa de outra delegação; continua no pedido
- "E6.2 (forge:security-engineer): avaliação do impacto do alerta #12 no projeto (onde o dompurify entra, direto ou transitivo; se o código usa `SAFE_FOR_TEMPLATES`) e review de segurança do E6.1 (E6), num parecer só, `docs/security/048-dompurify.md`; depois code review e QA pelo E5.1 e pelo E5.2, e PR." · etapa de outra delegação; continua no pedido
- O PR e o merge (E5.1, depois do reteste do QA, em outra delegação); corrigir código, testes ou specs (achado vira linha no parecer); rodar a suíte, o `pronto` ou testes; o quadro e o arquivo do pedido; outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Mude a seguencia, coloque a integração com dados reais por último": a integração com dados reais (BusinessMap e Acelerato, K-087, K-086, K-088, K-089) entra depois de todo o resto da lista do que falta, feito em mock.
- DECISÃO DO DONO (2026-10-28): recibo do 048 aceito ("Isso tudo entra menos os dados reais"): E1 a E4 entram (inclusive K-074 e K-075, com UX e protótipo); integração real fica fora, por último.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-1 = B** (usuário): a fonte é o campo customizado do card, nome provisório "Time responsável"; nome exato e cardinalidade (único ou múltiplo) ficam para confirmar na integração com o BusinessMap. Até lá vale a Q-T14-9 = A (se múltiplo, conta quando o meu time estiver entre os marcados), que funciona nos dois casos.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-5 = D** (usuário): na T14 aparecem os projetos ligados a um sistema do meu time (`ConfigBM.equipes[].sistemas`, inclusive com 0% de atuação) e também qualquer projeto com pelo menos 1 card do meu time.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-6 = A** (usuário): "outros times" é publicado mesmo quando o projeto tem um único outro time, sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO DO DONO (2026-10-17, pedido 011): **Q-T14-10 = B, confirmada** ("2-2", depois "2 e o B"): na regra "menos de 2 pessoas" da T14, conta como pessoa quem está num cadastro de membros por time, mantido na configuração (WS1). O cadastro é dado de pessoa: há gatilho de segurança, e ele fica fora do alcance do `dspd_api`.
- DECISÃO DO DONO (2026-10-17, pedido 011): **T14-M1 = B** (usuário, resposta "D1 - B"): quando "outros times" estiver oculto (R-1 = B), a T14 mostra só a fatia do meu time, sem o total exato do projeto. Assim não dá para calcular n − k.
- DECISÃO DO DONO (2026-10-28): Q-T14-12, opção B ("B"): na T14, os projetos com "outros times" oculto vêm depois dos visíveis, ordenados por código do projeto (fecha a dedução do total pela ordem, K-130).
- DECISÃO DO DONO (2026-10-29): bug 048-03, opção A ("A"): a barra de filtros deixa de ser fixa no topo a partir de 768 px e rola com o conteúdo; ficam fixos só o cabeçalho e o índice "Ir para" (muda a especificação de filtros, "Fixa (sticky) a partir de 768 px"; P2 mantida). Critérios CA-A a CA-E em docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md (worktree 048b).
- DECISÃO DO DONO (2026-10-29): K-178, opção A ("A"): corrigir já o alerta crítico do Dependabot #12 (dompurify, subir para a 3.4.17), depois do `forge atualizar`: security-engineer avalia o impacto, tech-lead sobe a versão numa branch própria, com review, segurança e QA, PR para a develop.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): não é objeto desta etapa (nenhum dado de pessoa).
- ADR 0021 (citada no pedido): não é objeto deste review.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): CLS F2 e F2m menores que 0,1; a medição é do reteste do QA.
- CLAUDE.md, regras invioláveis: todo cálculo de tempo e percentil passa pela biblioteca compartilhada; abaixo de 20 itens, não publicar estatística; BusinessMap e Acelerato nunca se misturam; dúvida de regra de negócio vira pergunta ao dono, nunca decisão no código.
- DECISÃO TÉCNICA do Jarvis (2026-10-29 08:16, Histórico do pedido): a troca em `web/src/features/preferencias/cobertura.test.tsx` fica; `--h-filtros` fica fora do `tokens.css`; o assert sticky e o `fVar` do `e2e/tests/responsivo.spec.ts` são reescritos no reteste do QA.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 1451778df5d9da9ed380bd0684a0b19960f99006' /home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md` · espera: igual '1'
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 1451778df5d9da9ed380bd0684a0b19960f99006 HEAD` · espera: igual 'docs/reviews/048-usabilidade.md'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito, cada bug (048-01 a 048-03) e o A4 com o estado, achados novos por severidade (arquivo:linha) e o sha do commit do parecer; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
