Agente destino: forge:node-backend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Volta do E1.3 do pedido 048 (cartões K-112 e K-130) com os achados recomendados A1 a A3 do code review (E5.1): a decisão Q-T14-12 = B ainda aparece como suposição no comentário do código e no contrato, e o contrato ainda diz que `outrosTimes` é anulável. Corrigir antes do QA e do PR. Esta volta já foi entregue em 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d, sob o brief node-backend-3, cuja aprovação caducou quando o pedido passou a citar a ADR 0003; este brief reaprova o mesmo trabalho só para conferir essa entrega e não gera nova delegação nem novo commit. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, base da volta 259be9255dc651496772cc22d8b3fede49b99c8d; a entrega 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d está no origin, e o head atual é f786c9c24ff1432adc62a863552083c7688629a7 (só o parecer de segurança, feito depois).

## Ler
- `docs/reviews/048-t14-desenho.md`, só o bloco `## Achados` (A1 a A3).
- `packages/metricas/src/businessmap/t14.ts`, linhas 110 a 130.
- `docs/api/metricas.md`, o bloco T14 (linhas 268 a 280) e a linha "Desvios do plano" (por volta da 288).

## Entregar
- (E1.3, E1, E2) A1: em `packages/metricas/src/businessmap/t14.ts:121`, trocar "suposição até a resposta do dono" pela decisão: "Q-T14-12 = B, decidida pelo usuário (2026-10-28)".
- (E1.3, E1, E2) A2: em `docs/api/metricas.md`, a ordem dos ocultos (linha 273) passa de suposição para decidida (Q-T14-12 = B, 2026-10-28), e a Q-T14-12 sai da lista de pendências (linha 278).
- (E1.3, E1, E2) A3: em `docs/api/metricas.md`, a linha "Desvios do plano" (por volta da 288) deixa de dizer que a T14 tem `outrosTimes` anulável: o contrato é a união por `oculto`, com `outrosTimes` inteiro na linha visível.
- (E1.3) Já feito em 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d: um commit só, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-130`, `git add packages/metricas/src/businessmap/t14.ts docs/api/metricas.md`; push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (4 arquivos na worktree 048b, commitados pelo E4.1)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido (outra instância, worktree 048b)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; o review da docs/048-t14-desenho já entregue (33b5eb99862aa876ed565237ba46cccb29a23bbc); PR e merge continuam no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; parecer entregue (259be9255dc651496772cc22d8b3fede49b99c8d), com volta em curso (security-engineer-3)
- O achado A4 do review (linha de teto no corpo do PR): é do PR (E5.1), não desta volta. Os recomendados A1 e A2 do parecer de segurança: são da fase 3 (integração real), fora do pedido.
- O PR e o merge da `docs/048-t14-desenho`; o review e a revisão de segurança da `feature/048-usabilidade` (worktree 048b).
- Atualizar âncoras de hash do mock, rodar a suíte, a E2E ou o `pronto`; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto desta volta.
- ADR 0020 (citada no pedido), na revisão 2 da branch (`/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, linha 51; a cópia da develop ainda traz a leitura antiga), item 9, T14: "outros times" fica **oculto** quando somar **menos de 2 pessoas**; pela Q-T14-10 = B, "pessoas = membros de um cadastro por time, na configuração"; a contagem "sai dele só como booleano por `(projeto, equipe, granularidade)`; a API nunca recebe o número de pessoas. Na fase 2 (mock), a extensão gera o booleano direto (item 8)".
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): a arquitetura do worker não muda nesta volta.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística. Pela Q-T14-6 = A (acima), "outros times" sai sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o E1.4 entra na mesma branch do E1.3; as âncoras de hash do mock e o spec e2e de API ficam com o QA (E5.2), e o `pnpm run pronto` completo da branch sai uma vez, na entrega do QA.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.
- Outra instância do react-frontend roda testes na worktree 048b: aqui só o typecheck do pacote `@metricas-dspd/metricas` (a mudança é de comentário e de documentação, sem código); a suíte e o `pnpm run pronto` completo saem uma vez, no QA (E5.2).
- NÃO tocar: o código executável, os testes, as âncoras de hash do mock, os pareceres em `docs/reviews/` e `docs/security/`; o `.env`, a `main`, as outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -c 'suposição até a resposta do dono' /home/rodrigoisensee/MetricasDSPD-048a/packages/metricas/src/businessmap/t14.ts` · espera: igual '0'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only 259be9255dc651496772cc22d8b3fede49b99c8d 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d` · espera: linhas=2
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a --filter @metricas-dspd/metricas run typecheck` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a branch -r --contains 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d` contém 'origin/docs/048-t14-desenho'
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que mudou em cada achado (arquivo:linha), as mudanças de contrato (nenhuma esperada: só texto), o sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
