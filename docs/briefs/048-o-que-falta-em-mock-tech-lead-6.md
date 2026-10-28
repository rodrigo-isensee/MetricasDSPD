Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E5.1 do pedido 048 (cartão K-074), só a parte de code review da branch `feature/048-usabilidade`: o protótipo do E4.0 e a usabilidade U1 a U5 com o P2 (E4.1), já entregues; a volta do E4.1 (2916b052a20801ed55ce3e2cc4fb00467db8c8a4) completou o P2. Review antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, head 2916b052a20801ed55ce3e2cc4fb00467db8c8a4, já no origin. O Histórico do pedido (decisão técnica depois da conferência do 2916b05) aceitou o ajuste de 1 linha em `e2e/tests/integracao-real.spec.ts` e deixou os desvios do E4.0 (44 px, foco no botão Métricas, rótulo "Restaurar") para a revisão de UX (E4.3).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-048b log --oneline 4137981e5333bee5b69f3c515b26c64d3a0b71c0..2916b052a20801ed55ce3e2cc4fb00467db8c8a4` e `git -C /home/rodrigoisensee/MetricasDSPD-048b diff 4137981e5333bee5b69f3c515b26c64d3a0b71c0 2916b052a20801ed55ce3e2cc4fb00467db8c8a4`, por arquivo.
- `docs/ux/revisao-geral-usabilidade/04-decisoes.md` (decisões U1 a U5) e `docs/ux/revisao-geral-usabilidade/02-propostas.md`, seção 3 (opção B do P2) e seção 6.
- `docs/architecture/adr/0003-orcamento-de-performance.md`, só a Decisão (orçamento de CLS e de bundle).
- `docs/engineering/praticas.md`, só as seções 5 (acessibilidade e performance), 8 (code review) e 9 (commits).

## Entregar
- (E5.1, E4) Code review da `feature/048-usabilidade` de 4137981e5333bee5b69f3c515b26c64d3a0b71c0 a 2916b052a20801ed55ce3e2cc4fb00467db8c8a4 (R-REVIEW): U1 a U5 contra `04-decisoes.md`, o P2 (barra única e "Detalhes da coleta" em popover) contra a opção B do `02-propostas.md`, nenhum aviso obrigatório atrás de clique, acessibilidade (foco, rótulos, `aria-live`, diálogo modal), preferências só no navegador e sem dado de pessoa, nenhuma métrica individual nem comparação entre times, testes que cobrem cada regra e o risco de CLS e de bundle frente à ADR 0003. Parecer em `docs/reviews/048-usabilidade.md`, no formato que o `forge-check pr` lê (frontmatter com `pedido: 048-o-que-falta-em-mock`, `commit: 2916b052a20801ed55ce3e2cc4fb00467db8c8a4` e veredito; achados no bloco `## Achados`, com arquivo:linha e até 300 caracteres cada), escrito pela ferramenta Write.
- (E5.1) Commit só do parecer, no padrão de commits do `praticas.md`, com `Cartão: K-074` e `git add docs/reviews/048-usabilidade.md`; push com `git push origin feature/048-usabilidade`, sem `--force` e sem PR.
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
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; já entregue (2916b052a20801ed55ce3e2cc4fb00467db8c8a4)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; não se aplica a esta branch (sem gatilho de segurança, Histórico do pedido)
- O PR, a conta do teto de 400 linhas (cerca de 2.200 linhas na branch) e a integração da `feature/048-usabilidade` na develop (E5.1, depois do QA); a decisão final sobre os desvios do E4.0 (E4.3); a medição de CLS (QA); o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 4 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): o review aponta o risco de CLS e de bundle das mudanças; a medição é do QA.
- ADR 0020 (citada no pedido): proteção de pessoa; nesta branch, nenhum dado de pessoa entra em preferência, link copiado ou exportação.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): a arquitetura do worker não é objeto deste review.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- O QA roda o `pronto` na worktree 048a e o tech-lead na 047c: neste review não rode a suíte, o `pronto` nem testes; o review é por leitura do diff, e a suíte roda no QA, uma por vez.
- NÃO tocar: o código, os testes e a documentação da branch (achado vira linha no parecer, não correção); o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. Parecer se escreve só pela ferramenta Write ou Edit.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 2916b052a20801ed55ce3e2cc4fb00467db8c8a4' /home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 2916b052a20801ed55ce3e2cc4fb00467db8c8a4 HEAD` · espera: igual 'docs/reviews/048-usabilidade.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito, achados bloqueantes (arquivo:linha) e recomendados, e o sha do commit do parecer; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
