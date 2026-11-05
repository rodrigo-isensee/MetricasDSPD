Agente destino: forge:node-backend
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: codigo   Cobre: E1.2

## Objetivo
Implementar no server a correção do S8 pelo desenho: sem_resposta e null como ausentes, versão de critério nova, testes e docs da API (pedido 066, E1.2, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch nova `feature/066-s8`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/066-desenho.md` (o desenho inteiro).

## Entregar
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." (E1.2)
- (E1) (E1.2) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --short` vazio; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin develop`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 switch -c feature/066-s8 origin/develop --no-track`; copiar o desenho para `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/analises/066-desenho.md` e commitá-lo; implementar a parte do server e da biblioteca conforme o desenho (adaptador extrasAC, versão de critério 066:S8-com-resposta, comentário em s8.ts, docs/api/metricas.md) com os testes listados nele (caso do M5, fronteiras de 19 e 20, ajustes em metricas-acelerato-f2 e painel-real-f6); `pnpm run docs:check` verde; vitest do server e dos pacotes com no máximo 2 workers; commits com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-217' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/066-s8` (se o pre-push barrar pelo web, pare e relate); sem PR.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 14:17: E1.1 cumprida pelo software-architect: desenho em docs/analises/066-desenho.md (sem commit): a biblioteca (packages/metricas/src/acelerato/s8.ts) já divide só pelos que responderam e não publica abaixo de 20; o 0% vem do adaptador extrasAC (server/src/modulos/metricas/mapa.ts), que não marca sem_resposta nem null como ausentes; correção no adaptador; versão de critério 066:S8-com-resposta em CRITERIOS_ACELERATO (056:D-10 fica como histórico); contrato compatível (só valores), texto de docs/api/metricas.md; web muda só nos textos (AmostraInsuficiente, coluna Com resposta, nota do S8) e o E2E COMP-12; back e front podem rodar em paralelo. DECISÃO TÉCNICA (Jarvis): E1.2 com o node-backend na worktree MetricasDSPD-041 (limpa), branch nova feature/066-s8 a partir da origin/develop; o front vem depois na mesma branch, para não haver dois agentes na mesma worktree.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: todo cálculo pela biblioteca compartilhada; abaixo de 20 itens não publica; mudança de critério registrada com data; BusinessMap e Acelerato nunca se misturam.
- Não mexa em `web/` nem em `e2e/` (são do front).
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, `e2e/`, outras métricas, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 ls-remote origin feature/066-s8` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/Metricas/MetricasDSPD-041 && pnpm run docs:check` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).