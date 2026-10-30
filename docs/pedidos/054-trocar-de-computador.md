# Pedido 054: salvar o trabalho para trocar de computador

- **Modo:** implementar
- **Objetivo:** "um pedido salve todo o trabalho. salve o banco em um script e salve como continuar o trabalho eu vou precisar trocar de computador" (dono, 2026-10-30 09:48)
- **Clareza:** 4 confirmado; 0 suposições; 0 perguntas
- **Depende de:** nenhum

## Escopo
- E1. Todo trabalho local enviado ao GitHub: documentos do Jarvis (quadro, pedidos, briefs, conferências e pareceres soltos) na branch `docs/jarvis-2026-10-23`; o parecer solto da worktree 048b; o código do script de diagnóstico (052, worktree 052b) quando o node-backend terminar · `confirmado`
- E2. Banco salvo num arquivo fora do repositório com o script que já existe (`scripts/db-backup.sh`, `docs/engineering/operacao-banco.md`), rodado pelo dono porque lê o `.env` · `confirmado` (leitura a)
- E4. Retomada no computador novo (UNI-CTSVX54, repositório em `/home/rodrigoisensee/Metricas/MetricasDSPD`): worktree 052b recriada no mesmo caminho do brief da E1.15 e dependências instaladas, para conferir a E1.3 e seguir o 052 · `técnico` (E3: "o time recria a que precisar")
- E3. Documento de retomada `docs/continuar-em-outro-computador.md`: instalação no computador novo, `.env` (levado à mão), restauração do banco e estado de cada pedido com o próximo passo · `confirmado`

## Etapas
- E1.1 (Jarvis): commit e push dos documentos do Jarvis e do documento de retomada na `docs/jarvis-2026-10-23`.
- E1.2 (tech-lead): commit e push do `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` na `feature/048-usabilidade` (worktree 048b).
- E1.3 (node-backend): commit e push da E1.15 do 052 (já em curso).
- E3.1 (Jarvis): escrever `docs/continuar-em-outro-computador.md`.
- E4.1 (tech-lead): `pnpm install --frozen-lockfile` na worktree `/home/rodrigoisensee/MetricasDSPD-052b` (já recriada pelo Jarvis com `git worktree add`, head 27d32b2), sem commit e sem testes.
- E2.1 (dono): rodar o backup com a pasta de destino fora do repositório e levar a pasta.

## Fora do escopo
- Ler, copiar ou enviar o `.env` (o dono leva à mão) · `confirmado` (regra do projeto: credenciais só no `.env`)
- O arquivo do banco no GitHub (pode ter dado de pessoa; `operacao-banco.md`) · `técnico`
- Merge, PR ou a `main` · `técnico`

DECISÃO DO DONO (2026-10-30): "A" (recibo do 054 aceito; banco pela leitura a: gerar o arquivo com o `scripts/db-backup.sh` que já existe, sem script novo).

## Histórico
- 2026-10-30 09:48: pedido aberto; recibo enviado ao dono.
- 2026-10-30 09:53: dono respondeu "A" ao recibo; pedido em execução.
- 2026-10-30 09:55: brief tech-lead-1 (E1.2) aprovado na rodada 1; delegado ao tech-lead.
- 2026-10-30 09:56: E1.2 entregue pelo tech-lead (afb51c7 no origin, feature/048-usabilidade); E1.3 entregue pelo node-backend (27d32b2 no origin, feature/052-ws1-estrutura); E3 escrito em docs/continuar-em-outro-computador.md. Conferência das entregas fica para a retomada.
- 2026-10-30 11:20: retomada no computador UNI-CTSVX54. Branch docs/jarvis-2026-10-23 alinhada ao origin (2 commits locais de 2026-10-24 guardados em backup/jarvis-local-2026-10-24). Worktree 052b recriada pelo Jarvis em /home/rodrigoisensee/MetricasDSPD-052b (27d32b2); o hook barra o pnpm install ao Jarvis: aberta a E4 (`técnico`) com a E4.1 para o tech-lead. ESCOPO+: E4 (retomada), técnico, pela base do E3.
- 2026-10-30 11:22: texto da E1.1 ajustado ("do E3" por "do documento de retomada", mesmo sentido) e E3.1 registrada como feita (8012cf8), para o forge-check casar as etapas. Brief tech-lead-2 (E4.1) aprovado no forge-check.
- 2026-10-30 11:23: brief tech-lead-2 (E4.1) aprovado pelo conferente na rodada 1; delegado ao tech-lead.
- 2026-10-30 11:25: E4.1 entregue pelo tech-lead (install rc=0, sem arquivo versionado alterado, head 27d32b2); conferido pelo Jarvis (PQ-1 a PQ-3). Sem commit, sem conferência de entrega (R-PROVA).
- 2026-10-30 11:27: horas das três linhas anteriores corrigidas pelo Jarvis (tinham sido estimadas; valem a do registro da conferência, 11:23, e a do commit a974eac, 11:25).
