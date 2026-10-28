Agente destino: forge:agile-coach
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Retrospectiva do pedido 026 (front do lote 3 das métricas operacionais, K-111; textos da especificação, K-154; leitura de "enviada" no CLAUDE.md, K-162), etapa E4.1. O pedido foi aberto em 2026-10-17 e fechou em 2026-10-28: o PR #152 (lote 3) entrou na develop às 11:09 pelo dono, depois de teste instável no check `testes`, E2E cancelada no teto de 30 min e a série de merges parada no #153; o #155 (textos) entrou às 13:35; o #157 (CLAUDE.md) foi mesclado pelo dono às 15:34, depois de várias rodadas de revalidação de pareceres acusados desatualizados pelo `forge-check pr` e pelo hook `parecer` (K-164). O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/026-front-do-011-lote3.md` inteiro.
- `docs/kanban/historico.md`, linhas dos cartões K-111, K-154 e K-162.
- `docs/kanban/conferencias.md`, linhas do 026.
- `docs/retrospectivas/2026-10-28-042-forge-0-30-3.md`, só como modelo de forma e para não repetir as MELHORIAs que já viraram cartão.

## Entregar
- (E4.1) Retrospectiva em `docs/retrospectivas/2026-10-28-026-lote3.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (com a hora de cada evento tirada do Histórico do pedido e do historico.md), rodadas e reprovações de brief e de entrega agregadas por classe de causa (de `conferencias.md`), e linhas `MELHORIA:` (uma por linha, com problema, evidência por data e arquivo, medida do efeito e se vale para o Forge ou só para o projeto). Avalie pelo menos: o teste instável do `operacionais.test.tsx:177` no #152; a E2E cancelada no teto de 30 min; a série de merges que só andou com o dono; as revalidações de pareceres desatualizados (E3.5 a E3.8) e a proposta K-164; o tempo do review e do QA dos textos (E1.6 a E1.9). Melhoria que já tem cartão aberto entra citando o cartão, sem linha `MELHORIA:` nova.
- (E4.1) Um commit só da retrospectiva, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-111`; sem push.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (artefatos e pareceres já entregues e mesclados na develop).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.6 (forge:ux-designer): textos da especificação do lote 3 (K-154): mínimo de 20 do O26 sobre as entregas do tipo (A12 do review = A7 do QA), tabela de decisões da §11 (A13), regra do vazio: "Nenhum item encontrado" aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA, que achou os dois juntos em mock=vazio)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E1.9 (forge:tech-lead): code review do E1.6, depois do push do E1.7; o PR para a develop depois do parecer do QA." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.1 (jarvis): registrar no CLAUDE.md a leitura da decisão de 2026-10-27 sobre push antes do QA (decisão do dono de 2026-10-28, K-162 opção A)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.2 (forge:tech-lead): trazer a branch docs/026-claude-md-enviada para a develop atual, code review do E3.1, commit da edição e do parecer de review, push sem PR." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.3 (forge:qa-engineer): parecer de QA do E3.1 (texto do CLAUDE.md coerente com a decisão do dono de 2026-10-27 e com o resto do arquivo)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.4 (forge:tech-lead): PR da docs/026-claude-md-enviada para a develop e merge com os checks verdes." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.5 (forge:qa-engineer): revalidar o parecer de QA do E1.6 (docs/qa/026-textos-lote3.md) sobre o head da docs/026-claude-md-enviada, que mudou o CLAUDE.md, e encurtar o achado A1 para até 300 caracteres (forge-check pr)." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.6 (forge:tech-lead): revalidar os pareceres de review do E1.6 e do E3.1 (docs/reviews/026-textos-lote3.md e docs/reviews/026-claude-md-enviada.md, este com o commit da base) sobre o head da branch, antes do E3.4." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.7 (forge:qa-engineer): revalidar o parecer de QA do E1.6 (docs/qa/026-textos-lote3.md) sobre o head 2a4191a da docs/026-claude-md-enviada: o hook `parecer` (sem `--base`) o acusa desatualizado porque o server/tests/plataforma2.test.ts entrou pela develop (merge 2a4191a); antes do E3.8." · etapa de outra delegação; já entregue (Histórico do pedido)
- "E3.8 (forge:tech-lead): revalidar o review do E1.6 (docs/reviews/026-textos-lote3.md) do mesmo jeito, depois do E3.7 e antes do E3.4." · etapa de outra delegação; já entregue (Histórico do pedido)
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os outros pedidos; push; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 3 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): implementacao em 2 entregas · evita: rode a suíte inteira e cada prova antes do relatório (R-PROVA)
- ADR 0003 (citada no pedido): orçamento de performance. Nada a decidir nesta retrospectiva; não proponha mudar a ADR.
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md): nenhuma instância de agente (papel seguido de número, como tech-lead-2) no texto.
- Não rode a suíte, o `pronto` nem testes: o commit da retrospectiva só tem .md e não é o commit final da branch; o `pronto` completo (decisão de 2026-10-21) roda uma vez antes do commit final da `docs/jarvis-2026-10-23` (DECISÃO TÉCNICA do Jarvis de 2026-10-28 17:37, Histórico do pedido), por causa da trava de suíte única. Os PQ deste brief são as provas desta entrega.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-026-lote3.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-026-lote3.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-28-026-lote3.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-026-lote3.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as linhas `MELHORIA:` copiadas. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
