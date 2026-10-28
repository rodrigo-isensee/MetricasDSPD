Agente destino: forge:ux-designer
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E4.0 do pedido 048 (cartão K-074): o dono aceitou o K-074 "com UX e protótipo", e o quadro diz que "O protótipo HTML vai junto com a feature", mas o protótipo `03-prototipo/` citado em `02-propostas.md` nunca foi commitado. Refaça o protótipo HTML já com as decisões do dono, para o react-frontend implementar a partir dele (E4.1). Escreva só na worktree `/home/rodrigoisensee/MetricasDSPD-048b` (branch `feature/048-usabilidade`, em 4137981e5333bee5b69f3c515b26c64d3a0b71c0); você não tem Bash: o commit sai no E4.1.

## Ler
- `docs/ux/revisao-geral-usabilidade/04-decisoes.md` inteiro (13 linhas): as decisões do dono.
- `docs/ux/revisao-geral-usabilidade/02-propostas.md`, só as seções 2, 3, 4 e 6 (P1, P2, P3 e o que o time decide).
- `docs/ux/design-system.md`, só o que o protótipo usa (cores, tipografia, componentes de botão e aviso).

## Entregar
- (E4.0, E4) `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/index.html`, HTML estático autocontido (sem dependência externa nem dado real), com links para as telas abaixo.
- (E4.0, E4) `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p1-ocultar-no-lugar.html`: U1 (ocultar lembrado até mandar mostrar), U2 (marcador no lugar, sempre visível, e a opção nas Preferências para desligar), "Mostrar" como desfazer sem prazo, foco e `aria-live`, "N de M visíveis" no título da seção, link para cartão oculto caindo no marcador.
- (E4.0, E4) `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p2-topo-enxuto.html`: Visão geral com "Pede atenção" na primeira dobra, U5 ("Por reunião" logo abaixo de "Pede atenção"), U4 (sem a sugestão por papel; "Restaurar padrão" com confirmação e desfazer sem prazo) e o catálogo de métricas dentro da Ajuda, fora do menu.
- (E4.0, E4) `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p3-indice-por-secao.html`: U3, índice fixo por seção num painel longo, sem indicador novo além do que o "Pede atenção" já publica.
- (E4.0) Dados fictícios de exemplo, sem nome de pessoa, sem ranking, sem comparação entre times e sem estatística com menos de 20 itens.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; entregue (0ea4c01416d0c2c16708c79148b785b08ad8dcea)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido (commita o protótipo)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- P4 a P12 do `02-propostas.md`; o modo resumido do U3; a espera invisível (pedido à parte); o código de `web/`, `server/` e `packages/`; o commit; a especificação nova; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nada a decidir nesta etapa (é da T14).
- ADR 0021 (citada no pedido): cálculo do mock em web worker; nada a decidir nesta etapa (é do E3.3).
- Decisões do dono da revisão de usabilidade (2026-10-13), em `docs/ux/revisao-geral-usabilidade/04-decisoes.md`: U1 a U5 e catálogo, como no Entregar.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o protótipo `03-prototipo` nunca foi commitado; o E4.0 o refaz já com as decisões U1 a U5, e o E4.1 parte dele e o leva junto na branch.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística; nada disso muda com a usabilidade.
- NÃO tocar: nada fora de `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b; o `.env`; a `main`; as outras worktrees.
- A `main` é do usuário.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/index.html` · protótipo de entrada
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p1-ocultar-no-lugar.html` · U1 e U2
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p2-topo-enxuto.html` · U4, U5 e catálogo
- PQ-4 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/03-prototipo/p3-indice-por-secao.html` · U3
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain --untracked-files=all` · espera: linhas=4

## Relatório
Até 8 linhas, resultado real: o que cada tela do protótipo mostra de U1 a U5 e do catálogo, e o que ficou como decisão técnica de UX; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
