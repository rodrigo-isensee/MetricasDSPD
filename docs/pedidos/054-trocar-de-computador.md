# Pedido 054: salvar o trabalho para trocar de computador

- **Modo:** implementar
- **Objetivo:** "um pedido salve todo o trabalho. salve o banco em um script e salve como continuar o trabalho eu vou precisar trocar de computador" (dono, 2026-10-30 09:48)
- **Clareza:** 4 confirmado; 0 suposições; 0 perguntas
- **Depende de:** nenhum

## Escopo
- E1. Todo trabalho local enviado ao GitHub: documentos do Jarvis (quadro, pedidos, briefs, conferências e pareceres soltos) na branch `docs/jarvis-2026-10-23`; o parecer solto da worktree 048b; o código do script de diagnóstico (052, worktree 052b) quando o node-backend terminar · `confirmado`
- E2. Banco salvo num arquivo fora do repositório com o script que já existe (`scripts/db-backup.sh`, `docs/engineering/operacao-banco.md`), rodado pelo dono porque lê o `.env` · `confirmado` (leitura a)
- E3. Documento de retomada `docs/continuar-em-outro-computador.md`: instalação no computador novo, `.env` (levado à mão), restauração do banco e estado de cada pedido com o próximo passo · `confirmado`

## Etapas
- E1.1 (Jarvis): commit e push dos documentos do Jarvis e do E3 na `docs/jarvis-2026-10-23`.
- E1.2 (tech-lead): commit e push do `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` na `feature/048-usabilidade` (worktree 048b).
- E1.3 (node-backend): commit e push da E1.15 do 052 (já em curso).
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
