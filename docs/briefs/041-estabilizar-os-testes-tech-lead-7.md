Agente destino: forge:tech-lead
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709
Etapa: review

## Objetivo
Etapa E5.1 do pedido 041 (cartões K-138, K-149), preparação do PR: `forge-check pr 041-estabilizar-os-testes --ref feature/041-estabilidade --base origin/develop` sai com rc 1 porque o seu parecer `docs/reviews/041-estabilidade.md` (e o de QA) declara `pedido: 041-estabilidade`, e não o ID do pedido. Antes de os pareceres de segurança e QA serem atualizados, a leitura do F4 na ADR 0003 precisa entrar em commit, porque mudar a ADR depois invalida os três. Worktree `/home/rodrigoisensee/MetricasDSPD-041`, head bce41e9537caaacd2880e7e29f13fc6bf30640eb, com a ADR modificada e sem commit.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-041 diff -- docs/architecture/adr/0003-orcamento-de-performance.md` (1 linha, gravada pelo software-architect).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md`: frontmatter e a seção do E6.1.

## Entregar
- (E2, E2.3) Commit só de `docs/architecture/adr/0003-orcamento-de-performance.md`, com `Cartão: K-138`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`.
- (E2, E2.3) No seu parecer de review: `pedido: 041-estabilizar-os-testes` no frontmatter; `commit:` com o sha40 do commit da ADR; uma linha registrando a revisão da linha nova da ADR (só leitura datada, sem mudar limite, regra nem critério). Veredito e achados ficam como estão, salvo se a revisão da linha mostrar defeito. Commit só do parecer, com os `Cartão:` do 041, sem push.
- (E1, E3, E4, E6) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; já entregue (a leitura de 2026-10-27 entra no commit desta)
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; já entregue
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; a atualização do parecer vem depois desta
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · etapa de outra delegação; já entregue
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; já entregue
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; a atualização do frontmatter do parecer vem depois desta
- Push, PR e merge (outra delegação do E5.1, depois dos pareceres de segurança e QA atualizados); os pareceres de segurança e QA; a `feature/041-homolog-aprovada` e a worktree -041b; mudar código ou testes; rodar suítes de teste locais (o QA do 026 ocupa a máquina); `homolog` e `main`; o quadro; ler ou editar o `.env`; a worktree -026.

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
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/architecture/adr/0003-orcamento-de-performance.md` · o sha40 do commit da ADR
- PQ-2 (cmd): `grep -c '^pedido: 041-estabilizar-os-testes$' /home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md` · espera: igual '1'
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/reviews/041-estabilidade.md` · o sha40 do commit do parecer, filho do commit da ADR
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain --untracked-files=no` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha da ADR e o veredito da linha nova. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
