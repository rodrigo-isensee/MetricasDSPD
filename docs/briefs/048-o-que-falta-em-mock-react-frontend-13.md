Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-ajustes-front   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo

## Objetivo
Etapa E3.2 do pedido 048 (E3, cartões K-128, K-126 e K-133): ajustes do front em mock. Worktree `/home/rodrigoisensee/MetricasDSPD-048d`, branch `feature/048-ajustes-front`, head 430dcfeaf9e6d04913d38c3f9e0f03f86e3ffffa (ADR 0021 vigente, E3.5), já no origin, dependências instaladas.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048d/docs/reviews/025-front-taticas.md:34` (K-128) e `/home/rodrigoisensee/MetricasDSPD-048d/web/src/data/mock/MockFonteMetricas.ts:51-55`; `/home/rodrigoisensee/MetricasDSPD-048d/web/src/data/mock/nucleoMock.ts` (onde o `COM_TAMBEM` mora hoje).
- `/home/rodrigoisensee/MetricasDSPD-048d/docs/reviews/037-c6-operacional.md:46-47` (K-126, A1 e A2).
- `/home/rodrigoisensee/MetricasDSPD-048d/docs/qa/bugs/L2T-003-cls-tatico-com-equipe-0-07-a-0-10.md` (K-133).
- `/home/rodrigoisensee/MetricasDSPD-048d/docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md`, só a §2.

## Entregar
- (E3.2, E3) K-128: o `COM_TAMBEM` do mock passa a incluir T11, T13 e T14, coerente com o `COM_EXTENSAO_MOCK` e com `server/src/modulos/metricas/servico.ts:57`, com teste (inclusive o de paridade do `nucleoMock`); atualizar `docs/tecnica/arquitetura-front.md:302` e `:313`, que registram o adiamento (o review 025 cita :297, linha que mudou).
- (E3.2, E3) K-126: no `nucleoMock.worker.ts`, `postMessage` que lança responde `{ id, ok: false, erro }` (try/catch) e o pedido nunca fica pendente; no `nucleoMock.ts`, pedido antes do `iniciar` vira erro explícito "núcleo do mock não iniciado"; um teste para cada, que falha sem a mudança.
- (E3.2, E3) K-133: achar a causa do CLS de 0,073 a 0,100 em `/tatico` com equipe (a seção do núcleo que cresce 32 px, L2T-003) e reservar o espaço para o CLS ficar abaixo de 0,1, com teste de unidade da reserva; a medida do CLS no navegador fica com o QA, em outra etapa do pedido.
- (E3.2) Um commit por cartão no padrão de commits do `docs/engineering/praticas.md` (`Cartão: K-…`), `git add` por caminho; durante o desenvolvimento só os testes e o typecheck de `web/`; `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto` uma vez, da raiz da worktree, antes do commit final; antes do push, `git branch --show-current` deve dar `feature/048-ajustes-front`; push com `git push origin HEAD:refs/heads/feature/048-ajustes-front`, sem `--force` e sem PR.
- (E1, E2, E4, E6) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a4)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f60)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (9b97e9d)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; já entregue em parte (O23 em d9979ee, review em 45991e4, K-093 sem código); o K-129 continua no pedido, em PERGUNTA ao dono
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; já entregue (ADR 0021 em 430dcfe)
- "E3.4 (forge:react-frontend): na `feature/048-ajustes-front`, o `web/scripts/size.mjs` mede o F9 como o E3.3 decidir (K-127), em delegação própria, depois do E3.2." · etapa de outra delegação; continua no pedido, na delegação seguinte desta worktree
- "E3.5 (forge:tech-lead): commit e push do E3.3 na `feature/048-ajustes-front` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (430dcfe)
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido (outra branch, 048b)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E4.4 (forge:ux-designer): na worktree 048b, atualizar `docs/ux/dashboard-metricas/especificacao.md` e `docs/ux/design-system.md` para a decisão 048-03 = A (barra de filtros sem sticky a partir de 768 px), achado A8 do review de 2049c39 (E4)." · etapa de outra delegação; continua no pedido (outra branch, 048b)
- "E4.5 (forge:tech-lead): commit e push do E4.4 na `feature/048-usabilidade` (o ux-designer não tem Bash) (E4)." · etapa de outra delegação; continua no pedido (outra branch, 048b)
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; o review desta entrega, o PR e o merge continuam no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; o QA desta entrega continua no pedido, depois do review
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.5 (forge:tech-lead): worktrees e branches do E3 a partir da develop depois do PR #161: `/home/rodrigoisensee/MetricasDSPD-048c` com `feature/048-ajustes-back` (E3.1) e `/home/rodrigoisensee/MetricasDSPD-048d` com `feature/048-ajustes-front` (E3.2 e E3.3), com push das duas e `pnpm install --frozen-lockfile` em cada uma, sem testes (sem as dependências os desenvolvedores não rodam testes nem typecheck)." · etapa de outra delegação; já entregue (7c94348, worktree 048c)
- "E6.0 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-048e` com `feature/048-dompurify` a partir da develop 7c94348, com `pnpm install --frozen-lockfile` (feito em 2026-10-29 08:03, sem commit)." · etapa de outra delegação; já entregue (worktree 048e, sem commit)
- "E6.1 (forge:tech-lead; executor em PERGUNTA ao dono de 2026-10-29 08:07): na worktree `/home/rodrigoisensee/MetricasDSPD-048e`, branch `feature/048-dompurify`, subir o dompurify para a 3.4.17 (E6) no lockfile (versão mínima que corrige o alerta #12), com `pronto` uma vez, commit e push, sem PR." · etapa de outra delegação; continua no pedido
- "E6.2 (forge:security-engineer): avaliação do impacto do alerta #12 no projeto (onde o dompurify entra, direto ou transitivo; se o código usa `SAFE_FOR_TEMPLATES`) e review de segurança do E6.1 (E6), num parecer só, `docs/security/048-dompurify.md`; depois code review e QA pelo E5.1 e pelo E5.2, e PR." · etapa de outra delegação; continua no pedido
- O `web/scripts/size.mjs` e o F9 (E3.4); editar a ADR 0021 ou a ADR 0003; o servidor (`server/`); outras worktrees; review, PR e merge; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa; o K-128 no mock não expõe nome nem dado de pessoa (T14 no mock usa os membros simulados do E1.3; "outros times" sem nome, tempo, vazão nem ranking, Q-T14-6 e T14-M1 acima).
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): §2 (fronteira de mensagens: pedido nunca fica pendente para sempre) para o K-126; a §8 (F9) é do E3.4, outra delegação.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): F2, CLS < 0,1 (K-133).
- DECISÃO TÉCNICA do Jarvis (2026-10-29 05:45, Histórico do pedido): a E3 sai em duas branches; esta é a do front com o worker.
- DECISÃO TÉCNICA do Jarvis (2026-10-29 08:25, Histórico do pedido): ordem na 048d E3.3 → E3.5 → E3.2 (E3.5 entregue em 430dcfe); o E3.4 vem depois, em delegação própria (DECISÃO TÉCNICA de 2026-10-29 08:40).
- Regras invioláveis do `CLAUDE.md`: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não publica estatística; todo cálculo passa pela biblioteca compartilhada.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha; commit com heredoc vai sozinho na chamada.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d log --oneline 430dcfeaf9e6d04913d38c3f9e0f03f86e3ffffa..HEAD` · espera: linhas>=3
- PQ-2 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto`, rodado da raiz de `/home/rodrigoisensee/MetricasDSPD-048d` antes do commit final · espera: rc=0
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048d ls-remote origin refs/heads/feature/048-ajustes-front` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048d rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d diff --name-only 430dcfeaf9e6d04913d38c3f9e0f03f86e3ffffa HEAD -- server docs/architecture` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: cada cartão com o sha do commit, os testes novos (arquivo:linha) e a causa achada do K-133; o resultado do `pronto`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
