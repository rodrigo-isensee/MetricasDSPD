Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: review

## Objetivo
Etapa E5.1 do pedido 041 (cartão K-108), volta da forma do parecer de review: o `forge-check brief` acusa em `docs/reviews/041-homolog-aprovada.md` (commit 0aa0de8) que (1) a versão do arquivo não tem registro de autoria do papel tech-lead (o registro tem o sha256 dc92541c50bb60107f826bd2fbcc8696fc1f7c102be440cc5b2d8d131b9b1552; o arquivo commitado tem c30dd0bfac3ebe550e13bb212b76098456276496bc96b274514b56d81c147d5e, depois da correção dos números de linha), (2) o achado A1 passa de 300 caracteres e (3) há linhas fora do formato no bloco `## Achados` ("Nenhum achado bloqueante." e a quebra do A3). Sem isso, o PR não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-041b`, head 89a0bb22cd2f137e3019cdb5df4e215d539e7dff.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/reviews/041-homolog-aprovada.md`: inteiro.
- `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/templates/projeto/docs/reviews/_modelo.md`: formato do bloco `## Achados`.

## Entregar
- (E3, E5.1) Regravar `docs/reviews/041-homolog-aprovada.md` com a ferramenta de escrita (Write), no formato do `_modelo.md`: no bloco `## Achados`, só as linhas de achado, uma linha por achado, cada uma com até 300 caracteres (A1 encurtado, mesmo sentido); "Nenhum achado bloqueante." sai do bloco (pode ir para o resumo, fora de `## Achados`); veredito, severidades e frontmatter (`commit: a411f9fe2d6d7c2e63b92b68549f35317026690e`) iguais.
- (E3, E5.1) Commit com `git add` explícito desse caminho e `Cartão: K-108`; push sem `--force`, sem PR.
- (E1, E2, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue (a leitura de 2026-10-27 está em 4b249bc)
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; já entregue (72ca360, 452ebdc)
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · code review entregue em 0aa0de8; aqui só a forma e a autoria do parecer; os PRs vêm depois do QA, em outra delegação
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · já entregue (parecer aprovado, commit 89a0bb2)
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- Mudar o veredito, a severidade ou o mérito dos achados; mudar workflows, documentação ou os pareceres de devops e segurança (o de segurança é regravado em paralelo pelo security-engineer e commitado depois); QA, PR e merge; rodar suítes de teste; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -upgrade.

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
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega (workflows e documentação da homolog) não mexe nela; a leitura de 2026-10-27 já entrou pelo 4b249bc, no PR #150.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. Dúvida de regra de negócio vira pergunta, não inferência.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 05:20): a develop entra na `feature/041-homolog-aprovada` antes do code review, da segurança e do QA, para que os pareceres não precisem ser revalidados depois (lição do PR #150); feito em a411f9fe2d6d7c2e63b92b68549f35317026690e (tech-lead-12).
- Teste local: nenhum (o diff da branch é só workflow e documentação; a CI do push é a prova). O parecer é regravado pela ferramenta de escrita (Write), para o registro de autoria do papel; nunca por Bash, sed ou python, e sem `commit --amend` depois de gravar. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD && /home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 041-estabilizar-os-testes --ref feature/041-homolog-aprovada --base develop 2>&1 | grep -c docs/reviews/041-homolog-aprovada.md` · espera: igual '0'
- PQ-2 (cmd): `grep -c c30dd0bfac3ebe550e13bb212b76098456276496bc96b274514b56d81c147d5e /home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl` · espera: igual '0' (e o sha256 novo do arquivo aparece no registro com `"papel": "tech-lead"`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b diff --name-only 89a0bb22cd2f137e3019cdb5df4e215d539e7dff HEAD` · espera: igual 'docs/reviews/041-homolog-aprovada.md'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-041b ls-remote origin refs/heads/feature/041-homolog-aprovada` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-041b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b status --porcelain -- docs/reviews` · espera: linhas=0 (o parecer de segurança regravado em paralelo pelo security-engineer, sem commit, fica de fora)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha do commit e o sha256 novo do arquivo. Diga como a versão anterior foi alterada depois do Write (para a retrospectiva). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
