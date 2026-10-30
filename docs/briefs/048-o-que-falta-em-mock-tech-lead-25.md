Agente destino: forge:tech-lead
Pedido: docs/pedidos/048-o-que-falta-em-mock.md
Tipo: codigo
Branch: feature/048-dompurify   Base: develop   Base-sha: 1a6617ec31c40c496e12708b5bf313904f90c350
Etapa: review   Cobre: E5.1

## Objetivo
Revalidação por delta do code review da `feature/048-dompurify` (K-178, pedido 048, E6), para destravar o merge do PR #171. Na entrega do brief tech-lead-24, o `forge-check pr 048-o-que-falta-em-mock` deu rc=1: "docs/reviews/048-dompurify.md: commit: desatualizado: .forge/versao mudou depois do parecer; peça novo parecer (R-REVIEW)" (o mesmo para QA e segurança). A causa são os merges da develop (até 1a6617e) trazidos pelo `gh pr update-branch`. Worktree `/home/rodrigoisensee/MetricasDSPD-048e`, branch `feature/048-dompurify`, HEAD 85e41636a63548a0f251a14f6d373b083497a27d (igual ao origin).

## Ler
- `forge-check delta --parecer docs/reviews/048-dompurify.md`, rodado de dentro da worktree (o intervalo desde o commit do parecer).
- `docs/reviews/048-dompurify.md` na worktree (o seu parecer anterior, 8e0f8f4).

## Entregar
- (E5.1, E6) Code review do delta (R-REVIEW): confirmar que o que entrou desde o parecer veio só da develop (merges do `gh pr update-branch`) e não muda o lockfile, o `package.json` do dompurify nem o que o parecer aprovou; atualizar `docs/reviews/048-dompurify.md` com a ferramenta Write ou Edit (não com `sed` nem redirecionamento), com o `commit:` revisado igual ao HEAD 85e41636a63548a0f251a14f6d373b083497a27d, veredito, uma seção de revalidação que cita o intervalo do delta, e `## Achados` (vazia se não houver). O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E5.1) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-178` e `git add docs/reviews/048-dompurify.md`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-048e branch --show-current` (espera `feature/048-dompurify`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-048e push origin HEAD:refs/heads/feature/048-dompurify`, sem `-u`. Sem merge do PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

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
- "E4.0 (ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; continua no pedido
- "E4.1 (react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido
- "E4.2 (react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E4.4 (ux-designer): na worktree 048b, atualizar `docs/ux/dashboard-metricas/especificacao.md` e `docs/ux/design-system.md` para a decisão 048-03 = A (barra de filtros sem sticky a partir de 768 px), achado A8 do review de 2049c39 (E4)." · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): commit e push do E4.4 na `feature/048-usabilidade` (o ux-designer não tem Bash) (E4)." · etapa de outra delegação; continua no pedido
- "E5.0 (tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; continua no pedido
- "E5.2 (qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; o QA desta branch foi entregue (143b935, aprovado; frontmatter corrigido em 8df0743) e a revalidação por delta vem depois deste review
- "E5.3 (agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; a revalidação por delta do parecer 6c1dc67 vem depois deste review
- "E5.5 (tech-lead): worktrees e branches do E3 a partir da develop depois do PR #161: `/home/rodrigoisensee/MetricasDSPD-048c` com `feature/048-ajustes-back` (E3.1) e `/home/rodrigoisensee/MetricasDSPD-048d` com `feature/048-ajustes-front` (E3.2 e E3.3), com push das duas e `pnpm install --frozen-lockfile` em cada uma, sem testes (sem as dependências os desenvolvedores não rodam testes nem typecheck)." · etapa de outra delegação; continua no pedido
- "E6.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-048e` com `feature/048-dompurify` a partir da develop 7c94348, com `pnpm install --frozen-lockfile` (feito em 2026-10-29 08:03, sem commit)." · etapa de outra delegação; já entregue (worktree 048e)
- "E6.1 (node-backend): executor decidido pelo dono em 2026-10-29 (K-178 executor = A); na worktree `/home/rodrigoisensee/MetricasDSPD-048e`, branch `feature/048-dompurify`, subir o dompurify para a 3.4.17 (E6) no lockfile (versão mínima que corrige o alerta #12), com `pronto` uma vez, commit e push, sem PR." · etapa de outra delegação; já entregue (a48aacb)
- "E6.2 (security-engineer): avaliação do impacto do alerta #12 no projeto (onde o dompurify entra, direto ou transitivo; se o código usa `SAFE_FOR_TEMPLATES`) e review de segurança do E6.1 (E6), num parecer só, `docs/security/048-dompurify.md`; depois code review e QA pelo E5.1 e pelo E5.2, e PR." · etapa de outra delegação; já entregue (6c1dc67, parecer aprovado)
- O merge do PR #171 e a revalidação dos pareceres de QA e de segurança (próximas delegações do E5.1, do E5.2 e do E5.4); mudar o lockfile, o `pnpm-workspace.yaml`, código, a pasta `.forge/` e os pareceres de QA e de segurança; a `homolog` e a `main`; o quadro e o arquivo de pedido; apagar a branch remota e a worktree (ação do dono).

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
- Executor vigente do K-178: a linha de 2026-10-29 "K-178, executor, opção A" (o node-backend sobe a versão, o tech-lead revisa) substitui o executor citado na linha anterior do K-178 ("tech-lead sobe a versão"); o resto da linha anterior (branch própria, review, segurança, QA, PR para a develop) continua valendo.
- ADR 0020 (citada no pedido): não é objeto desta entrega.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta entrega.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto desta entrega (o `pronto` do E6.1 já a cobriu).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 8 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 5 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 3 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): pareceres desatualizados só pela entrada da develop na branch (gh pr update-branch) se revalidam por delta (`forge-check delta`), pelo autor de cada um, review primeiro.
- Não ler nem editar o `.env`; não rodar a suíte local (a CI do PR roda).
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook ou check vermelho: pare e relate a mensagem literal, sem rodar de novo o check vermelho.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-048e log --format=%H 85e41636a63548a0f251a14f6d373b083497a27d..HEAD` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048e diff --name-only 85e41636a63548a0f251a14f6d373b083497a27d HEAD` · espera: igual 'docs/reviews/048-dompurify.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048e ls-remote origin refs/heads/feature/048-dompurify` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048e rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048e status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o veredito e os achados, com o sha do commit; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
