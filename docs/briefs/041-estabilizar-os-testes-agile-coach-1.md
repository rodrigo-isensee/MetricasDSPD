Agente destino: forge:agile-coach
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Retrospectiva do pedido 041 (estabilizar os testes), etapa E7.1. O pedido foi aberto em 2026-10-22 e saiu na develop pelos PRs #150 (9cc84d3, 08:06 de 2026-10-28) e #153 (f138c80, mesclado pelo dono às 10:07). No caminho houve duas quedas do WSL por falta de memória, um diagnóstico com 8 workers, a máquina trocada, o teto de 30 min da E2E da CI (pedido 044), cerca de 21 briefs do tech-lead com várias reprovações na conferência, o merge travado pelo ruleset estrito (branch desatualizada) e a delegação do merge negada pelo classificador de permissões, que virou ação do dono. O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/041-estabilizar-os-testes.md` inteiro.
- `docs/kanban/historico.md`, linhas dos cartões citados no pedido.
- `docs/kanban/conferencias.md`, linhas do 041.
- `docs/qa/041-estabilidade.md`, só a seção do diagnóstico (lista de causas).
- `docs/retrospectivas/2026-10-28-044-e2e-em-partes.md`, só como modelo de forma e para não repetir as MELHORIAs que já viraram cartão (K-156 a K-161).

## Entregar
- (E7.1) Retrospectiva em `docs/retrospectivas/2026-10-28-041-estabilidade.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (com a hora de cada evento tirada do Histórico do pedido e do historico.md), rodadas e reprovações agregadas por classe de causa, e linhas `MELHORIA:` (uma por linha, com problema, evidência por data e arquivo, medida do efeito e se vale para o Forge ou só para o projeto). Avalie pelo menos: as duas quedas do WSL por memória e o efeito da regra "uma suíte por vez"; o diagnóstico medido (E1) como base das correções; a quantidade de briefs e de rodadas de conferência do tech-lead, por classe de causa; a conferência sem `Desde` medindo commits de outros papéis (K-147); o teto de 30 min da E2E derrubando checks (044); o ruleset estrito exigindo a develop em série nos PRs #150, #153, #151 e #152; a delegação do merge negada pelo classificador e feita pelo dono. Melhoria que já tem cartão aberto entra citando o cartão, sem linha `MELHORIA:` nova.
- (E7.1) Um commit só da retrospectiva, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-108`; sem push.
- (E1, E2, E3, E4, E6) Nada a entregar aqui: não nesta delegação (artefatos e pareceres já entregues e mesclados na develop).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; já entregue
- "E3.3 (forge:qa-engineer): parecer de QA da `feature/041-homolog-aprovada` (conteúdo do E3.2), portão R-QA antes do PR." · etapa de outra delegação; já entregue
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; já entregue
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; já entregue
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; já entregue
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os outros pedidos; push; ler ou editar o `.env`.

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
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- ADR 0003 (citada no pedido): orçamento de performance; registra a regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms). Nada a decidir nesta retrospectiva; não proponha afrouxar limite.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 3 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): implementacao em 2 entregas · evita: rode a suíte inteira e cada prova antes do relatório (R-PROVA)
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md): nenhuma instância de agente (papel seguido de número, como tech-lead-2) no texto.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-041-estabilidade.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-041-estabilidade.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-28-041-estabilidade.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-041-estabilidade.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as linhas `MELHORIA:` copiadas. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
