Agente destino: forge:qa-engineer
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: 7b5732d42a1c63d6302c24dbbf4987e4b52099d8
Etapa: qa

## Objetivo
Etapa E6.3 do pedido 041 (cartões K-138, K-149), revalidação do parecer antes do merge do PR #150: o tech-lead trouxe a develop (7b5732d42a1c63d6302c24dbbf4987e4b52099d8: Dependabot, K-148 e K-151) para a branch no merge c61b6c1 e o hook `parecer` barrou o `gh pr merge` porque arquivos mudaram depois do `commit:` do seu parecer (4b249bca8ee8b653878b6cb96d100f965203bfc9). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, head c61b6c1, limpa; os três pareceres (review, QA, segurança) são revalidados em paralelo, cada papel o seu.

## Ler
- O seu parecer `docs/qa/041-estabilidade.md`: frontmatter e `## Achados`.
- `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 4b249bca8ee8b653878b6cb96d100f965203bfc9 c61b6c1 --stat` e o diff só dos arquivos fora de `docs/` (manifestos, `pnpm-lock.yaml`, `web/src/test/setup.ts`, `web/src/features/percepcao/percepcao.test.tsx`).
- `git -C /home/rodrigoisensee/MetricasDSPD-041 log --oneline d9a9b4c..c61b6c1`.

## Entregar
- (E6, E6.3) Com a ferramenta Write ou Edit, no `docs/qa/041-estabilidade.md`: `commit:` = o sha40 de c61b6c1 (`git rev-parse c61b6c1`) e uma seção curta registrando o delta 4b249bc..c61b6c1 (vem da develop, já mesclada com os pareceres dela) e a prova (os checks obrigatórios da CI no head c61b6c1 em pass, e2e do run de push 40607924785); o reteste das 3 falhas e a E2E completa com 2 workers do E6.3 já estão no parecer (4b249bc) e não se repetem localmente, pela decisão técnica do Jarvis no Histórico do pedido (2026-10-27); veredito mantido ou mudado com o motivo. Commit só do parecer, com `Cartão: K-138` e `Cartão: K-149`, `git add` explícito por caminho, sem push. Outros dois papéis commitam na mesma worktree em paralelo: se aparecer `index.lock`, espere alguns segundos e repita.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

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
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; o merge do PR #150 vem depois desta (outra instância)
- A `feature/041-homolog-aprovada` e a worktree -041b; mudar código ou testes; push, PR e merge (a próxima instância do tech-lead faz); os pareceres dos outros papéis; rodar suítes de teste locais; `homolog` e `main`; o quadro; ler ou editar o `.env`; a worktree -026.

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
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-27): o hook `parecer` barrou o merge do PR #150 porque `docs/engineering/fluxo-homologacao.md` (e o resto da develop trazida em c61b6c1) mudou depois do `commit:` dos pareceres (4b249bc); o hook confere no modo estrito, sem base, de propósito. Caminho conforme: os três pareceres revalidam o delta 4b249bca8ee8b653878b6cb96d100f965203bfc9..c61b6c1 e passam a apontar para c61b6c1; nada é contornado.
- Teste local: nenhum, pela decisão técnica do Jarvis no Histórico do pedido (2026-10-27, prova do QA na revalidação) (o delta é a develop já mesclada e verde; os checks da CI do PR #150 no head c61b6c1 estão em pass, e2e do run de push 40607924785 em pass). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais. O hook só registra a autoria de um parecer gravado com Write ou Edit; `sed -i` e scripts não contam.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do parecer
- PQ-2 (cmd): `grep -c '^commit: c61b6c1' /home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain -- docs/qa/041-estabilidade.md` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff c61b6c1 --name-only -- . ':!docs/reviews' ':!docs/qa' ':!docs/security'` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
