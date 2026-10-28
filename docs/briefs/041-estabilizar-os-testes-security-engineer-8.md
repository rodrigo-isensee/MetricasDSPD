Agente destino: forge:security-engineer
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: seguranca

## Objetivo
Etapa E5.3 do pedido 041 (cartão K-108), volta da forma do parecer de segurança: o `forge-check pr` acusa em `docs/security/041-homolog-aprovada.md` (commit 89a0bb2) que o achado A3 passa de 300 caracteres e que há linhas fora do formato no bloco `## Achados` (o A2, com caractere de controle ou quebra, e "Nenhum achado bloqueante."). Sem isso, o PR não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-041b`, head 89a0bb22cd2f137e3019cdb5df4e215d539e7dff.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/security/041-homolog-aprovada.md`: inteiro.
- `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/templates/projeto/docs/security/_modelo.md`: formato do bloco `## Achados`.

## Entregar
- (E3, E5.3) Regravar `docs/security/041-homolog-aprovada.md` com a ferramenta de escrita (Write): no bloco `## Achados`, só as linhas de achado, uma linha por achado, cada uma com até 300 caracteres e sem caractere de controle (A3 encurtado, mesmo sentido); "Nenhum achado bloqueante." sai do bloco (pode ir para outra seção); veredito, severidades e frontmatter (`commit: a411f9fe2d6d7c2e63b92b68549f35317026690e`) iguais. Sem commit nem push: o tech-lead empurra a mesma branch em paralelo (forma do parecer de review), e o commit deste arquivo vai numa delegação seguinte ao tech-lead.
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
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · code review entregue em 0aa0de8; a forma do parecer de review é de outra delegação em paralelo; os PRs vêm depois do QA
- Commit, push, PR e merge; mudar workflows, a documentação da homolog ou outro parecer além de `docs/security/041-homolog-aprovada.md`; rodar suítes de teste; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -upgrade.

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
- Teste local: nenhum (o diff da branch é só workflow e documentação; a CI do push é a prova). O parecer é gravado pela ferramenta de escrita (Write ou Edit), para o registro de autoria do papel; nunca por Bash. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `sed -n '/^## Achados/,/^## [^A]/p' /home/rodrigoisensee/MetricasDSPD-041b/docs/security/041-homolog-aprovada.md | grep -v '^## ' | grep -v '^- A[0-9]' | grep -c .` · espera: igual '0' (no bloco, só linhas de achado; o arquivo não está commitado, o `forge-check pr` só lê a branch)
- PQ-2 (cmd): `sed -n '/^## Achados/,/^## [^A]/p' /home/rodrigoisensee/MetricasDSPD-041b/docs/security/041-homolog-aprovada.md | awk 'length > 300' | wc -l` · espera: igual '0'
- PQ-3 (cmd): `grep -c 631d08138b8f1ae28b9ccb0f3def1e98e3cbdb2dc49f9bb0a03ea782cd7b1232 /home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl` · espera: igual '1' (registro da versão anterior; a versão nova ganha uma linha própria com `"papel": "seguranca"`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a evidência, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
