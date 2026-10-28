Agente destino: forge:ux-designer
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Parte do E4.3 do pedido 048 (cartão K-074): parecer de UX sobre o bug 048-03 do QA (`docs/qa/048-usabilidade.md`, commit f82b6566a8b3f006c2617e5d19e8235ffb7b783a), o axe `target-size` sério na Sustentação a 1280 px. A volta 1 do react-frontend (ba9c002343fde638888ef55d79856c2f3cdcb0c6) concluiu que a causa não é o índice de seções, e sim a pilha fixa no topo (cabeçalho de 49 px mais a barra de filtros, que quebra em 3 linhas e ocupa 136 px a 1280 px, mais o índice), que cobre alvos conforme a posição da rolagem. Há duas saídas: rolagem determinística no teste do QA (a interface fica como está) ou mudar a interface (reduzir a barra ou deixá-la sair do topo fixo). O time precisa da sua recomendação de UX para decidir. Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, head ba9c002343fde638888ef55d79856c2f3cdcb0c6.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/048-usabilidade.md`, só o achado A3 do bloco `## Achados`.
- `/home/rodrigoisensee/MetricasDSPD-048b/web/src/features/operacional/IndiceDeSecoes.tsx` e `/home/rodrigoisensee/MetricasDSPD-048b/web/src/features/filtros/BarraFiltros.tsx`, só para entender o que fica fixo no topo.
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/04-decisoes.md`, só as decisões que tratam da barra de filtros e do índice (U1 a U5).

## Entregar
- (E4.3, E4) Parecer gravado pela ferramenta Write em `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md`, com frontmatter (pedido, cartão K-074, branch, head ba9c002343fde638888ef55d79856c2f3cdcb0c6, revisor, data) e: (1) se o `target-size` a 1280 px é um problema real para quem usa o painel (WCAG 2.2, critério 2.5.8) ou só um efeito da posição da rolagem no teste; (2) a sua recomendação entre as duas saídas, com a base; (3) se recomendar mudança de interface, a mudança exata (o que deixa de ser fixo ou como a barra se reduz), por que ela respeita U1 a U5 e o protótipo `03-prototipo`, e o critério de aceite para o react-frontend; (4) se a recomendação pedir regra de negócio ou mudar uma decisão do dono de `04-decisoes.md`, diga isso em linha própria começando por `PERGUNTA AO DONO:`, sem decidir.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (seção de aprovação em docs/architecture/features/048-t14-mock.md, worktree 048a)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; volta 1 da correção do QA entregue (ba9c002343fde638888ef55d79856c2f3cdcb0c6); a volta seguinte, se houver, continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; a revisão completa da interface do E4.1 continua no pedido, depois do reteste do QA
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; review aprovado (c984b0f5dc621751d488456d6dda19f4ee0d06e7); o re-review desta volta, o PR e o merge continuam no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; parecer reprovado (f82b6566a8b3f006c2617e5d19e8235ffb7b783a); o reteste continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; não se aplica a esta branch (sem gatilho de segurança, Histórico do pedido)
- A revisão completa da interface do E4.1 e as do E1.4, E3.2 e E4.2 (outras delegações do E4.3); commit e push do parecer (vai na próxima entrega de código ou de QA desta branch); mudar código, testes, o protótipo, `04-decisoes.md` ou outros pareceres; o quadro e o arquivo do pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Mude a seguencia, coloque a integração com dados reais por último": a integração com dados reais (BusinessMap e Acelerato, K-087, K-086, K-088, K-089) entra depois de todo o resto da lista do que falta, feito em mock.
- DECISÃO DO DONO (2026-10-28): recibo do 048 aceito ("Isso tudo entra menos os dados reais"): E1 a E4 entram (inclusive K-074 e K-075, com UX e protótipo); integração real fica fora, por último.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-1 = B** (usuário): a fonte é o campo customizado do card, nome provisório "Time responsável"; nome exato e cardinalidade (único ou múltiplo) ficam para confirmar na integração com o BusinessMap. Até lá vale a Q-T14-9 = A (se múltiplo, conta quando o meu time estiver entre os marcados), que funciona nos dois casos.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-5 = D** (usuário): na T14 aparecem os projetos ligados a um sistema do meu time (`ConfigBM.equipes[].sistemas`, inclusive com 0% de atuação) e também qualquer projeto com pelo menos 1 card do meu time.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-6 = A** (usuário): "outros times" é publicado mesmo quando o projeto tem um único outro time, sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO DO DONO (2026-10-17, pedido 011): **Q-T14-10 = B, confirmada** ("2-2", depois "2 e o B"): na regra "menos de 2 pessoas" da T14, conta como pessoa quem está num cadastro de membros por time, mantido na configuração (WS1). O cadastro é dado de pessoa: há gatilho de segurança, e ele fica fora do alcance do `dspd_api`.
- DECISÃO DO DONO (2026-10-17, pedido 011): **T14-M1 = B** (usuário, resposta "D1 - B"): quando "outros times" estiver oculto (R-1 = B), a T14 mostra só a fatia do meu time, sem o total exato do projeto. Assim não dá para calcular n − k.
- DECISÃO DO DONO (2026-10-28): Q-T14-12, opção B ("B"): na T14, os projetos com "outros times" oculto vêm depois dos visíveis, ordenados por código do projeto (fecha a dedução do total pela ordem, K-130).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): proteção de pessoa; não é objeto deste parecer.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto deste parecer.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): linha F2, "CLS | < 0,1"; a mudança recomendada na barra fixa não pode reabrir o risco de CLS.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 18:48, Histórico do pedido): a correção do QA (bugs 048-01, 048-02 e 048-03) volta ao react-frontend (volta 1 de no máximo 3 por bug, R-QA).
- O parecer sai por leitura do código e dos pareceres, sem subir a interface (o QA usa a máquina; trava de suíte única).
- NÃO tocar: o código, os testes, o protótipo, `04-decisoes.md`, os outros pareceres, a `main`, o `.env`, as outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md`
- PQ-2 (cmd): `grep -c '^head: ba9c002343fde638888ef55d79856c2f3cdcb0c6' /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real: a recomendação (teste ou interface), a mudança exata e o critério de aceite se for de interface, e as perguntas ao dono, se houver; depois o bloco `Provas:`, uma linha por `PQ-n` (sem Bash, cite a linha do arquivo e o Jarvis roda o comando). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
