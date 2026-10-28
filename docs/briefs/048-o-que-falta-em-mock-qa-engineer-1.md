Agente destino: forge:qa-engineer
Pedido: 048-o-que-falta-em-mock
Tipo: qa
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: qa

## Objetivo
Etapa E5.2 do pedido 048 (cartões K-112 e K-130): parecer de QA da `docs/048-t14-desenho` (T14 em mock: cadastro de membros simulado, contrato em união por `oculto`, ordem dos ocultos pela Q-T14-12 = B), depois do code review (33b5eb9) e da segurança (aprovada, f786c9c24ff1432adc62a863552083c7688629a7). Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head f786c9c24ff1432adc62a863552083c7688629a7, já no origin. Inclui o que o Histórico do pedido deixou com o QA (2026-10-28 15:26): as âncoras de hash do mock e o `e2e/tests-api/tatico-011-lote2.spec.ts`, e o `pnpm run pronto` completo da branch. O review (33b5eb9) é anterior ao 3c9f6a4, que só aplicou os achados A1 a A3 do próprio review (comentário de `t14.ts` e texto de `docs/api/metricas.md`, sem código executável); o `forge-check` o acusa como desatualizado, e a revalidação dele sai depois deste QA, com o PR (E5.1), para cobrir também os seus commits.

## Ler
- `docs/api/metricas.md`, o bloco T14 (por volta das linhas 268 a 290).
- `docs/reviews/048-t14-desenho.md` e `docs/security/048-t14-desenho.md`, só os blocos `## Achados`.
- `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --stat 4137981e5333bee5b69f3c515b26c64d3a0b71c0 f786c9c24ff1432adc62a863552083c7688629a7`.
- As âncoras: `web/src/data/mock/nucleoMock.paridade.test.ts:169` e `packages/mock/src/extensaoTambem.test.ts:34` (ambas ainda em `9159f65b`).

## Entregar
- (E5.2, E1, E2) Atualizar as duas âncoras de hash da extensão do mock (`web/src/data/mock/nucleoMock.paridade.test.ts:169` e `packages/mock/src/extensaoTambem.test.ts:34`) para o hash que o mock da branch gera, conferindo no relatório que a mudança do hash vem só da T14 (cadastro de membros e união por `oculto`).
- (E5.2, E1, E2) Adaptar `e2e/tests-api/tatico-011-lote2.spec.ts` ao contrato novo da T14 (união por `oculto`, `outrosTimes` inteiro na linha visível, ocultos depois dos visíveis por código do projeto, total só dos visíveis), com casos que provem: nenhum campo de pessoa na resposta, nenhum número de pessoas, e a ordem da Q-T14-12 = B.
- (E5.2) `pnpm run pronto` completo uma vez, da raiz da worktree, antes do commit final (passa pela trava de suíte única do `scripts/suite-unica.sh`).
- (E5.2, E1, E2) Parecer em `docs/qa/048-t14-desenho.md`, pela ferramenta Write, no formato que o `forge-check pr` lê (frontmatter com `pedido: 048-o-que-falta-em-mock`, `commit:` com o sha do head testado e veredito; achados no bloco `## Achados`, com arquivo:linha e até 300 caracteres cada), com o resultado real do pronto e dos testes.
- (E5.2) Commits no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-130`, `git add` explícito por caminho (as duas âncoras, o spec e o parecer); push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; o code review já foi entregue (33b5eb99862aa876ed565237ba46cccb29a23bbc); a revalidação do review, o PR e o merge continuam no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; já entregue (f786c9c24ff1432adc62a863552083c7688629a7)
- Mudar o código de produção (`packages/*/src` fora de testes, `server/`, `web/src` fora de testes); defeito vira achado no parecer, sem correção aqui. A revalidação do review; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 2 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- ADR 0020 (citada no pedido), na revisão 2 da branch (`/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, linha 51), item 9, T14: "outros times" fica **oculto** quando somar **menos de 2 pessoas**; pela Q-T14-10 = B, "pessoas = membros de um cadastro por time, na configuração"; a contagem "sai dele só como booleano por `(projeto, equipe, granularidade)`; a API nunca recebe o número de pessoas. Na fase 2 (mock), a extensão gera o booleano direto (item 8)".
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): a arquitetura do worker não é objeto deste QA.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto deste QA.
- Outra instância do react-frontend trabalha na worktree 048b: não tocar nela.
- NÃO tocar: o código de produção, os pareceres de review e de segurança, a `main`, o `.env`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha. Parecer se escreve só pela ferramenta Write ou Edit.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -l '9159f65b' /home/rodrigoisensee/MetricasDSPD-048a/web/src/data/mock/nucleoMock.paridade.test.ts /home/rodrigoisensee/MetricasDSPD-048a/packages/mock/src/extensaoTambem.test.ts` · espera: linhas=0
- PQ-2 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a run pronto` · espera: rc=0
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048a/docs/qa/048-t14-desenho.md`
- PQ-4 (cmd): `grep -c '^pedido: 048-o-que-falta-em-mock' /home/rodrigoisensee/MetricasDSPD-048a/docs/qa/048-t14-desenho.md` · espera: igual '1'
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o veredito, o hash novo das âncoras e de onde vem a mudança, os casos novos do spec, o resultado do pronto (testes e cobertura), os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
