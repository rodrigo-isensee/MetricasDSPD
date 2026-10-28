Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E6.2 do pedido 041 (cartão K-149): code review do E6.1, commit ea54fbffd51ed146cc14b32bd9f2b15428ea9d89 do react-frontend, que corrige as 3 falhas determinísticas da E2E completa (A1 axe `target-size` no botão "Sobre a janela fixa"; A2 CLS 0,115 a 375 px em /operacional e no Resumo), antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`; o remoto está em 6d40d688f7d7cb3cf61983a544eadb51761269f8.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 87151625c87c309a9dc436f5658b3aee077d12b5 ea54fbffd51ed146cc14b32bd9f2b15428ea9d89` (5 arquivos).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`, bloco `## Achados` (A1 e A2).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md`, bloco `## Achados` (o seu parecer anterior).
- `docs/pedidos/041-estabilizar-os-testes.md`, linhas do `## Histórico` de 17:53 e 17:54 sobre o E6.1 (causa medida, custo visual de cerca de 44 px a 375 px no Acelerato "Atual", folga do `scroll-mt-72`).

## Entregar
- (E6, E6.2) Push da branch `feature/041-estabilidade` com o commit do autor (ea54fbffd51ed146cc14b32bd9f2b15428ea9d89), sem `--force`, liberado pela decisão do dono de 2026-10-27 sobre push antes do QA (pedido 026).
- (E6, E6.2) Review do intervalo 8715162..ea54fbf numa seção nova "Revisão do E6.1 (K-149)" no parecer de review do 041: a correção ataca a causa (reserva de altura e área visível do alvo) sem desligar regra do axe nem mexer em limite, medição, timeout ou retry; a linha invisível com `aria-hidden` não vaza para leitor de tela; o custo visual de cerca de 44 px a 375 px e a folga do `scroll-mt-72` são aceitáveis ou viram achado; testes unitários e doc técnica cobrem a mudança. Achados novos no bloco `## Achados` (até 300 caracteres, bloqueantes marcados) e veredito atualizado no frontmatter.
- (E6, E6.2) Commit só do parecer, com `Cartão: K-149`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e novo push da branch (sem `--force`).
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · já entregue (ea54fbf); correções voltam ao autor em outra delegação
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; continua no pedido
- Corrigir código ou testes; rodar suítes de teste; o parecer de QA; PR para a develop (depois do E6.3); trazer a develop nova para a branch (a develop está vermelha, K-151); o quadro; ler ou editar o `.env`; as worktrees -026 e -151.

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
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- ADR 0003 (citada no pedido): CLS < 0,1 é o limite e não muda; a correção reserva espaço, não mexe no limite nem na medição.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. Dúvida de regra de negócio vira pergunta, não inferência.
- Teste: nenhum (review só de leitura; a máquina roda os testes do 026 e do K-151, uma suíte por vez). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/reviews/041-estabilidade.md` · espera: o sha40 do commit do review do E6.1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%B -- docs/reviews/041-estabilidade.md` · espera: contém 'Cartão: K-149'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-041 ls-remote origin refs/heads/feature/041-estabilidade` igual ao head local · branch no remoto com o parecer
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff ea54fbffd51ed146cc14b32bd9f2b15428ea9d89 --name-only` · espera: igual 'docs/reviews/041-estabilidade.md'
- PQ-6 (cmd): `grep -c -E '^- A[0-9]+ .{301,}' /home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
