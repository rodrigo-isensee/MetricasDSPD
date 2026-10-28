Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E4.1 do pedido 048 (cartão K-074): implementar no front a revisão geral de usabilidade validada pelo dono (U1 a U5, catálogo na Ajuda e topo enxuto), a partir do protótipo refeito no E4.0, para os painéis ficarem mais fáceis de ler e de usar. Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, em 4137981e5333bee5b69f3c515b26c64d3a0b71c0, já no origin (sem upstream local: push com `git push origin feature/048-usabilidade`).

## Ler
- `docs/ux/revisao-geral-usabilidade/04-decisoes.md` inteiro (13 linhas): as decisões do dono.
- `docs/ux/revisao-geral-usabilidade/02-propostas.md`, só as seções 2.2, 2.3, 3, 4 e 6 (P1, P2, P3 e o que o time decide).
- O protótipo do E4.0, ainda sem commit na worktree: `docs/ux/revisao-geral-usabilidade/03-prototipo/` (`index.html`, `p1-ocultar-no-lugar.html`, `p2-topo-enxuto.html`, `p3-indice-por-secao.html`).
- `docs/engineering/praticas.md`, só a seção de commits.
- O código de `web/src` que as decisões tocam (ocultar cartão, Preferências, Visão geral, menu, Ajuda, rota `/metricas`); procure, não leia tudo.

## Entregar
- (E4.1, E4) Primeiro commit: o protótipo do E4.0 como está, `git add docs/ux/revisao-geral-usabilidade/03-prototipo`, com `Cartão: K-074` (o protótipo vai junto na branch).
- (E4.1, E4) Confirme ou ajuste na implementação as decisões técnicas de UX do E4.0 (Histórico do pedido): foco sem marcadores vai para Preferências, destaque por link só com borda, `<dialog>` no "Restaurar padrão", alvos de 44 px; o que mudar, relate.
- (E4.1, E4) U1: "Ocultar" passa a ser lembrado; o cartão fica oculto até o usuário mandar mostrar.
- (E4.1, E4) U2: marcador de cartão oculto no lugar, sempre visível, com opção nas Preferências para desligar os marcadores.
- (E4.1, E4) U3: índice fixo por seção nos painéis longos (sem indicador novo além do que o "Pede atenção" já publica).
- (E4.1, E4) U4: a sugestão por papel sai da tela (padrão = tudo visível); ações em massa (ex.: "Restaurar padrão") pedem confirmação e permitem desfazer sem prazo.
- (E4.1, E4) U5: "Por reunião" sobe para logo abaixo de "Pede atenção" na Visão geral.
- (E4.1, E4) Catálogo de métricas sai do menu e passa a ser parte da Ajuda; links diretos para `/metricas` continuam funcionando.
- (E4.1, E4) As decisões técnicas da seção 6 do `02-propostas.md` para P1, P2 e P3 (ocultar e mostrar no lugar com foco e `aria-live`, sem aviso flutuante temporizado, link para cartão oculto cai no marcador, "N de M visíveis" no título da seção, topo enxuto sem perder aviso obrigatório), com os critérios da seção 2.3.
- (E4.1) Testes unitários de cada item acima em `web/`; durante o desenvolvimento só os testes e o typecheck de `web/`; `pnpm run pronto` completo uma vez, da raiz da worktree, antes do commit final.
- (E4.1) Depois do protótipo, um commit por item (U1, U2, U3, U4, U5, catálogo, P2) no padrão de commits do `praticas.md`, com `Cartão: K-074`, `git add` explícito por caminho; push com `git push origin feature/048-usabilidade`, sem PR. Se o total passar de 400 linhas alteradas de código e teste, relate a contagem por commit.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; entregue (0ea4c01416d0c2c16708c79148b785b08ad8dcea)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido (outra instância, worktree 048a)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (4 arquivos sem commit na worktree 048b)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- P4 a P12 do `02-propostas.md` (nomes antes de códigos, textos de alerta, exportação, O2, esqueleto, consistência); o modo resumido do U3; a espera invisível (pedido à parte); o back-end e os contratos; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0021 (citada no pedido): cálculo do mock em web worker; nada a decidir nesta etapa (é do E3.3); não mexa no worker.
- Decisões do dono da revisão de usabilidade (2026-10-13), em `docs/ux/revisao-geral-usabilidade/04-decisoes.md`: U1 a U5 e catálogo, como no Entregar.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o protótipo `03-prototipo` nunca foi commitado; o E4.0 o refez já com as decisões U1 a U5, e o E4.1 parte dele e o leva junto na branch.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística; nada disso muda com a usabilidade.
- A trava de suíte única está na base: se o `pronto` esperar a trava, espere; não rode outra suíte em paralelo. Outra instância do react-frontend trabalha na worktree 048a.
- NÃO tocar: `server/`, `docs/api/`, o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b log --oneline 4137981e5333bee5b69f3c515b26c64d3a0b71c0..HEAD` · espera: linhas>=8
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 4137981e5333bee5b69f3c515b26c64d3a0b71c0 HEAD -- server` · espera: linhas=0
- PQ-3 (cmd): `pnpm run pronto`, rodado da raiz de `/home/rodrigoisensee/MetricasDSPD-048b` antes do commit final · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que cada item (U1 a U5, catálogo, P2) mudou na tela, as linhas alteradas por commit e o resultado do `pronto`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
