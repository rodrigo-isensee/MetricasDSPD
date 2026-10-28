Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Volta do E4.1 do pedido 048 (cartão K-074): a conferência de entrega de 11135f76a30c707b9ffa858ddccee8cfb709c044 não cumpriu porque o P2 (topo enxuto) saiu parcial: a barra única de ações e o "Detalhes da coleta" não existem em `web/src`, e o corte não tem decisão. Completar o P2 e relatar as decisões técnicas de UX do E4.0 que ficaram sem relato. Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, head 11135f76a30c707b9ffa858ddccee8cfb709c044, já no origin.

## Ler
- `docs/ux/revisao-geral-usabilidade/02-propostas.md`, só a seção 3 (P2, opção B, linha 85) e a seção 6 (linha 150).
- O protótipo `docs/ux/revisao-geral-usabilidade/03-prototipo/p2-topo-enxuto.html`.
- `docs/architecture/adr/0003-orcamento-de-performance.md`, só a linha F2 (CLS) da tabela de orçamento.
- `git -C /home/rodrigoisensee/MetricasDSPD-048b show e7b61a6` (a parte do P2 já feita).

## Entregar
- (E4.1, E4) P2, a parte que faltou, como na opção B da seção 3 do `02-propostas.md` e no protótipo: uma barra única de ações (Cadência · Filtros · Métricas · Exportar · Copiar link) e "Entenda" vira "Detalhes da coleta" em popover, com espaço reservado para não deslocar o layout; nenhum aviso obrigatório deixa de ser alcançável. Se um pedaço não couber no orçamento de CLS da ADR 0003, não corte: pare e relate o pedaço e a medição (vira decisão do Jarvis ou do dono).
- (E4.1, E4) As quatro decisões técnicas de UX do E4.0, que o Histórico do pedido (15:33) deixou "a confirmar no E4.1" e que o relatório do E4.1 não confirmou: foco sem marcadores vai para Preferências; destaque por link só com borda; dialog no Restaurar padrão; alvos de 44 px. Para cada uma, diga no relatório se está aplicada (com arquivo:linha) ou o que mudou e o motivo; hoje não há `<dialog>` em `web/src`, e `web/src/styles/tokens.css:132` e `web/src/components/ui/Botao.tsx:17` dizem 24 px em todas as larguras e 44 px abaixo de 768 px. Aplique o que o E4.0 decidiu quando couber nesta volta; o que não aplicar, relate com o motivo.
- (E4.1) Testes unitários da barra e do "Detalhes da coleta" em `web/`; durante o desenvolvimento só os testes e o typecheck de `web/`; `pnpm run pronto` completo uma vez, da raiz da worktree, antes do commit final.
- (E4.1) Um commit do P2 e das decisões de UX do E4.0 no padrão de commits do `praticas.md`, com `Cartão: K-074`, `git add` explícito por caminho; push com `git push origin feature/048-usabilidade`, sem PR. Relate as linhas alteradas do commit (o total da branch já passa de 400; a conta e a exceção são do tech-lead no PR).
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (commitado em ce4cee9)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- U1 a U5 e o catálogo, já entregues em 11135f76a30c707b9ffa858ddccee8cfb709c044: não refaça. P4 a P12 do `02-propostas.md` (nomes antes de códigos, textos de alerta, exportação, O2, esqueleto, consistência); o modo resumido do U3; a espera invisível (pedido à parte); o back-end e os contratos; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): linha F2, "CLS | < 0,1". O E4.1 deixou parte do P2 de fora alegando CLS (Histórico do pedido, 16:27); o P2 completo precisa caber nesse orçamento.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 16:30, Histórico do pedido): "completar o P2 dentro da ADR 0003, não cortar"; a seção 6 do `02-propostas.md` dá ao time a forma do P2, "desde que nenhum aviso obrigatório deixe de ser alcançável".
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nada a decidir nesta etapa (é da T14).
- ADR 0021 (citada no pedido): cálculo do mock em web worker; nada a decidir nesta etapa (é do E3.3); não mexa no worker.
- Decisões do dono da revisão de usabilidade (2026-10-13), em `docs/ux/revisao-geral-usabilidade/04-decisoes.md`: U1 a U5 e catálogo, como no Entregar.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o protótipo `03-prototipo` nunca foi commitado; o E4.0 o refez já com as decisões U1 a U5, e o E4.1 parte dele e o leva junto na branch.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística; nada disso muda com a usabilidade.
- A trava de suíte única está na base: se o `pronto` esperar a trava, espere; não rode outra suíte em paralelo. O QA e o security-engineer trabalham na worktree 048a.
- NÃO tocar: `server/`, `docs/api/`, o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b log --oneline 11135f76a30c707b9ffa858ddccee8cfb709c044..HEAD` · espera: linhas=1
- PQ-2 (cmd): `grep -rl 'Detalhes da coleta' /home/rodrigoisensee/MetricasDSPD-048b/web/src` · espera: linhas>=1
- PQ-3 (cmd): `pnpm run pronto`, rodado da raiz de `/home/rodrigoisensee/MetricasDSPD-048b` antes do commit final · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 11135f76a30c707b9ffa858ddccee8cfb709c044 HEAD -- server docs/api` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que a barra única e o "Detalhes da coleta" mudaram na tela, o CLS medido se houver, as quatro decisões de UX do E4.0 (foco sem marcadores, destaque só com borda, dialog no Restaurar padrão, 44 px), as linhas alteradas do commit e o resultado do `pronto`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
