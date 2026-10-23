Agente destino: forge:security-engineer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Tipo: codigo
Branch: docs/jarvis-2026-10-20-noite   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
O parecer de segurança da T14 (`docs/security/025-t14-reidentificacao.md`, aprovado em 32a509f) é anterior à correção L2T-002, que mudou os textos de "Meu time" na T14. Esse código já está na develop (squash c4db73e, PR #140). Revisar só esse delta, antes da promoção para a homolog. Etapa E1.4b do pedido 025, cartão K-110 (R-SEGURANCA: reidentificação de pessoas). O parecer atualizado vai na branch de documentação do Jarvis, no diretório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, onde a develop ainda não foi trazida.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff 32a509fa4e6798ab43f777dca15823592db67383 c4db73e666e560f2120ab0b0d4cff1307d7710c9 -- web/src/features/complementares server/tests/pg/servidor-api-mock.ts` (4 arquivos, cerca de 57 linhas).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show c4db73e666e560f2120ab0b0d4cff1307d7710c9:docs/security/025-t14-reidentificacao.md` (o parecer atual: R-1 = B, T14-M1 = B e os achados M-1 e M-1a).

## Entregar
- (E1, E2, E3, E4) Review incremental do delta 32a509f..c4db73e. Verifique se a tela da T14 continua sem revelar o total do projeto nem a fatia de outros times quando "outros times" está oculto (R-1 = B, T14-M1 = B), se nenhum texto novo deixa deduzir n − k, e se o mock da API (`servidor-api-mock.ts`) não muda o que a API real envia. Achado bloqueante vai para `## Achados`.
- (E1) Gravar o parecer no diretório principal, num arquivo novo: `docs/security/025-t14-reidentificacao-incremental.md`, com frontmatter no padrão do parecer anterior (`pedido: 025-front-do-011-lote2`, `commit: c4db73e666e560f2120ab0b0d4cff1307d7710c9`, `parecer:`) e a seção "Review incremental 32a509f..c4db73e". O parecer anterior não é tocado, porque um arquivo novo não conflita com o merge da develop que o tech-lead faz depois. Usar só a ferramenta Write, nunca script no Bash. Um commit só desse arquivo, com `git add` explícito por caminho, a linha `Cartão: K-110` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Sem push.

## Fora do escopo
- "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapa cumprida (32a509f).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1.", "E1.3 (forge:tech-lead): code review.", "E1.5 (forge:qa-engineer): QA e parecer.", "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas cumpridas.
- O K-130 (API da T14 envia o agregado do projeto oculto, condição antes da fase 3) continua no cartão próprio, salvo se o delta piorar o quadro.
- Mudar código; trazer a develop para a branch; push; PR; o quadro e os pedidos.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- CLAUDE.md: nenhuma métrica serve para avaliação individual. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/security/025-t14-reidentificacao-incremental.md` · espera: o sha40 do commit do parecer
- PQ-2 (cmd): `grep -c '^commit: c4db73e666e560f2120ab0b0d4cff1307d7710c9' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/025-t14-reidentificacao-incremental.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
