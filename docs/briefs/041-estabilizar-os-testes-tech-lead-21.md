Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: merge
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: merge-integracao

## Objetivo
Etapa E5.1 do pedido 041 (cartão K-108), parte final da `feature/041-homolog-aprovada`: o PR #153 já está aberto e com os checks verdes, mas o merge foi recusado porque a branch ficou atrás da develop (ruleset com checks estritos; a develop andou para 53675ece68f973986b30d7ea251ae5b79443e609 com o PR #154, que só mexe em `.github/workflows/ci.yml` e em pareceres do 044). Trazer a develop para a branch por merge, esperar os checks de novo e mesclar por squash, com a limpeza da branch e da worktree. Pareceres aprovados: devops (452ebdc, revalidado em 35c810e com `commit:` a361c36), review (0aa0de8, forma do A2 em b98a32f), segurança (73a13b0) e QA (a361c36, que também revalidou `docs/qa/041-estabilidade.md`); o `forge-check pr` da worktree sai limpo contra `origin/develop` e sem base (o hook `parecer` recusou o primeiro PR, tech-lead-17, pelo `commit:` antigo do parecer de devops). Worktree `/home/rodrigoisensee/MetricasDSPD-041b`, head 35c810ee5a34771dbf2c15f7c4030992386d488d, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/qa/041-homolog-aprovada.md`: frontmatter, `## Achados` e os itens pendentes da primeira release real.
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/devops/041-homolog-aprovada.md`, `docs/reviews/041-homolog-aprovada.md` e `docs/security/041-homolog-aprovada.md` da worktree: só o frontmatter e `## Achados`.

## Entregar
- (E3, E5.1) Na worktree: `git fetch origin`, `git merge --no-edit origin/develop` (commit de merge, sem rebase; conflito: pare sem resolver e relate), `git push origin feature/041-homolog-aprovada` (sem `--force`).
- (E3, E5.1) `forge-check pr` da worktree limpo depois do push, com `--base origin/develop` (o parecer vale com o merge da base: função commit_vale do forge-check). O PR #153 não muda de título nem de corpo.
- (E3, E5.1) Esperar os checks obrigatórios do ruleset (`gh pr checks feature/041-homolog-aprovada --watch --required`); com todos em pass (ou skipped pelo filtro de caminhos no run de pull_request, com pass no de push do mesmo head), merge com `gh pr merge feature/041-homolog-aprovada --squash` (sem `--admin`). Se a develop andar de novo antes do merge, repita o merge da develop e a espera uma vez; na segunda recusa, pare. Check vermelho, conflito ou recusa de hook: sem merge, relate a mensagem inteira (R-CONFORMIDADE). Comandos por nome de branch, sem variáveis de shell.
- (E3, E5.1) Depois do merge: remover a worktree `/home/rodrigoisensee/MetricasDSPD-041b` (sem `--force`) e apagar a branch remota e a local (R-FLUXO, "Depois do merge"); só se os heads remoto e local forem o `headRefOid` do PR.
- (E1, E2, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue (a leitura de 2026-10-27 entrou na develop pelo squash 9cc84d3 do PR #150)
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; já entregue (72ca360, 452ebdc)
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; já entregue
- E5.1 na `feature/041-homolog-aprovada`, merge da develop na branch (tech-lead-12) · etapa de outra delegação; já entregue (a411f9fe2d6d7c2e63b92b68549f35317026690e)
- E5.1 na `feature/041-homolog-aprovada`, code review (tech-lead-13) · etapa de outra delegação; já entregue (parecer 0aa0de8)
- E5.1 na `feature/041-homolog-aprovada`, forma dos pareceres (tech-lead-15) · etapa de outra delegação; já entregue (b98a32f)
- E5.1 na `feature/041-homolog-aprovada`, commit do parecer de segurança (tech-lead-16) · etapa de outra delegação; já entregue (b24bf18)
- E5.1 na `feature/041-homolog-aprovada`, primeira tentativa do PR (tech-lead-17) · etapa de outra delegação; parou sem PR pelo hook, sem mudança no repositório
- Revalidação do parecer de devops do E3.2 (devops-engineer-3) · etapa de outra delegação; já entregue (35c810ee5a34771dbf2c15f7c4030992386d488d)
- E5.1 na `feature/041-estabilidade` (tech-lead-2, tech-lead-3, tech-lead-6, tech-lead-7, tech-lead-8 e tech-lead-10, Histórico de 2026-10-27 15:26 a 21:52) · etapa de outra delegação; já entregue
- PR #150 da `feature/041-estabilidade` (E5.1 da outra branch, tech-lead-9 e tech-lead-11) · já entregue (merge 9cc84d3861b323fb84818a1458dc97cbfd09ae9b)
- "E3.3 (forge:qa-engineer): parecer de QA da `feature/041-homolog-aprovada` (conteúdo do E3.2), portão R-QA antes do PR." · já entregue (a361c36, aprovado)
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · já entregue (parecer aprovado, commit 89a0bb2)
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- E5.1 na `feature/041-homolog-aprovada`, abertura do PR #153 e espera dos checks (tech-lead-18) · etapa de outra delegação; já entregue (PR #153 aberto, merge recusado por branch atrás da develop)
- E5.1 na `feature/041-homolog-aprovada`, merge da develop e merge do PR #153 (tech-lead-19 e tech-lead-20) · não delegado: os dois briefs foram reprovados na conferência e este os substitui; nada foi executado
- Mudar workflows, documentação, código ou qualquer parecer (achado vira relato, não correção); criar outro PR ou mudar o PR #153 além do merge; rebase; rodar suítes de teste locais; apagar a branch remota `feature/041-estabilidade` (ação pendente do dono); `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -upgrade.

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
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega (workflows e documentação da homolog) não mexe nela; a leitura de 2026-10-27 já entrou na develop pelo squash 9cc84d3 do PR #150.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. Dúvida de regra de negócio vira pergunta, não inferência.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 05:20): a develop entra na `feature/041-homolog-aprovada` antes do code review, da segurança e do QA, para que os pareceres não precisem ser revalidados depois (lição do PR #150); feito em a411f9fe2d6d7c2e63b92b68549f35317026690e (tech-lead-12).
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 06:27, corrigida às 06:30): o devops-engineer revalida docs/devops/041-homolog-aprovada.md (commit: passa ao head a361c36c0dc6b7d9ffcc46936ba289e873194162, linha de revalidação; veredito e achados iguais), push; depois, o PR em outra delegação. Feito em 35c810ee5a34771dbf2c15f7c4030992386d488d.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 06:21): o qa-engineer revalida `docs/qa/041-estabilidade.md` no E3.3, só `commit:` e uma linha de revalidação.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 09:02): a develop entra na branch por merge, sem rebase; os merges na develop ficam em série (041b, depois 042, depois 026).
- DECISÃO DO DONO (2026-10-28): "Faça suas recomendações para as decisões até eu voltar para nada ficar parado só registre as decisões tomadas".
- Teste local: nenhum (o diff da branch é só workflow e documentação; os checks do PR são a prova). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): na raiz de `/home/rodrigoisensee/MetricasDSPD-041b`, `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check --raiz-pedidos /home/rodrigoisensee/MetricasDSPD pr 041-estabilizar-os-testes --ref feature/041-homolog-aprovada --base origin/develop` · espera: rc=0 (depois do push do merge da develop)
- PQ-3 (run): `gh pr checks feature/041-homolog-aprovada --required` · espera: todos os obrigatórios em pass (ou skipped por filtro no run de pull_request com pass no de push do mesmo head)
- PQ-4 (merge): `gh pr view feature/041-homolog-aprovada --json state,mergeCommit` · espera: state `MERGED` e o sha40 do commit do merge
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop && git -C /home/rodrigoisensee/MetricasDSPD show origin/develop:.github/workflows/homolog-reavalia.yml` · espera: rc=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/041-homolog-aprovada` · espera: linhas=0
- PQ-7 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c 'MetricasDSPD-041b'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha do merge da develop na branch, o sha do merge do PR e o tempo de espera dos checks. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
