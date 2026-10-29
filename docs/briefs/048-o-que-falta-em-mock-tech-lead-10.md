Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 07f43b97b49b0244763b78ef21396b782e790b59
Etapa: merge-integracao

## Objetivo
Etapa E5.1 do pedido 048 (cartões K-112 e K-130), fecho da `docs/048-t14-desenho`: review revalidado (aae3901), segurança (f786c9c), QA revalidado com `pronto` verde (7ce15c3683383b5cd3ff8e5d67089990411a0211), revisão de UX da T14 (acbbe78, aprovada com ressalvas) e aprovação do arquiteto da mudança incompatível do contrato (9b97e9d), tudo commitado e no origin; a `develop` não andou desde o merge 230b4e9. Falta abrir o PR para a `develop`, mesclar e limpar. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, head 7ce15c3683383b5cd3ff8e5d67089990411a0211.

## Ler
- O seu parecer `docs/reviews/048-t14-desenho.md`, achados A4 (teto) e A5 (contrato incompatível).
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/ux/revisao-048-t14.md`, só o parecer e a lista de achados (para o corpo do PR).
- A saída de `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 048-o-que-falta-em-mock --ref docs/048-t14-desenho`, rodado na worktree.

## Entregar
- (E5.1) Antes do PR, `git fetch origin`: se a `origin/develop` andou além de 07f43b97b49b0244763b78ef21396b782e790b59, pare e relate (a branch precisaria de merge e de nova revalidação), sem abrir o PR.
- (E5.1, E1, E2) PR da `docs/048-t14-desenho` para a `develop` pelo `gh pr create` (título no padrão de commits citando K-112 e K-130). Corpo em arquivo gravado pela ferramenta Write e passado com `--body-file`: resumo (cadastro de membros em mock, API da T14 sem o agregado dedutível, tela da T14), as decisões do dono T14-M1 = B e Q-T14-12 = B, os pareceres (review, segurança, QA e UX, com os achados médios e baixos da UX no cartão K-177), a linha `teto: excedido, <linhas> linhas, <motivo>` com a sua conta e a sua exceção ao teto de 400 linhas (achado A4) e a linha `contrato: incompatível (aceito ...)` com a aprovação do arquiteto (9b97e9d) e o seu aceite (achado A5).
- (E5.1) Merge squash com `gh pr merge docs/048-t14-desenho --squash` (nome da branch, não o número), só com todos os checks verdes, sem `--admin` e sem `--delete-branch`; check pendente: espere com `gh pr checks docs/048-t14-desenho --watch`, sem re-executar nada. Check vermelho ou recusa do GitHub ou de hook: pare, não re-execute e relate a mensagem literal.
- (E5.1) Depois do merge, apague a worktree `/home/rodrigoisensee/MetricasDSPD-048a` (`git worktree remove`) e a branch local `docs/048-t14-desenho` (R-FLUXO, "Depois do merge"), rodando do repositório principal `/home/rodrigoisensee/MetricasDSPD` sem trocar a branch dele; a branch remota não (ação do dono).
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (9b97e9d, nesta branch)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152, na feature/048-usabilidade)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; na feature/048-usabilidade, em outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; a parte do E1.4 já entregue (acbbe78, nesta branch); o resto continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; nesta branch já entregue (7ce15c3683383b5cd3ff8e5d67089990411a0211); na feature/048-usabilidade, continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; já entregue (f786c9c24ff1432adc62a863552083c7688629a7)
- Mudar código, testes, contrato, gerados ou qualquer parecer; corrigir os achados da UX (K-177); a `feature/048-usabilidade` e a worktree 048b; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa; nenhum dado de pessoa no corpo do PR.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto deste PR.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto deste PR.
- Não rode a suíte nem o `pronto`: o `pronto` deste head saiu verde na revalidação do QA (7ce15c3683383b5cd3ff8e5d67089990411a0211); a bateria roda na CI do PR.
- NÃO tocar: o código, os testes, o contrato, os gerados, os pareceres, a branch do repositório principal, a `main`, o `.env`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 048-o-que-falta-em-mock --ref docs/048-t14-desenho`, rodado na worktree antes do PR · espera: rc=0
- PQ-2 (pr): `gh pr list --head docs/048-t14-desenho --state merged --json number` · espera: um PR mesclado, com o número no relatório
- PQ-3 (merge): `gh pr view docs/048-t14-desenho --json state,mergeCommit` mostra `MERGED`, e o sha do `mergeCommit` é ancestral de `origin/develop` depois de `git fetch origin` (`git merge-base --is-ancestor`, rc=0)
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD branch --list docs/048-t14-desenho` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list` · espera: rc=0 e a saída não contém '048a' (cite a saída)

## Relatório
Até 8 linhas, resultado real: a saída do `forge-check pr`, o número do PR, a conta do teto, o resultado dos checks e o sha do merge; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
