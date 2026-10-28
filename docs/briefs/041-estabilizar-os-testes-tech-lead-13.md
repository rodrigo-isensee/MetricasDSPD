Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: review

## Objetivo
Etapa E5.1 do pedido 041 (cartão K-108), parte do code review: revisar a `feature/041-homolog-aprovada` (E3.2: `homolog-aprovada` sem espera paga e `homolog-reavalia.yml` por workflow_run, pela decisão B) no head a411f9fe2d6d7c2e63b92b68549f35317026690e, já com a develop, em paralelo ao parecer de segurança (E5.3). Worktree `/home/rodrigoisensee/MetricasDSPD-041b`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-041b diff origin/develop...HEAD` (4 arquivos: `.github/workflows/homolog-aprovada.yml`, `.github/workflows/homolog-reavalia.yml`, `docs/devops/041-homolog-aprovada.md`, `docs/engineering/fluxo-homologacao.md`).
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/devops/041-homolog-aprovada.md`: frontmatter e `## Achados`.
- Histórico do pedido `docs/pedidos/041-estabilizar-os-testes.md`: linhas de 2026-10-27 14:01 e 15:25.

## Entregar
- (E3, E5.1) Code review do diff contra a develop: correção dos workflows (gatilhos, `permissions`, condição de reexecução do check do PR, `timeout`), aderência à decisão B e ao `docs/engineering/fluxo-homologacao.md`, e os limites que o devops declarou (workflow_run só dispara com o arquivo na main; escopo `workflow` no token).
- (E3, E5.1) Parecer em `docs/reviews/041-homolog-aprovada.md` (frontmatter com `veredito:` e `commit: a411f9fe2d6d7c2e63b92b68549f35317026690e`; seção `## Achados`, cada achado com severidade e bloqueante ou não), gravado pela ferramenta de escrita; commit com `git add` explícito desse caminho e `Cartão: K-108`; push sem `--force`, sem PR.
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
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; já entregue
- Parecer de segurança (E5.3, outra delegação em paralelo), QA, PR e merge; mudar workflows ou documentação (achado vira item do parecer, não correção); rodar suítes de teste locais; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -upgrade.

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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-041b/docs/reviews/041-homolog-aprovada.md` · espera: rc=0, frontmatter com `veredito:` e `commit: a411f9fe2d6d7c2e63b92b68549f35317026690e`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b diff --name-only a411f9fe2d6d7c2e63b92b68549f35317026690e HEAD` · espera: igual 'docs/reviews/041-homolog-aprovada.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-041b ls-remote origin refs/heads/feature/041-homolog-aprovada` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-041b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b status --porcelain -- docs/reviews .github` · espera: linhas=0 (o parecer de segurança em `docs/security/`, não commitado, é de outra delegação em paralelo e fica de fora do commit)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito, os achados bloqueantes e o sha do commit do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
