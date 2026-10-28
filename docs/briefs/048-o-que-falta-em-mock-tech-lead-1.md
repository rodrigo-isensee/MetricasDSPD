Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E5.0 do pedido 048 (cartões K-112 e K-074): criar as duas worktrees e branches de onde partem o desenho da T14 em mock (E1.1 e E1.2, architect e security, que não têm Bash) e a usabilidade (E4.1, react-frontend). Sem isso o pedido não começa.

## Ler
- `docs/engineering/praticas.md`, só a seção de branches e commits.

## Entregar
- (E5.0, E1) Worktree `/home/rodrigoisensee/MetricasDSPD-048a` com a branch nova `docs/048-t14-desenho`, a partir de `origin/develop` em 4137981e5333bee5b69f3c515b26c64d3a0b71c0, com push (upstream no origin), sem commit novo.
- (E5.0, E4) Worktree `/home/rodrigoisensee/MetricasDSPD-048b` com a branch nova `feature/048-usabilidade`, a partir do mesmo sha, com push (upstream no origin), sem commit novo.
- (E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Commit, PR, suíte de teste, `pnpm install` ou `pronto`; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Mude a seguencia, coloque a integração com dados reais por último": a integração com dados reais (BusinessMap e Acelerato, K-087, K-086, K-088, K-089) entra depois de todo o resto da lista do que falta, feito em mock.
- DECISÃO DO DONO (2026-10-28): recibo do 048 aceito ("Isso tudo entra menos os dados reais"): E1 a E4 entram (inclusive K-074 e K-075, com UX e protótipo); integração real fica fora, por último.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nada a decidir nesta etapa (o E1.1 a fecha).
- ADR 0021 (citada no pedido): cálculo do mock em web worker; nada a decidir nesta etapa (o E3.3 a trata).
- NÃO tocar: a `develop`, a `main`, as outras worktrees e branches, o `.env`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD` · espera: igual '4137981e5333bee5b69f3c515b26c64d3a0b71c0'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD` · espera: igual '4137981e5333bee5b69f3c515b26c64d3a0b71c0'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
