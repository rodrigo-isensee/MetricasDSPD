Agente destino: forge:software-architect
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E1.6 do pedido 048 (cartões K-112 e K-130): a API da T14 mudou de forma incompatível (cada item de `projetos` virou união por `oculto`; o oculto perdeu `total`, `outrosTimes` deixou de ser anulável), conforme o seu desenho em `docs/architecture/features/048-t14-mock.md` (seção "2. K-130: o que a API da T14 deixa de enviar"). A `docs/contratos/politica-de-mudanca.md` §5 exige a aprovação do `software-architect` e do `tech-lead` para mudança incompatível; o tech-lead já aprovou no review (commit 45ca21850a5bc7b516b7c5875368e4a5ed847400), mas a sua aprovação não está registrada no disco, e o conferente barrou a etapa. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md`, seção 2 (o contrato novo do bloco e a ordem).
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/contratos/politica-de-mudanca.md`, a parte de mudança incompatível (o fluxo de aceite) e o §5.
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/contratos/metricas/T14.md` (o contrato gerado que vai ao PR).
- `/home/rodrigoisensee/MetricasDSPD-048a/docs/reviews/048-t14-desenho.md`, só a seção `## Revalidação` (o aceite do tech-lead).

## Entregar
- (E1.6, E2) Confira que o contrato gerado `docs/contratos/metricas/T14.md` é o que o seu desenho pediu (união por `oculto`, sem `total` no oculto, `outrosTimes` não anulável, `strict`; `outrosTimes` é só a contagem agregada de itens de outros times, publicada sem nome, sem tempo, sem vazão e sem ranking pela Q-T14-6 = A, e o contrato não traz identificação de outra equipe nem número de pessoas, como diz o desenho em `048-t14-mock.md` linha 46) e, se for, acrescente pela ferramenta Edit ao fim de `/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md` uma seção `## Aprovação da mudança incompatível do contrato (politica-de-mudanca.md §5)` com: a data (2026-10-28), o contrato (`resultados/T14`), o que muda, a sua aprovação como `software-architect`, a referência ao aceite do `tech-lead` no review, a ausência de consumidor publicado (prazo de convivência não se aplica; se você entender que se aplica, isso é decisão do usuário e vira pergunta no relatório) e se alguma ADR muda (a ADR 0020 não muda). Se o contrato gerado divergir do desenho, não aprove: relate a divergência com arquivo:linha.
- (E1, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152, na feature/048-usabilidade)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; já entregue (2aac60225a5927f399b7ef12fe8833b786a022e8, na feature/048-usabilidade)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; a parte do E1.4 já entregue (docs/ux/revisao-048-t14.md, sem commit: entra no PR); o resto continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; o re-review já entregue (45ca21850a5bc7b516b7c5875368e4a5ed847400); o PR e o merge continuam no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; já entregue (f9c22a673bdfd4df7f0118a9c56a47395e677b2c nesta branch; na feature/048-usabilidade, em outra delegação)
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; já entregue (f786c9c24ff1432adc62a863552083c7688629a7)
- Commit e push (o tech-lead commita esta seção no PR, E5.1); mudar o contrato, o código, os testes, os gerados, a ADR ou os pareceres; a revisão de UX `docs/ux/revisao-048-t14.md`; a worktree 048b; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa; nenhum dado de pessoa no contrato da T14.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta aprovação.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto desta aprovação.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 18:06, Histórico deste pedido): o re-review do tech-lead foi aceito pelo mérito; a aprovação do arquiteto (E1.6) entra antes do PR, e o tech-lead a commita no E5.1.
- Regra de negócio aberta (inclusive prazo de convivência) vira pergunta ao dono no relatório, nunca decisão no texto.
- NÃO tocar: qualquer arquivo além de `docs/architecture/features/048-t14-mock.md`; a `main`; o `.env`; as outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -c '^## Aprovação da mudança incompatível' /home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain -- . ':!docs/ux/revisao-048-t14.md'` · espera: igual ' M docs/architecture/features/048-t14-mock.md'

## Relatório
Até 8 linhas, resultado real: aprovado ou divergência (arquivo:linha), o que a seção registra e as perguntas ao dono, se houver; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta (ou "não cumprido" e o motivo; sem Bash, cite a linha do arquivo e o Jarvis roda o comando). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
