# Pedido 041: estabilizar os testes (instabilidades)

- **Data:** 2026-10-22
- **Origem:** usuário: "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- **Modo:** implementar
- **Objetivo:** acabar com as falhas intermitentes da suíte (unidade, E2E e CI), atacando a causa raiz em vez de rodar de novo ou aumentar timeout.
- **Clareza:** 1 confirmado, 3 técnicos, 2 suposições; 0 perguntas.

## Diagnóstico inicial (Jarvis, a partir do quadro)
Instabilidades já registradas, em quatro grupos:
- **Carga e tempo:** K-092 e K-115 (IF-U-operacional e CA-19 axe estouram 30 s na suíte completa), K-132 (9 E2E falham com 8 workers e passam com 2 ou 3) e K-123 ("gerador < 1,5 s" falha com load ~10).
- **Aleatoriedade:** K-107 (montecarlo.test.ts com semente aleatória: falhou no #96 e no push do #108).
- **Esperas frágeis no E2E:** K-135 (espera de "painel pronto" duplicada em 4 lugares, por onde passou o W037-001); o `reuseExistingServer` na porta 4173 já serviu o build de outra worktree (corrigido com `E2E_PORTA`; falta conferir se cobre tudo).
- **Portões que deixam passar ou correm:** K-134 (o `pronto` não roda o typecheck do e2e), K-108 (`homolog-aprovada` não espera o portão terminar) e K-132, segunda parte (a suíte regrava `docs/qa/evidencias` a cada execução e suja a árvore).

## Escopo
- E1. Diagnóstico medido: rodar as suítes repetidas vezes (unidade, E2E em 1, 2 e 8 workers, sob carga) e registrar a taxa de falha por teste e a causa raiz de cada instável. · `técnico`
- E2. Corrigir a causa de cada teste instável dos grupos acima, sem aumentar timeout e sem retry como solução, mantendo a cobertura de cada asserção. · `confirmado`
- E3. Fechar os buracos dos portões: typecheck do e2e no `pronto` (K-134), `homolog-aprovada` esperando o portão (K-108) e evidências de QA fora do caminho versionado nas execuções comuns (K-132). · `técnico`
- E4. Um teste de regressão de estabilidade: os testes corrigidos rodando N vezes seguidas sem falha, como prova da entrega. · `técnico`

## Etapas
- E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo.
- E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132).
- E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123).
- E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134).
- E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops.
- E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA.
- E5.1 (forge:tech-lead): code review e PRs para a develop.

## Fora do escopo
- Afrouxar limite de performance (C6, F6, F9, ADR 0003) ou de cobertura. · `confirmado` · base: regras do projeto
- Os defeitos de produto (L2T-003 CLS, K-126 a K-129). · `suposição` · base: o pedido fala de instabilidade de teste
- Mudar a suíte de outros projetos ou do Forge (o que for de fábrica vira MELHORIA). · `técnico`

## Suposições
- "instabilidades" = os testes que passam e falham sem mudança de código (lista do Diagnóstico); se o dono viu outra, ela entra no E1. · `suposição` · base: cartões K-092, K-107, K-115, K-123, K-132 e K-135
- O 025 em QA não espera por este pedido: o reteste dele segue, e as instabilidades que aparecerem lá entram no E1. · `suposição` · base: ordem do dono de 2026-10-20 (táticas antes)

## Critério de pronto
- PQ-1 cada teste corrigido roda 20 vezes seguidas sem falha, com 8 workers e sob carga · prova: cmd · `técnico`
- PQ-2 `pnpm run pronto` falha quando há erro de tipo no e2e · prova: cmd · `técnico`
- PQ-3 nenhum timeout aumentado e nenhum retry novo no diff · prova: cmd · `confirmado`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).

## Registro de clareza
PERGUNTA: nenhuma

## Histórico
- 2026-10-22: pedido aberto; recibo enviado ao dono.
- 2026-10-22 22:15: recibo aceito. Cartão K-138 (E1.1, diagnóstico). As correções (E2 a E4) saem do plano do diagnóstico.
- 2026-10-23 11:40: o WSL caiu sem memória durante o diagnóstico (qa-1, segunda execução). Ficou um relatório parcial sem commit na worktree -041: unidade 0/5 falhas; E2E com 8 workers deu 20 falhas (19 timeouts), com 2 workers deu 1 (perf F4); achados F-1 (`pnpm test` dispara o E2E) e F-2 (E2E regrava `docs/qa/evidencias`). Decisão técnica do Jarvis (`técnico`, base: decisão do dono de 2026-10-23 sobre o consumo): a continuação roda com no máximo 2 workers e uma execução de E2E por vez, sem o cenário de 8 workers (o dado da r1 com 8 workers já basta para o K-132), e o cenário "sob carga" vira 2 workers com a unidade em paralelo limitada a 1 pacote. Brief qa-engineer-2.
- 2026-10-23 15:00: o WSL caiu de novo por falta de memória, agora durante o qa-2 (no máximo 2 workers); o relatório parcial não avançou. Instrução do dono na reconexão: "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo". Decisão técnica do Jarvis (`técnico`, base: `systemd-run --user --scope -p MemoryMax=...` testado e funcionando neste WSL): a continuação roda cada execução de teste dentro de um escopo com teto de memória (8 GB, sem swap), com 1 worker, sem o cenário "sob carga", encerrando servidores de preview e de API mock entre as rodadas, e registra o pico de memória de cada rodada. Com o teto, só o teste é morto ao estourar, e o WSL fica de pé; o estouro vira achado (consumo de memória da suíte). Brief qa-engineer-3.
- 2026-10-23 16:10: a sessão foi reiniciada pelo dono dentro do `jarvis.slice` (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos). O qa-3 não gravou medição nova antes do reinício. Decisão técnica do Jarvis (`técnico`, base: `systemd-run --user` cria um escopo fora do `jarvis.slice` e escaparia do teto que o dono definiu): sai o `systemd-run`; o teto passa a ser o próprio slice, e o pico de memória é lido em `memory.current` e `memory.peak` do slice antes e depois de cada rodada. Se um processo for morto por falta de memória, roda-se menos coisa e tenta-se de novo, como o dono pediu. Brief qa-engineer-4.
- 2026-10-23 20:00: nova queda do WSL (falta de memória virtual no Windows, que o dono corrigiu com o pagefile). Antes da queda, o qa-4 gravou a rodada r2 (E2E completa com 1 worker: 708 passaram, 1 falhou, perf F4 com p95 de 105,8 ms contra 100 ms; 63,8 min; pico de 6,3 GiB, quase tudo cache de arquivo). Na reconexão, a sessão roda no `init.scope`, sem o `jarvis.slice`; a memória passa a ser lida em `/sys/fs/cgroup/init.scope/memory.current` e `memory.peak`. Decisão técnica do Jarvis (`técnico`): o brief qa-engineer-5 continua do ponto em que o qa-4 parou (os testes do Diagnóstico 10 vezes cada e a unidade de um pacote), com a mesma regra de uma suíte por vez e 1 worker.
