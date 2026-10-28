Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: volta
Branch: feature/041-estabilidade   Base: develop   Base-sha: 7b5732d42a1c63d6302c24dbbf4987e4b52099d8
Etapa: merge-integracao
Volta-de: docs/briefs/041-estabilizar-os-testes-tech-lead-9.md sha256 43eebcb4965c0c3116bb343cebc5f7bad657e174fd48a86721e2b8d4c169000c

## Objetivo
Etapa E5.1 do pedido 041 (cartões K-138, K-149), parte final: push, PR da `feature/041-estabilidade` para a develop e merge por squash depois dos checks verdes. A leitura do F4 na ADR 0003 já está em commit (4b249bca8ee8b653878b6cb96d100f965203bfc9); review (84291bc), segurança (c31921f) e QA (d9a9b4c) aprovados e apontando para ela; o `forge-check pr` da worktree sai limpo (rc 0); a develop está verde (K-151, 7b5732d) e o `git merge-tree` com ela não tem conflito. Worktree `/home/rodrigoisensee/MetricasDSPD-041`, head d9a9b4ca742c4c894a73f14bed1b1228ae0e5154, limpa e sem push desde 83aa9fa.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md`: frontmatter, `## Achados` e a seção do teto por PR (M14).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md` e `/home/rodrigoisensee/MetricasDSPD-041/docs/security/041-estabilidade.md`: só o frontmatter e `## Achados`.

## Entregar
- (E2, E5.1) Push da branch, sem `--force`; `forge-check pr` da worktree limpo antes de abrir o PR.
- (E2, E5.1) PR para a `develop` com `gh pr create --base develop --head feature/041-estabilidade --body-file <arquivo>`: título em português no padrão de commits; corpo com o resumo do 041, os pareceres de review, segurança e QA citados por caminho, a linha `teto: excedido, 592 linhas, ...` que o parecer de review fixou e as linhas `Cartão: K-138` e `Cartão: K-149`.
- (E2, E5.1) Esperar os checks obrigatórios do ruleset (`gh pr checks feature/041-estabilidade --watch --required`); com todos em pass (ou skipped pelo filtro de caminhos no run de pull_request, com pass no de push do mesmo head), merge com `gh pr merge feature/041-estabilidade --squash` (sem `--admin`). Check vermelho ou PR com conflito: sem merge, relate o check ou o conflito e o motivo (R-CONFORMIDADE). Comandos por nome de branch, sem variáveis de shell.
- (E2, E5.1) Depois do merge: apagar a branch remota e a local e remover a worktree `/home/rodrigoisensee/MetricasDSPD-041` (R-FLUXO, "Depois do merge"); só se os heads remoto e local forem o `headRefOid` do PR.
- (E2, E5.1) Volta 1: o PR #150 já existe; o merge foi barrado pelo hook `parecer` depois que a develop entrou no merge c61b6c1; os três pareceres foram revalidados no delta e apontam para c61b6c1 (segurança 2f6f718, review b0f442d e 85f3008, QA ea0bb29, autoria registrada pelo hook), e o `forge-check pr 041-estabilizar-os-testes --ref feature/041-estabilidade` sai com rc 0 no head da worktree. Faça o push de ea0bb29114782b64a58bad36f7fdf1bb97090b17 para `feature/041-estabilidade` (sem `--force`, o PR #150 já existe: não crie outro); espere os checks obrigatórios do novo head e faça o merge por squash como acima (sem `--admin`), depois a limpeza como acima, que faz parte do E5.1 pela decisão técnica do Jarvis no Histórico do pedido (2026-10-27 22:12, R-FLUXO "Depois do merge"). Barrado de novo pelo hook ou por check: sem merge, relate a mensagem inteira (R-CONFORMIDADE).
- (E1, E3, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue (a leitura de 2026-10-27 está em 4b249bc)
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; já entregue
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- A `feature/041-homolog-aprovada` e a worktree -041b (outro PR do E5.1, depois do E5.3); mudar código, testes ou pareceres; rodar suítes de teste locais (o QA do 026 ocupa a máquina); `homolog` e `main`; o quadro; ler ou editar o `.env`; a worktree -026.

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
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega só leva a leitura de 2026-10-27, sem mudar limite, regra nem critério.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. Dúvida de regra de negócio vira pergunta, não inferência.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-27): o hook `parecer` barrou o merge do PR #150 porque a develop trazida em c61b6c1 mudou arquivos depois do `commit:` dos pareceres; caminho conforme: os três pareceres revalidam o delta e passam a apontar para c61b6c1; nada é contornado.
- Teste local: nenhum (os checks da CI no PR são a prova). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 041-estabilizar-os-testes --ref feature/041-estabilidade --base origin/develop` · espera: rc=0 (antes de abrir o PR)
- PQ-2 (pr): `gh pr view feature/041-estabilidade --json number,baseRefName,body` · espera: base `develop`, corpo com 'Cartão: K-138' e 'teto: excedido'
- PQ-3 (run): `gh pr checks feature/041-estabilidade --required` · espera: todos os obrigatórios em pass (ou skipped por filtro no run de pull_request com pass no de push do mesmo head)
- PQ-4 (merge): `gh pr view feature/041-estabilidade --json state,mergeCommit` · espera: state `MERGED` e o sha40 do commit do merge
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop && git -C /home/rodrigoisensee/MetricasDSPD merge-base --is-ancestor <mergeCommit> origin/develop` · espera: rc=0 (troque <mergeCommit> pelo sha do PQ-4)
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/041-estabilidade` · espera: linhas=0
- PQ-7 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c 'MetricasDSPD-041$'` · espera: igual '0'
- PQ-8 (push): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/pull/150/head` · espera: contém 'ea0bb29114782b64a58bad36f7fdf1bb97090b17'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o número do PR, o sha do merge e o tempo de espera dos checks. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
