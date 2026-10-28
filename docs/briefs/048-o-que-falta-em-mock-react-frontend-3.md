Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E1.4 do pedido 048 (cartão K-112, K-130): o E1.3 mudou o contrato da T14 (cada projeto virou uma união por `oculto`, sem o agregado dedutível), e o front ainda lê o formato antigo: `web/src/features/complementares/taticas.tsx` quebra o typecheck (36 erros) e o lint (9 erros). Adapte a tela da T14 ao contrato novo, como o desenho do E1.1 pede. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head 0ea4c01416d0c2c16708c79148b785b08ad8dcea, já no origin (sem upstream local: push com `git push origin docs/048-t14-desenho`).

## Ler
- `docs/architecture/features/048-t14-mock.md`, só a seção 2 e a linha E1.4 da tabela da seção 3.
- `packages/contratos/src/tambem.ts`, só o `projetoT14Schema` e o resultado da T14.
- `docs/api/metricas.md`, só a seção da T14.
- `web/src/features/complementares/taticas.tsx` e o mock do front que alimenta a T14.
- `docs/engineering/praticas.md`, só a seção de commits.

## Entregar
- (E1.4, E1) `taticas.tsx` lê a união por `oculto`: a linha oculta mostra só "Meu time: k demanda(s)/frente(s)", sem "Sem time informado"; o bloco mostra o total só dos visíveis, com a nota "não inclui projetos com outros times ocultos"; a ordem é a do servidor (visíveis e depois ocultos por código, Q-T14-12 = B); o mock do front segue o mesmo contrato.
- (E1.4) Testes unitários da tela em `web/` cobrindo a linha visível, a linha oculta, o total só dos visíveis e a ordem; typecheck, lint e testes de `web/` verdes.
- (E1.4) Commit no padrão de commits do `praticas.md`, com `Cartão: K-112`, `git add` explícito por caminho; push com `git push origin docs/048-t14-desenho`, sem PR.
- (E2, E3, E4) Nada a entregar aqui: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; entregue (0ea4c01416d0c2c16708c79148b785b08ad8dcea; pronto pendente do E1.4 e do E5.2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido (outra instância, worktree 048b)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- `e2e/tests-api/tatico-011-lote2.spec.ts` e as âncoras de hash do mock (`packages/mock/src/extensaoTambemFase2.test.ts`, `packages/mock/src/extensaoTambem.test.ts`): ficam com o QA (E5.2), que faz o commit final da branch. O back-end, `packages/contratos` e `packages/metricas`; a revisão de UX do texto do estado oculto (E4.3); o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nenhum campo novo de pessoa chega à tela (o contrato é `strict` e não tem `membroRef`).
- ADR 0021 (citada no pedido): cálculo do mock em web worker; o mock da T14 roda no worker e segue o contrato; não mude a arquitetura do worker.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o E1.4 entra na mesma branch do E1.3; as âncoras do mock e o spec e2e de API ficam com o QA (E5.2).
- Leitura da opção A de 2026-10-21 nesta branch (Histórico do pedido, 2026-10-28): o commit do E1.4 não é o commit final da branch; o final é o do QA (E5.2), e o `pnpm run pronto` completo roda uma vez, antes dele. Aqui, como a opção A manda durante o desenvolvimento, só typecheck, lint e testes do pacote alterado (`web/`).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística; a T14 não mostra nome, tempo, vazão nem ranking de outros times (Q-T14-6 = A).
- Outra instância do react-frontend trabalha na worktree 048b; a trava de suíte única está na develop, mas não nesta branch: rode só os testes de `web/` e nenhuma suíte completa.
- NÃO tocar: `server/`, `packages/`, `docs/`, `e2e/`, o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only 0ea4c01416d0c2c16708c79148b785b08ad8dcea HEAD -- server packages docs e2e` · espera: linhas=0
- PQ-2 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a/web run typecheck` · espera: rc=0
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a exec eslint web` · espera: rc=0
- PQ-4 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a/web run test` · espera: rc=0
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que mudou na tela da T14, os testes novos e o resultado de typecheck, lint e testes de `web/`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
