Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo   Cobre: E4.1

## Objetivo
Volta 2 do bug 048-01 e 4ª volta do bug 048-03 (autorizada pelo dono em 2026-10-29), E4.1 do pedido 048, cartão K-074. O reteste do QA (7d1a48e) reprovou A1 (048-01) e A3 (048-03). Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, head 7d1a48e, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/048-usabilidade.md`, seção `## Achados` (A1 e A3).
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/bugs/048-01-indice-cobre-titulo.md` e `/home/rodrigoisensee/MetricasDSPD-048b/docs/qa/bugs/048-03-axe-target-size-na-sustentacao.md` (passos, esperado e evidência).
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md`, linhas 49 a 53 (CA-A a CA-E).

## Entregar
- (E4.1, E4) A1, bug 048-01: depois do clique em "Fila", o link "Fila" do índice fica com `aria-current="location"` (USAB-05b de `e2e/tests/usabilidade-048.spec.ts` verde; `web/src/features/operacional/IndiceDeSecoes.tsx:72`), com teste de unidade que falha sem a correção.
- (E4.1, E4) A3, bug 048-03: CT-29 (`e2e/tests/sustentacao-no-operacional-qa.spec.ts:380`) e USAB-19 (CA-B, axe `target-size` sem violação séria em todas as posições de rolagem, passos de 100 px, Sustentação a 1280 px) verdes, mantendo cabeçalho e índice fixos; com teste de unidade da correção. Se o CA-B não for alcançável sem mudar a decisão 048-03 = A, pare e relate com a evidência (posições e alvos), sem commit dessa parte.
- (E4.1) Durante o desenvolvimento, só os testes e o typecheck de `web/` e os specs `usabilidade-048.spec.ts` e `sustentacao-no-operacional-qa.spec.ts` da E2E (decisão do dono de 2026-10-21); `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto` uma vez, da raiz da worktree, antes do commit final.
- (E4.1) Um commit por bug no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-074` e `git add` por caminho; antes do push, `git branch --show-current` deve dar `feature/048-usabilidade`; push com `git push origin HEAD:refs/heads/feature/048-usabilidade`, sem `--force` e sem PR.
- (E1, E2, E3, E6) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E1.6 (software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E3.4 (react-frontend): na `feature/048-ajustes-front`, o `web/scripts/size.mjs` mede o F9 como o E3.3 decidir (K-127), em delegação própria, depois do E3.2." · etapa de outra delegação; continua no pedido
- "E3.5 (tech-lead): commit e push do E3.3 na `feature/048-ajustes-front` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E4.0 (ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9)
- "E4.2 (react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; o parecer do ux-designer sobre a viabilidade do CA-B corre em paralelo, em delegação própria
- "E4.4 (ux-designer): na worktree 048b, atualizar `docs/ux/dashboard-metricas/especificacao.md` e `docs/ux/design-system.md` para a decisão 048-03 = A (barra de filtros sem sticky a partir de 768 px), achado A8 do review de 2049c39 (E4)." · etapa de outra delegação; já entregue (fc1e59f)
- "E4.5 (tech-lead): commit e push do E4.4 na `feature/048-usabilidade` (o ux-designer não tem Bash) (E4)." · etapa de outra delegação; já entregue (fc1e59f)
- "E5.0 (tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981)
- "E5.1 (tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; o reteste 7d1a48e reprovou (A1 e A3) e o novo reteste vem depois do re-review desta volta
- "E5.3 (agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.5 (tech-lead): worktrees e branches do E3 a partir da develop depois do PR #161: `/home/rodrigoisensee/MetricasDSPD-048c` com `feature/048-ajustes-back` (E3.1) e `/home/rodrigoisensee/MetricasDSPD-048d` com `feature/048-ajustes-front` (E3.2 e E3.3), com push das duas e `pnpm install --frozen-lockfile` em cada uma, sem testes (sem as dependências os desenvolvedores não rodam testes nem typecheck)." · etapa de outra delegação; continua no pedido
- "E6.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-048e` com `feature/048-dompurify` a partir da develop 7c94348, com `pnpm install --frozen-lockfile` (feito em 2026-10-29 08:03, sem commit)." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): executor decidido pelo dono em 2026-10-29 (K-178 executor = A); na worktree `/home/rodrigoisensee/MetricasDSPD-048e`, branch `feature/048-dompurify`, subir o dompurify para a 3.4.17 (E6) no lockfile (versão mínima que corrige o alerta #12), com `pronto` uma vez, commit e push, sem PR." · etapa de outra delegação; continua no pedido
- "E6.2 (security-engineer): avaliação do impacto do alerta #12 no projeto (onde o dompurify entra, direto ou transitivo; se o código usa `SAFE_FOR_TEMPLATES`) e review de segurança do E6.1 (E6), num parecer só, `docs/security/048-dompurify.md`; depois code review e QA pelo E5.1 e pelo E5.2, e PR." · etapa de outra delegação; continua no pedido
- Mudar a decisão 048-03 = A (cabeçalho e índice fixos, barra de filtros rolando) ou os critérios CA-A a CA-E; editar `e2e/` (specs do QA), `docs/` e `server/`; marcar teste com `test.fail`, `skip` ou afrouxar asserção; o merge da develop na branch (é do tech-lead no E5.1); o quadro e o arquivo do pedido; outras worktrees; reescrever commits.

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
- DECISÃO DO DONO (2026-10-29): K-178, executor, opção A ("A"): o node-backend (papel de dev) sobe o dompurify para a 3.4.17 e o tech-lead revisa; o hook recusou o `pnpm update` ao tech-lead.
- DECISÃO DO DONO (2026-10-29): K-129, opção A ("A"): na T11, é mês de pico o mês com volume maior ou igual à média mensal vezes 1,3; o fator é configurável e versionado como critério de cálculo (T2.6).
- DECISÃO DO DONO (2026-10-29): K-129, mês corrente, opção A ("A"): o mês corrente (incompleto) fica fora da média e da marcação de pico; aparece com a nota "em andamento".
- DECISÃO DO DONO (2026-10-29): K-129, "nos dois anos", opção A ("A"): a frase da T11 cita só o mês que foi pico (volume maior ou igual à média mensal do ano vezes 1,3) em cada um dos dois anos fechados (pico recorrente). Mínimo: o da especificação da T11 (censo, com a nota de menos de dois anos).
- DECISÃO DO DONO (2026-10-29): 048-03 na 3ª reprovação, opção A ("A"): 4ª volta autorizada ao react-frontend (CT-29, link sob o cabeçalho, e CA-B, target-size em todas as posições de rolagem), com parecer do ux-designer em paralelo sobre a viabilidade do CA-B com cabeçalho fixo; se não for alcançável, volta ao dono.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): não é objeto desta entrega (nenhum dado de pessoa).
- ADR 0021 (citada no pedido): não é objeto desta entrega (é do E3.3).
- ADR 0003 (citada no pedido): a linha F2 (CLS abaixo de 0,1) vale; a correção não pode fazer o conteúdo saltar (CA-D).
- DECISÃO TÉCNICA (Jarvis, 2026-10-29 10:08, registrada no Histórico do pedido): volta ao forge:react-frontend (048-01 e CT-29) e parecer do forge:ux-designer sobre a viabilidade do CA-B; se o CA-B mudar, vira pergunta ao dono.
- U1 a U5 e P2 de `docs/ux/revisao-geral-usabilidade/04-decisoes.md` continuam valendo; U3 (índice fixo por seção) fica.
- O `vite preview` da worktree 045 ouve na porta 4173 e pode servir o build errado: rode a E2E com `E2E_PORTA=4181` (observação do QA em `docs/qa/048-usabilidade.md`).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- Não ler nem editar o `.env`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook ou check vermelho: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b log --oneline 7d1a48e..HEAD` · espera: linhas>=1
- PQ-2 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto`, rodado da raiz de `/home/rodrigoisensee/MetricasDSPD-048b` antes do commit final · espera: rc=0
- PQ-3 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin E2E_PORTA=4181 pnpm --filter @metricas-dspd/e2e exec playwright test --project=chromium tests/usabilidade-048.spec.ts tests/sustentacao-no-operacional-qa.spec.ts`, da raiz da worktree · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain -- web e2e server` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 7d1a48e HEAD -- e2e docs server` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono (decisão ou ação, e o que destrava); suposições com a base; a causa e a correção de cada bug (arquivo:linha), os testes novos, o resultado dos specs e do `pronto`, os shas; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
