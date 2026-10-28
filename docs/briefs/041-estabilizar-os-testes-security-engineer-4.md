Agente destino: forge:security-engineer
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709
Etapa: codigo

## Objetivo
Etapa E5.2 do pedido 041 (cartões K-138, K-149), atualização antes do PR: o `forge-check pr` recusa o seu parecer `docs/security/041-estabilidade.md` (commit: 4a72c205c94684fff98b05fab02ffd53dc800447) por "desatualizado" e por "autoria: sem registro". Depois dele entraram na branch o E6.1 (ea54fbf: CSS do aviso de falha e alvo sob o cabeçalho fixo em `web/`, mais `docs/tecnica/arquitetura-front.md`) e a leitura do F4 na ADR 0003 (4b249bca8ee8b653878b6cb96d100f965203bfc9). O hook só registra a autoria de um parecer gravado com Write ou Edit (ou `>`/`tee` no Bash); `sed -i` e scripts não contam, e o `forge-check pr` recusa a versão sem registro (`docs/hooks.md` do Forge, "Autoria dos pareceres"). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, head 84291bcaef4089703073d5a35becd833888ea487.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 4a72c205c94684fff98b05fab02ffd53dc800447 4b249bca8ee8b653878b6cb96d100f965203bfc9 --stat` e o diff dos arquivos fora de `docs/` dessa faixa.
- O seu parecer: frontmatter, `## Achados` e o resumo.

## Entregar
- (E5.2) Revisar o delta 4a72c20..4b249bca8ee8b653878b6cb96d100f965203bfc9 contra os gatilhos de R-SEGURANCA e atualizar o parecer com a ferramenta Write ou Edit: `commit:` = 4b249bca8ee8b653878b6cb96d100f965203bfc9, `pedido: 041-estabilizar-os-testes`, uma seção curta sobre o delta e o veredito. Commit só do parecer, com os `Cartão:` do 041, `git add` explícito por caminho, sem push. Outro agente pode commitar na mesma worktree em paralelo: se aparecer `index.lock`, espere alguns segundos e repita.
- (E1, E2, E3, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue (a leitura de 2026-10-27 entra no commit desta)
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; o PR vem depois desta
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação, em paralelo a esta
- Os outros pareceres (outras delegações em paralelo, cada um no seu arquivo); push, PR e merge; a `feature/041-homolog-aprovada` e a worktree -041b; mudar código, testes ou a ADR; rodar suítes de teste locais (o QA do 026 ocupa a máquina); `homolog` e `main`; o quadro; ler ou editar o `.env`; a worktree -026.

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
- O `forge-check` invalida um parecer quando muda, depois do `commit:` dele, um arquivo fora de `docs/reviews/`, `docs/qa/`, `docs/devops/`, `docs/security/`, `KANBAN.md` e `docs/kanban/` (a ADR é um desses arquivos): por isso a ADR entra antes e os três pareceres apontam para o commit dela. Teste local: nenhum. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/security/041-estabilidade.md` · o sha40 do commit do parecer
- PQ-2 (cmd): `grep -c '^commit: 4b249bca8ee8b653878b6cb96d100f965203bfc9$' /home/rodrigoisensee/MetricasDSPD-041/docs/security/041-estabilidade.md` · espera: igual '1'
- PQ-3 (cmd): `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 041-estabilizar-os-testes --ref feature/041-estabilidade --base origin/develop 2>&1 | grep -c 'docs/security'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
