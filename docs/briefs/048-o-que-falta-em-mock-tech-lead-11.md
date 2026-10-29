Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-ajustes-back   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo

## Objetivo
Etapa E5.5 do pedido 048 (E3, ajustes em mock): criar as duas worktrees e branches do E3 a partir da `develop` (7c94348b9bdc12850f40bad00cd38669ba8cc0e5, merge do PR #161), para o node-backend (E3.1) e o react-frontend com o software-architect (E3.2 e E3.3) começarem em paralelo. Só preparo; nenhum código.

## Ler
- Nada além deste brief.

## Entregar
- (E5.5, E3) `git -C /home/rodrigoisensee/MetricasDSPD fetch origin`; se a `origin/develop` não estiver em 7c94348b9bdc12850f40bad00cd38669ba8cc0e5, use a ponta atual e relate o sha.
- (E5.5, E3) `git -C /home/rodrigoisensee/MetricasDSPD worktree add -b feature/048-ajustes-back /home/rodrigoisensee/MetricasDSPD-048c origin/develop` e `git -C /home/rodrigoisensee/MetricasDSPD-048c push origin feature/048-ajustes-back` (sem `-u`).
- (E5.5, E3) `git -C /home/rodrigoisensee/MetricasDSPD worktree add -b feature/048-ajustes-front /home/rodrigoisensee/MetricasDSPD-048d origin/develop` e `git -C /home/rodrigoisensee/MetricasDSPD-048d push origin feature/048-ajustes-front` (sem `-u`).
- (E5.5) `pnpm install --frozen-lockfile` em cada worktree, um por vez, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin`, para os desenvolvedores encontrarem as dependências; sem testes.
- (E1, E2, E3, E4) Nada além disso: as outras etapas são de outras delegações.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- Commit de qualquer arquivo; testes, `pronto` e suíte; o quadro e o arquivo do pedido; a branch do repositório principal (`docs/jarvis-2026-10-23`), as outras worktrees e a `main`; ler ou editar o `.env`.

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
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- ADR 0020 (citada no pedido): não é objeto desta etapa (só preparo).
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta etapa; é do E3.3.
- ADR 0003 (citada no pedido): não é objeto desta etapa.
- DECISÃO TÉCNICA do Jarvis (2026-10-29 05:45, Histórico do pedido): o E3 sai em duas branches, back (E3.1) e front com o worker (E3.2 e E3.3).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048c ls-remote origin refs/heads/feature/048-ajustes-back` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048c rev-parse HEAD`
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048d ls-remote origin refs/heads/feature/048-ajustes-front` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048d rev-parse HEAD`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048c status --porcelain` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d status --porcelain` · espera: linhas=0
- PQ-5 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048c/node_modules` e `test -e /home/rodrigoisensee/MetricasDSPD-048d/node_modules`

## Relatório
Até 8 linhas, resultado real: o sha da base usada e o resultado das duas instalações; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
