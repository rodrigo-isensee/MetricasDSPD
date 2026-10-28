Agente destino: forge:software-architect
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Registrar na tabela "Leituras" da ADR 0003 a leitura do F4 que o dono julgou em 2026-10-27 (medição a frio, opção A), que pela decisão vai junto do PR do 041; última peça antes do PR (E5.1). Cartão K-138. Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`. Você não tem Bash: grave com Edit e não commite; o tech-lead leva o arquivo no commit da delegação do PR.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/architecture/adr/0003-orcamento-de-performance.md`: seção "Medição do F4 (pedido 041, 2026-10-23)" (critério de reversão) e a tabela "Leituras" no fim.
- `docs/pedidos/041-estabilizar-os-testes.md`: linhas do `## Histórico` que começam com `- PERGUNTA: 2026-10-27 · ADR 0003` e `- 2026-10-27 18:03`.

## Entregar
- (E2, E2.3) Uma linha nova na tabela "Leituras" da ADR 0003, datada 2026-10-27: leitura do F4 pela regra nova com a primeira medição a frio reportada à parte acima de 100 ms em 9 de 10 repetições (48 a 145 ms, mediana ~126 ms), fonte o parecer de QA do 041 (`docs/qa/041-estabilidade.md`); a 2ª condição do critério de reversão (relato do usuário de demora percebida) não se cumpre pela decisão do dono de 2026-10-27; veredito "manter" (critério de reversão não acionado; a primeira medição segue informativa). Nenhuma outra linha nem seção da ADR muda.
- (E2, E2.3) Gravar só com Edit; sem commit.
- (E1, E3, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; o PR vem depois desta
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; já entregue
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- Mudar qualquer limite, a regra de medição, o critério de reversão, outras ADRs, código, testes e pareceres; o quadro; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): F4, opção A ("A"): corrigir a medição do F4: a primeira medição a frio sai da amostra, o teste colhe pelo menos 20 medições de verdade e a ADR 0003 registra a mudança da regra de medição com data; o limite de 100 ms não muda.
- DECISÃO DO DONO (2026-10-23): workers da E2E, opção A ("A"): limitar a 2 workers na máquina local pela configuração do Playwright, com variável de ambiente para subir quando quiser; a CI não muda.
- DECISÃO DO DONO (2026-10-23): custo do `homolog-aprovada`, opção B ("B"): sem espera paga; o fim do portão do `homolog.yml` dispara de novo o `homolog-aprovada` do PR (segundos de Actions por release); se o devops mostrar que não funciona, a opção A volta ao dono.
- DECISÃO DO DONO (2026-10-27): 3 falhas pré-existentes da E2E completa do E4.1, opção A ("A"): corrigir dentro do 041 antes do PR (react-frontend corrige, code review, QA dos 3 testes e E2E completa), na fila atrás da volta do 026, que mexe em /operacional.
- DECISÃO DO DONO (2026-10-27): medição a frio do F4, opção A ("A"): o dono não percebe demora na primeira troca de filtro; a 2ª condição do critério de reversão da ADR 0003 (seção "Medição do F4") não se cumpre e nada muda; a primeira medição segue informativa. Registro da leitura no quadro de leituras da ADR vai junto do PR do 041 (técnico).
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega só acrescenta uma leitura, sem mudar limite, regra nem critério.
- Regra do projeto: mudança de critério de cálculo é registrada com data (CLAUDE.md, T2.6); aqui não há mudança de critério, só leitura.

## Pronto quando
- PQ-1 (cmd): `grep -c '^| 2026-10-27 ' /home/rodrigoisensee/MetricasDSPD-041/docs/architecture/adr/0003-orcamento-de-performance.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: igual ' M docs/architecture/adr/0003-orcamento-de-performance.md'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff --numstat -- docs/architecture/adr/0003-orcamento-de-performance.md` · espera: contém '1	0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo (sem Bash: escreva "conferido pelo Jarvis"). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
