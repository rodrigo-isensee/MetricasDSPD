Agente destino: forge:software-architect
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.2

## Objetivo
O dono respondeu ao roteiro de campos (Histórico de 14:57 do pedido 099): quase tudo já existe nas ferramentas e não pede campo novo. Revisar o roteiro e o plano com as respostas e preparar o que ele pediu para aprovar.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/099-nenhuma-metrica-simulada.md`, a linha de 14:57 (as seis respostas literais).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-campos-para-configurar.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md`.
- Na develop (`/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `docs/architecture/fontes/businessmap-dominio.json`, `docs/architecture/fontes/acelerato-listas.md` e o que a coleta do BusinessMap já guarda de tags, prioridade/criticidade, deadline, campos personalizados do card pai (Diretoria, Gerência) e do workflow do Acelerato.

## Entregar
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." (E2.2) Nesta delegação, a revisão do plano com as respostas do dono.
- (E1) (E2) (E2.2) Escrever `docs/analises/099-revisao-campos.md` (novo), pela ferramenta Write, no repositório principal: (a) por cartão (O8, O12, O14, O16, O24, S9), de onde vem o dado agora e o que muda no plano e nos lotes; (b) as consultas só de leitura para o dono rodar (só contagens e nomes, nenhuma coluna de pessoa), para: as tags existentes nos cards dos quadros das equipes (para mapear classe de serviço), o campo nativo de criticidade/prioridade e os seus valores, os campos Diretoria e Gerência do card de projeto pai e o seu preenchimento, e o desenho do workflow do Acelerato (etapas e a ordem); (c) a proposta da ordem das etapas do Acelerato a partir do que já está na base ou na documentação, para o dono só aprovar; (d) a proposta de mapeamento tag para classe, se der para fazer pela documentação, ou o que a consulta precisa trazer; (e) os campos do Acelerato da parte 2 (Motivo de Encerramento, Motivo da Escalação, Prioridade ajustada, Avaliação de Problema, Motivo de Pendência): para cada um, se já existe algo equivalente nas listas conhecidas, com opções para o dono, uma pergunta por campo; (f) a responsabilidade do atraso do O12 com o deadline nativo: opções e recomendação. Sem ler a base real nem `.env`. Sem commit.
- (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-revisao-campos.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 125ff73356dbd97a31ffa0e5cef650a070a5ba52949550d675466b84b2a4d243 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-revisao-campos.md` · espera: existe e traz as consultas só de leitura
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
