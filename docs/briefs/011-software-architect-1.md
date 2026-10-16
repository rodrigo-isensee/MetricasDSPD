## Objetivo
Levar a decisão R-1 = B do usuário (2026-10-16) e as demais de 2026-10-16 para a ADR 0020 e o plano do 011, para destravar o E8 e a T14 no back (E2). Cartão K-104. Diretório principal `/home/rodrigoisensee/MetricasDSPD`, branch `develop` (só escrita de arquivos; o commit é do tech-lead no PR de docs).

## Ler
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: as linhas de 2026-10-16 em "Decisões do usuário" (R-1 = B, R-2 = B, O20-destaque = A, O19-pct = B, O25(b) = B, T10 = A, Q-a, Q-b, Q-E7-1) e "Retomada 2026-10-17".
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`: cabeçalho ("Em aberto com o usuário"), o trecho "Não resolvido aqui" e a "Decisão do usuário pendente".
- `docs/architecture/features/metricas-tambem-disponiveis.md`: §2 E8, T14, O19, O20, O25 e O26; §4; a lista de `pendencias` em `REGRAS_METRICA`; §7 e §8.
- `docs/security/adr-0020-protecao-de-pessoa.md`: só a R-1 e a R-2.

## Entregar
- (E3) ADR 0020: R-1 = B e R-2 = B como decididas, com data, no lugar de "em aberto"; o efeito sobre E7 × E8 (o E8 sem nomes de sistema fecha a inferência).
- (E3) Plano: §2 E8 (só a contagem de sistemas com 1 pessoa, sem nomes), §2 T14 ("outros times" oculto quando somar menos de 2 pessoas; mostra só "meu time: k de n"), §2 O19 (percentual sobre dias úteis bloqueados; mínimo de 20 sobre bloqueios), O20 (destaque só a partir do compromisso), O25(b), O26 (Q-a e Q-b decididas), §4 e a lista de pendências de `REGRAS_METRICA` sem as que o usuário já decidiu.
- Fora do escopo, outros itens do pedido 011 (etapas de outros papéis, citadas de "### Etapas"): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.2 (forge:ux-designer): CAs na especificação."; "E4.1 (forge:react-frontend): front, depois do K-102."
- Fora do escopo: commit e PR (pedido 012, "E3.1 (forge:tech-lead): PR de docs da retomada.").

## Decisões e restrições
- Decisões do usuário de 2026-10-16 (pedido 011, "Decisões do usuário"): R-1 = B (o E8 mostra só a contagem de sistemas com 1 pessoa, sem nomear os sistemas; na T14, "outros times" oculto quando somar menos de 2 pessoas); R-2 = B (`fato_transicao.usuario` desativada; já mesclado no #88); O20-destaque = A; O19-pct = B; O25(b) = B; T10 = A; Q-a = 1 passagem; Q-b = conta; Q-E7-1 = pró-rata por dias corridos.
- ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`) segue vigente para a fase 2; esta entrega só registra as decisões nela, sem mudar a decisão de arquitetura.
- As decisões vêm do pedido 011; não reabra nenhuma. Se um documento contradisser uma decisão, registre a contradição no relatório.
- NÃO tocar: código, em `docs/security/`, nem em outros arquivos de `docs/devops`. Não faça commit.

## Pronto quando
- PQ-1 (cmd): `grep -n -F "Em aberto com o usuário: **R-1**" docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` · espera: linhas=0
- PQ-2 (cmd): `grep -n -i -F 'lista "1 pessoa"' docs/architecture/features/metricas-tambem-disponiveis.md` · espera: linhas=0
- PQ-3 (cmd): `grep -n -E "R-1 = B|R-2 = B" docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` · espera: linhas>=2
- PQ-4 (cmd): `grep -n -F "meu time: k de n" docs/architecture/features/metricas-tambem-disponiveis.md` · espera: linhas>=1
- PQ-5 (cmd): `grep -n -i "dias úteis bloqueados" docs/architecture/features/metricas-tambem-disponiveis.md` · espera: linhas>=1

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos; mudanças de contrato que o node-backend precisa saber. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
