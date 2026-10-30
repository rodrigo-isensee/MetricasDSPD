Agente destino: forge:tech-lead
Pedido: 054-trocar-de-computador
Tipo: codigo
Branch: feature/052-ws1-estrutura   Base: develop   Base-sha: 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5
Etapa: codigo   Cobre: E4.1

## Objetivo
Instalar as dependências na worktree do 052 recriada no computador novo, para a conferência da E1.3 (E1.15 do 052) rodar o `pnpm run pronto` e o 052 seguir (pedido 054, E4). Worktree `/home/rodrigoisensee/MetricasDSPD-052b`, branch `feature/052-ws1-estrutura`, head 27d32b26f346fdfd56d1ab45c5e38579d7c1018a.

## Ler
- Nada além deste brief.

## Entregar
- "E4.1 (tech-lead): `pnpm install --frozen-lockfile` na worktree `/home/rodrigoisensee/MetricasDSPD-052b` (já recriada pelo Jarvis com `git worktree add`, head 27d32b2), sem commit e sem testes." (E4.1)
- (E4.1) Rode `pnpm -C /home/rodrigoisensee/MetricasDSPD-052b install --frozen-lockfile`; se o lockfile recusar, pare e relate a mensagem literal, sem atualizar o lockfile.

## Fora do escopo
- "E1.1 (Jarvis): commit e push dos documentos do Jarvis e do documento de retomada na `docs/jarvis-2026-10-23`." · etapa de outra delegação; feita
- "E1.2 (tech-lead): commit e push do `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` na `feature/048-usabilidade` (worktree 048b)." · etapa de outra delegação; feita (afb51c7)
- "E1.3 (node-backend): commit e push da E1.15 do 052 (já em curso)." · etapa de outra delegação; feita (27d32b2), conferência com o Jarvis
- "E3.1 (Jarvis): escrever `docs/continuar-em-outro-computador.md`." · etapa de outra delegação; feita (8012cf8)
- "E2.1 (dono): rodar o backup com a pasta de destino fora do repositório e levar a pasta." · etapa de outra delegação; do dono
- Rodar testes ou o `pronto`; commit, push ou PR; editar arquivo versionado; ler ou editar o `.env`; tocar outras worktrees; o quadro e o arquivo do pedido.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "A" (recibo do 054 aceito; banco pela leitura a: gerar o arquivo com o `scripts/db-backup.sh` que já existe, sem script novo).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): E4 (retomada no computador novo) entra como `técnico`, pela base do E3 ("o time recria a que precisar").
- Ambiente: node 24 e pnpm 10 do nvm em `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin`, já no PATH.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-052b/node_modules/.pnpm` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052b rev-parse HEAD` · espera: igual '27d32b26f346fdfd56d1ab45c5e38579d7c1018a'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
