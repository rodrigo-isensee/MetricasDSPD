Agente destino: forge:devops-engineer
Pedido: docs/pedidos/034-subir-a-main-para-navegar.md
Branch: main (só leitura, worktree destacada)   Base: main   Base-sha: 9180c7e098bff8a2eb7c62b35f2210387735d2c3

## Objetivo
Subir localmente o sistema no commit atual da `main` (9180c7e) para o dono navegar no navegador, pelo pedido do usuário de 2026-10-19: "suba a versao main para eu navegar". Etapa E1.1 do pedido 034.

## Ler
- `docs/pedidos/034-subir-a-main-para-navegar.md` (Escopo, Suposições).
- `docs/engineering/fluxo-homologacao.md`, só a parte do ambiente local (`homolog:subir`), e `tools/homolog/src/ambiente.ts` (nome do arquivo de ambiente e portas).

## Entregar
- (E1) Criar a worktree destacada `git -C /home/rodrigoisensee/MetricasDSPD worktree add --detach /home/rodrigoisensee/MetricasDSPD-main 9180c7e098bff8a2eb7c62b35f2210387735d2c3`.
- (E1) Copiar para a worktree o arquivo de ambiente local que o `homolog:subir` lê (o nome está em `tools/homolog/src/ambiente.ts`), a partir de `/home/rodrigoisensee/MetricasDSPD`, sem commitar nem imprimir o conteúdo (credenciais só em `.env`, regra inviolável do CLAUDE.md). Se o arquivo não existir, pare e relate.
- (E1) Na worktree, subir o ambiente com `pnpm run homolog:subir` (Docker Compose com `--build`; o postgres de desenvolvimento `metricasdspd-postgres-1` já usa a porta 5432: se houver conflito de porta, relate em vez de derrubar o contêiner existente). Se o comando exigir dependências do Node não instaladas, pare e relate (devops não roda `pnpm install`).
- (E1) Conferir que a interface responde (por exemplo `curl -sS -o /dev/null -w '%{http_code}' <url>`) e relatar o endereço exato para o navegador e como derrubar depois (`pnpm run homolog:derrubar` na worktree).

## Fora do escopo
- "E1.2 (dono): navegar e, ao terminar, pedir para derrubar." · etapa do dono.
- Commit, merge ou push em qualquer branch; mudar código, compose ou `.github/`; derrubar ou mexer no postgres de desenvolvimento ou nas worktrees `-030` e `-011-fase2`; os pedidos 030 e 033.

## Decisões e restrições
- Pedido do usuário (pedido 034, 2026-10-19): "suba a versao main para eu navegar".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: a `main` só é lida (worktree destacada, sem commit). R-CONFORMIDADE: bloqueio não se contorna; vira relato. Credenciais não aparecem em saída nem em relatório.
- Teto: a subida com `--build` é a única tarefa pesada agora.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-main rev-parse HEAD` · espera: igual '9180c7e098bff8a2eb7c62b35f2210387735d2c3'
- PQ-2 (cmd): `curl -sS -o /dev/null -w '%{http_code}' <endereço da interface relatado>` · espera: igual '200'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-main status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o endereço para o navegador, os contêineres que subiram e como derrubar; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
