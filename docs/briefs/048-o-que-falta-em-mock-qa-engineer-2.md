Agente destino: forge:qa-engineer
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: qa

## Objetivo
Etapa E5.2 do pedido 048 (cartão K-074): parecer de QA da `feature/048-usabilidade` (usabilidade U1 a U5, catálogo na Ajuda, P2 da barra única, correções A1 a A4 do review), depois do code review aprovado (c984b0f5dc621751d488456d6dda19f4ee0d06e7). Review antes do QA (R-REVIEW); todo desenvolvimento passa pelo QA (R-QA). Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, head c984b0f5dc621751d488456d6dda19f4ee0d06e7, já no origin. O `pronto` completo da branch já saiu verde no 2aac60225a5927f399b7ef12fe8833b786a022e8 (relato do autor); o que falta é o teste de ponta a ponta, a acessibilidade e a medição de CLS da ADR 0003 (F2 e F2m), que o review deixou com o QA para o A4 (aviso do botão "Copiar link").

## Ler
- `docs/reviews/048-usabilidade.md`, só o bloco `## Achados`.
- `docs/ux/revisao-geral-usabilidade/04-decisoes.md` (U1 a U5 e o catálogo) e `docs/ux/revisao-geral-usabilidade/02-propostas.md`, seções 2.2, 2.3, 3, 4 e 6 (base da DECISÃO TÉCNICA de 15:23 no Histórico do pedido).
- `docs/architecture/adr/0003-orcamento-de-performance.md`, só as linhas F2, F2m e a da ferramenta de medição (`e2e/perf/`).
- `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --stat 4137981e5333bee5b69f3c515b26c64d3a0b71c0 c984b0f5dc621751d488456d6dda19f4ee0d06e7`.

## Entregar
- (E5.2, E4) Testes E2E (Playwright, projeto `chromium`) que provem U1 a U5, o catálogo na Ajuda, a barra única e as correções A1 a A4 (índice de seções abaixo da barra de filtros ao rolar, Desfazer que sobrevive, linha `recorte-resumo` à vista, aviso do "Copiar link" sem deslocar o layout), num spec novo `e2e/tests/usabilidade-048.spec.ts`, mais a checagem de acessibilidade (axe, como em `e2e/tests/a11y.spec.ts`) das telas alteradas.
- (E5.2, E4) Medir CLS (ADR 0003 F2 < 0,1 e F2m a 375 px), com o projeto `perf` de `e2e/perf/` e a ação de "Copiar link" incluída no trecho medido; o número vai ao parecer marcado "mock".
- (E5.2) Rodar a suíte E2E e a medição sempre pela trava de suíte única: `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048b run test:e2e` e `bash /home/rodrigoisensee/MetricasDSPD-048b/scripts/suite-unica.sh pnpm --dir /home/rodrigoisensee/MetricasDSPD-048b/e2e run test:perf`, uma por vez; o `pnpm run pronto` completo uma vez, da raiz da worktree, antes do commit final (o spec novo muda o pacote e2e).
- (E5.2, E4) Parecer em `docs/qa/048-usabilidade.md`, pela ferramenta Write, no formato que o `forge-check pr` lê (frontmatter com `pedido: 048-o-que-falta-em-mock`, `commit:` com o sha do head testado e veredito; achados no bloco `## Achados`, com arquivo:linha e até 300 caracteres cada), com o resultado real da E2E, da acessibilidade e do CLS.
- (E5.2) Commits no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-074`, `git add` explícito por caminho (o spec e o parecer); push com `git push origin feature/048-usabilidade`, sem `--force` e sem PR.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; já entregue (2aac60225a5927f399b7ef12fe8833b786a022e8)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; review desta branch já aprovado (c984b0f5dc621751d488456d6dda19f4ee0d06e7); o PR continua no pedido, depois deste QA
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; não se aplica a esta branch (sem gatilho de segurança, Histórico do pedido)
- Mudar o código de produção (`web/src` fora de testes, `server/`, `packages/*/src`); defeito vira achado no parecer, sem correção aqui. O PR; a revisão de UX (E4.3); o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 2 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): F2 (CLS < 0,1) e F2m; com o mock, o número é marcado "mock" e vale como alerta (ADR 0003, fonte de dados).
- ADR 0020 (citada no pedido): proteção de pessoa; nesta branch, nenhum dado de pessoa entra em preferência, link copiado ou exportação; o spec confere o link copiado.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): a arquitetura do worker não é objeto deste QA.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 15:23, Histórico do pedido): a interface é conferida contra `04-decisoes.md` e `02-propostas.md` (seções 2.2, 2.3, 3, 4 e 6); P4 a P12 ficam fora do K-074.
- Trava de suíte única: espere a trava liberar (o QA da worktree 048a pode estar terminando); nunca rode duas suítes juntas. Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo.
- NÃO tocar: o código de produção, os pareceres de review, a worktree 048a, a `main`, o `.env`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha. Parecer se escreve só pela ferramenta Write ou Edit.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/e2e/tests/usabilidade-048.spec.ts`
- PQ-2 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048b run pronto` · espera: rc=0
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/qa/048-usabilidade.md`
- PQ-4 (cmd): `grep -c '^pedido: 048-o-que-falta-em-mock' /home/rodrigoisensee/MetricasDSPD-048b/docs/qa/048-usabilidade.md` · espera: igual '1'
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o veredito, os casos do spec novo e o resultado da E2E e da acessibilidade (passou/falhou, com números), o CLS medido (F2 e F2m, marcado "mock"), o resultado do pronto, os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
