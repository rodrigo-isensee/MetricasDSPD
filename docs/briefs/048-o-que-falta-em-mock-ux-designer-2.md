Agente destino: forge:ux-designer
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E4.3 do pedido 048 (cartões K-112 e K-130), só a parte do E1.4: revisão de UX da tela da T14 implementada na `docs/048-t14-desenho` (commit 792489f, `web/src/features/complementares/taticas.tsx`), que passou a ler a resposta da API em união por oculto (projeto com "outros times" oculto mostra só a fatia do meu time, sem o total, e vem depois dos visíveis, ordenado por código). A entrega muda interface, e a revisão de UX vem depois do QA e antes do PR (fluxo do CLAUDE.md, passo 5). Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, head f9c22a673bdfd4df7f0118a9c56a47395e677b2c.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md`, seção "2. K-130: o que a API da T14 deixa de enviar".
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, só a ficha da T14 (§5) e os critérios de aceite que ela cita.
- `git -C /home/rodrigoisensee/MetricasDSPD-048a show 792489f` (a tela e o teste dela).
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/qa/048-t14-desenho.md`, só o que o QA provou da tela.
- `/home/rodrigoisensee/MetricasDSPD/docs/ux/revisao-025-front-taticas.md`, só como modelo de forma (a revisão anterior da T14).

## Entregar
- (E4.3) Revisão de UX em `/home/rodrigoisensee/MetricasDSPD-048a/docs/ux/revisao-048-t14.md`, gravada pela ferramenta Write, no formato da `revisao-025-front-taticas.md` (frontmatter com pedido, cartão, branch, head, revisor e data; parecer; achados por severidade crítico, alto, médio ou baixo, cada um com onde ocorre, por que é problema e a correção sugerida): fidelidade da T14 à ficha e às decisões T14-M1 = B e Q-T14-12 = B (o oculto sem total, sem "outros times" e depois dos visíveis por código), texto do estado oculto, acessibilidade (WCAG 2.2 AA: rótulos, leitura por leitor de tela da linha oculta) e nenhuma forma de nomear, ordenar ou comparar times ou pessoas.
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
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152, na feature/048-usabilidade)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; já entregue (2aac60225a5927f399b7ef12fe8833b786a022e8, na feature/048-usabilidade)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; já entregue (f9c22a673bdfd4df7f0118a9c56a47395e677b2c nesta branch; na feature/048-usabilidade, em outra delegação)
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; já entregue (f786c9c24ff1432adc62a863552083c7688629a7)
- A revisão de UX do E3.2, do E4.1 e do E4.2 (outras branches, outra delegação do E4.3); commit e push da revisão (o tech-lead commita no PR, E5.1); mudar código, testes, especificação ou outros pareceres; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa; nenhum dado de pessoa na tela.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta revisão.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto desta revisão.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 17:58, Histórico deste pedido): a revisão de UX do E1.4 é parte do E4.3 e sai antes do PR da `docs/048-t14-desenho`, por leitura do código e do parecer de QA (sem subir a interface; o QA usa a máquina).
- Achado que pede regra de negócio nova vira pergunta ao dono no relatório, nunca decisão no parecer.
- NÃO tocar: o código, os testes, a especificação, os outros pareceres, a `main`, o `.env`, as outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048a/docs/ux/revisao-048-t14.md`
- PQ-2 (cmd): `grep -c '^head: f9c22a673bdfd4df7f0118a9c56a47395e677b2c' /home/rodrigoisensee/MetricasDSPD-048a/docs/ux/revisao-048-t14.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^## Parecer' /home/rodrigoisensee/MetricasDSPD-048a/docs/ux/revisao-048-t14.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real: o parecer, os achados por severidade (onde ocorre, até 200 caracteres cada) e as perguntas ao dono, se houver; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
