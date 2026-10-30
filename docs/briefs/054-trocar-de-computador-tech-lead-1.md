Agente destino: forge:tech-lead
Pedido: docs/pedidos/054-trocar-de-computador.md
Tipo: codigo
Branch: feature/048-usabilidade   Base: develop   Base-sha: 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5
Etapa: codigo   Cobre: E1.2

## Objetivo
O dono vai trocar de computador e pediu para salvar todo o trabalho no GitHub (pedido 054). Na worktree `/home/rodrigoisensee/MetricasDSPD-048b` (branch `feature/048-usabilidade`) há um único arquivo fora do git, o parecer de UX do CA-B; ele precisa ir para o origin. Sem PR e sem merge.

## Ler
- Seção de commits do `docs/engineering/praticas.md` (só ela).
- `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` (deve listar só `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md`; se listar outra coisa, pare e relate sem commitar).

## Entregar
- "E1.2 (tech-lead): commit e push do `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` na `feature/048-usabilidade` (worktree 048b)." (E1.2)
- (E1.2) `git add` só desse caminho; commit no padrão do `praticas.md` (tipo `docs(ux)`), com `Cartão: K-074` no corpo; o conteúdo do arquivo não muda.
- (E1.2) Antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-048b branch --show-current` deve dar `feature/048-usabilidade`; push com `git -C /home/rodrigoisensee/MetricasDSPD-048b push origin HEAD:refs/heads/feature/048-usabilidade`, sem `--force`.
- (E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (Jarvis): commit e push dos documentos do Jarvis e do E3 na `docs/jarvis-2026-10-23`." · etapa de outra delegação; feita pelo Jarvis em paralelo
- "E1.3 (node-backend): commit e push da E1.15 do 052 (já em curso)." · etapa de outra delegação; em curso
- "E2.1 (dono): rodar o backup com a pasta de destino fora do repositório e levar a pasta." · etapa de outra delegação; do dono
- Editar o parecer; testes ou `pronto` (o commit só acrescenta um documento); PR, merge, outras worktrees, o quadro e o pedido.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "A" (recibo do 054 aceito; banco pela leitura a: gerar o arquivo com o `scripts/db-backup.sh` que já existe, sem script novo).
- O parecer espera a decisão do dono sobre o CA-B (pergunta do 048 ainda na fila); o commit só preserva o texto, não decide nada.
- O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b log -1 --name-only --format=%B` · espera: contém '06-parecer-ca-b.md'

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência (sha); riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
