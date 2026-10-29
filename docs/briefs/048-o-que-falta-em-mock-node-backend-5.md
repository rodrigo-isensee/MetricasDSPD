Agente destino: forge:node-backend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: feature/048-ajustes-back   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo

## Objetivo
Etapa E3.1 do pedido 048 (E3, ajustes em mock; cartões K-129, K-093 e a página de contrato da O23), na worktree `/home/rodrigoisensee/MetricasDSPD-048c`, branch `feature/048-ajustes-back`, a partir da develop 7c94348b9bdc12850f40bad00cd38669ba8cc0e5. Fecha três pendências de back que o recibo do dono pôs no 048.

## Ler
- `docs/reviews/025-front-do-011-lote2.md`, achado A2 (linha da tabela da T11 e a linha 97): a frase de picos da ficha da T11 não vem no DTO.
- O contrato `docs/contratos/metricas/T11.md` e a ficha da T11 (procure a frase de picos no front, `web/src/features/complementares/`, e na especificação de UX que o contrato cita).
- `docs/qa/bugs/SNO-005-primeira-consulta-apos-subir-a-api-passa-de-300-ms.md` (K-093): o bug está "fechado em d76947b (2026-10-15)", corrigido por 59dedb5 e 19c5cf9.
- `docs/contratos/metricas/README.md` e uma página vizinha (`O22.md` ou `O24.md`) como modelo; a O23 em `packages/metricas/src/businessmap/` e o seu teste `o23.test.ts`.

## Entregar
- (E3, E3.1) K-129: os meses de pico da T11 no DTO, calculados na biblioteca compartilhada e com teste que falha sem a mudança; mudança compatível do contrato da T11 (campo novo) com o snapshot e o `openapi.json` regerados. Se a ficha ou o contrato não definirem "mês de pico" de forma que dê para calcular sem inferir (quantos meses, empate, mínimo de itens, como trata o mês corrente parcial), não decida: pare essa parte e relate a pergunta ao dono, com as opções; as outras duas seguem.
- (E3, E3.1) K-093: confirme no código da develop se a correção do SNO-005 (aquecimento antes do `listen`, 59dedb5 e 19c5cf9) continua presente e coberta por teste. Presente: relate a evidência (arquivo:linha e teste) para o cartão fechar como já corrigido, sem código novo. Ausente ou sem teste: corrija e cubra com teste de unidade (sem medir desempenho com banco: o ambiente da máquina nova está bloqueado no K-141).
- (E3, E3.1) Página de contrato da O23: `docs/contratos/metricas/O23.md` no formato das vizinhas, a partir do código e dos testes da O23, e o índice do `README.md` atualizado; o que o código não responder fica marcado como lacuna na página, sem inferir regra de negócio.
- (E3, E3.1) Commits conforme a seção de commits do `docs/engineering/praticas.md`, um por cartão, com `git add` explícito por caminho; durante o trabalho só os testes e o typecheck do pacote alterado; `pnpm run pronto` uma vez, da raiz da worktree, antes do commit final, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin`. Push da branch com `git push origin feature/048-ajustes-back`.
- (E1, E2, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a4)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f60)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (9b97e9d)
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.5 (forge:tech-lead): worktrees e branches do E3 a partir da develop depois do PR #161: `/home/rodrigoisensee/MetricasDSPD-048c` com `feature/048-ajustes-back` (E3.1) e `/home/rodrigoisensee/MetricasDSPD-048d` com `feature/048-ajustes-front` (E3.2 e E3.3), com push das duas e `pnpm install --frozen-lockfile` em cada uma, sem testes (sem as dependências os desenvolvedores não rodam testes nem typecheck)." · etapa de outra delegação; já entregue (esta worktree)
- Mostrar a frase de picos na tela (é do front, depois do contrato); mudar outras métricas; ligar a integração com dados reais; o quadro e o arquivo do pedido; outras worktrees; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa; nada desta entrega lê ou expõe dado de pessoa.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta etapa (é do E3.3).
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): a A1 (p95 abaixo de 300 ms) é a referência do K-093.
- CLAUDE.md, regras invioláveis: todo cálculo de tempo e percentil passa pela biblioteca compartilhada; abaixo de 20 itens, não publicar estatística; BusinessMap e Acelerato nunca se misturam; dúvida de regra de negócio vira pergunta ao dono, nunca decisão no código.
- DECISÃO TÉCNICA do Jarvis (2026-10-29 05:45, Histórico do pedido): o E3 sai em duas branches; esta é a do back (E3.1), a do front é `feature/048-ajustes-front`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-048c log --format=%H origin/develop..HEAD` · espera: linhas>=1, um commit por cartão entregue
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048c ls-remote origin refs/heads/feature/048-ajustes-back` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048c rev-parse HEAD`
- PQ-3 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto`, rodado na raiz de `/home/rodrigoisensee/MetricasDSPD-048c` antes do commit final · espera: rc=0
- PQ-4 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048c/docs/contratos/metricas/O23.md`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048c status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que saiu de cada cartão (K-129 entregue ou pergunta ao dono com as opções; K-093 já corrigido com a evidência ou corrigido; O23), mudanças de contrato; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
