Agente destino: forge:node-backend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: codigo   Cobre: E1.3

## Objetivo
Lote L1 do 070 na API: contrato com o campo opcional `simulavel` na resposta sem-dado-real, `podeSimular` e `METRICAS_SEM_SIMULACAO`, portão do serviço, docs da API e testes (pedido 070, E1.3, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f` (livre desde o merge do PR 218), branch `feature/070-simulado-por-cartao` já criada em d2ec79d, sem commit.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/070-desenho.md` (seções do contrato, da regra do cartão, dos testes T-C1, T-C2, T-S1, T-S2 e 8, Divisão em lotes, linha L1).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0028-simulado-por-cartao.md` (a ADR 0028, proposta).

## Entregar
- "E1.3 (node-backend): implementação na API." (E1.3)
- (E1) (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin develop`, `git -C /home/rodrigoisensee/MetricasDSPD-052f switch feature/070-simulado-por-cartao` e `git -C /home/rodrigoisensee/MetricasDSPD-052f merge --ff-only origin/develop`; `pnpm install --frozen-lockfile` na worktree (com `registry.npmjs.org` em `allowed_domains`); copiar sem mudar o texto `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/070-desenho.md`, `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0028-simulado-por-cartao.md` e `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/adr/0026-metricas-so-com-dado-real.md` para os mesmos caminhos relativos na worktree e commitar os três num commit de docs; implementar o L1 como o desenho descreve (contratos, `podeSimular`, `METRICAS_SEM_SIMULACAO` com VISAO_GERAL, TENDENCIA_FLUXO, TENDENCIA_SUST, EI_SUST e a aba Apontamento, portão do servico.ts, docs/api, testes T-C1, T-C2, T-S1, T-S2), conferindo antes `origem.ts` na develop; a API nunca devolve número simulado; vitest do server e dos pacotes com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push -u origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028; entra na develop nesta entrega, cópia sem mudar o texto
- ADR 0028 (citada no pedido): a decisão que este lote implementa (proposta)
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:54: E1.1 cumprida pelo software-architect: docs/analises/070-desenho.md e ADR 0028 (proposta), sem commit. Simulado só no navegador (mock no Web Worker da ADR 0021), a API nunca devolve número simulado; resposta sem-dado-real ganha o campo opcional simulavel; o real sempre ganha; selo falha fechado (mock com erro volta a "Sem dado real"); sem gatilho de segurança. Lotes: L1 node-backend (contrato e campo simulavel), L2 react-frontend (depois do L1), L3 E2E e desempenho com o QA. Perguntas Q-070-1 a Q-070-6: Q-070-2 (faixas e Resumo) e Q-070-6 (Visão Geral) respondidas pela decisão do dono de cartão simulado fora do resumo; Q-070-1, Q-070-3, Q-070-4 e Q-070-5 viram as suposições S1 a S3 (propostas conservadoras do desenho, não bloqueiam o L1). DECISÃO TÉCNICA (Jarvis): L1 do node-backend começa já; a ADR 0026, que a 0028 revê, está só na worktree 052b sem commit: entra na develop junto com a 0028 no PR do L1 (cópia do arquivo sem mudança de texto).
- 2026-11-04 21:59: L1 não cumprido por ambiente: a worktree nova /home/rodrigoisensee/MetricasDSPD-052e não pôde ser criada (pasta pai somente leitura no sandbox; sem sandbox, negado pelo classificador); a branch local feature/070-simulado-por-cartao ficou criada em d2ec79d, sem commit. DECISÃO TÉCNICA (Jarvis): o L1 roda na worktree /home/rodrigoisensee/MetricasDSPD-052f (limpa, branch feature/068-zod já mesclada no PR 218), trocando para a branch do 070 e avançando até a develop atual; o pnpm install pede registry.npmjs.org em allowed_domains. MELHORIA: o Jarvis cria a pasta da worktree antes de delegar, ou reaproveita uma worktree livre.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual, BusinessMap e Acelerato nunca se misturam, todo cálculo pela biblioteca compartilhada; real e simulado nunca no mesmo número.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, o texto das ADRs 0021, 0026, 0027 e 0028, o desenho, outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/070-simulado-por-cartao` · espera: contém 'refs/heads/feature/070-simulado-por-cartao'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only origin/develop origin/feature/070-simulado-por-cartao -- docs/architecture/adr` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).