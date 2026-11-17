---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: ffcafe2c2df5c95336fbf6621c0167ef9bc8087d
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: script `ac:criterios` e passos de base no roteiro da VM (K-396, E7.398, review E7.401)

## Escopo lido
`git diff origin/develop...ffcafe2c` (Base-sha `8a40f662`): `server/package.json` (+1, script `ac:criterios`), `docs/devops/105-implantacao-vm.md` (seção 2.1, item 4a, +6) e `docs/devops/105-roteiro-dono.md` (seção 5, +8). Uma linha de código; dentro do teto M14. Sem guarda nova no diff (o `criterios-ac.ts` já existia na `develop`; só ganhou o script).

## Ordem dos passos contra os comandos da `develop`
- **Existem na `develop`** (`server/package.json`): `ac:reprojetar-etapas` (`reprojetar-etapas-ac.ts`, migrador, grava `099:D-7-528` via `registrarCriterioD7528`), `ac:reprojetar-fluxo` (`reprojetar-fluxo-ac.ts`, migrador), `ac:criterios` (novo, `criterios-ac.ts`, migrador, idempotente por `referencia`) e, na raiz, `db:migrate` (`scripts/db.sh migrate [up|down [N]|redo]`). A lista de `CRITERIOS_ACELERATO` citada no item 4a bate com as 8 referências do módulo (`056:D-7`, `056:D-10`, `066:S8-com-resposta`, `069:L9-b-campos-etapa`, `069:L9-c-ordem-fluxo`, `105:S11-avaliacao-18b`, `105:S11-conversao-avaliacao`, `105:S8-so-respondidos`), o que confere com as 8 marcas da 1ª execução do autor.
- **Ainda não estão na `develop`**: `ac:reprojetar-escala` e a migração 0040 (a última na `develop` é a 0039). Estão em `origin/feature/105-s1-escala-p1-p5` (`da8b3de9`) com os mesmos nomes, e lá `105:S1-escala-p` entra em `CRITERIOS_ACELERATO`; o roteiro os põe sob a condição "só quando a 0040 existir na versão liberada", o que está certo. A sequência reprojetar com a coleta parada, `ac:criterios` e religar os timers é a do parecer de devops do S1 (`docs/devops/105-s1-escala-p.md`, "Ordem na VM") e fecha os recomendados A1 a A3 dele.
- **Nomes de timers** (`metricas-coleta-acelerato.timer`, `metricas-coleta-acelerato-releitura.timer`) existem em `deploy/systemd/`.
- **Onde a ordem quebra:** na VM, o item 2 (`up -d`) já roda o serviço `migrate` antes da API (`docker-compose.prod.yml:18-20` e `depends_on ... service_completed_successfully` em `:44`). Uma versão com a 0040 chega ao item 4a já migrada; o passo condicional (1) backup vem **depois** da migração e o (2) `db:migrate` não faz nada. A volta segura que o próprio roteiro prescreve é "restaurar o backup anterior à migração" (`105-implantacao-vm.md:205` e `:252`), e a trava do `down` aceita esse backup tardio por ser "de hoje". Ver A1.
- **Rollback da 0040 no item 4a:** reescreve o rollback geral sem os passos 0 e 1 dele (`105-implantacao-vm.md:250-251`: parar os quatro timers e `docker compose down` antes do `down`); com a API e a coleta do código novo no ar, a coluna some sob elas. Ver A2.

## Verificações e ferramentas
- Sonda S1 (abaixo): o script novo chega ao `criterios-ac.ts` pelo `pnpm --filter`. Não rodei contra banco; cito a prova do autor (Postgres descartável: 8 marcas na 1ª execução, 0 na 2ª).
- Sem PR para a branch: a suíte fica para o CI do PR; não afirmo CI verde neste head. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Segurança e pipeline: o `devops-engineer` e o `security-engineer` dão parecer próprio; não os refaço.

## Sondas
- S1 · `pnpm --filter @metricas-dspd/server run ac:criterios x` em ffcafe2c · espera: o script resolve para `criterios-ac.ts` e recusa a data inválida com saída 2 · obtido: `ac:criterios: tsx src/entradas/criterios-ac.ts x`, `Exit status 2`

## Achados
- A1 (bloqueante) docs/devops/105-implantacao-vm.md:103 · o backup da 0040 vem depois da migração: o `up -d` do item 2 já a aplica, e a volta segura (`:205`, `:252`) exige backup anterior. Pôr o backup antes do item 2 quando a versão trouxer a 0040.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:104 · o rollback da 0040 omite os passos 0 e 1 do rollback geral (`:250-251`: parar os timers e `compose down` antes do `down 1`). Remeter ao rollback geral.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:99 · "imprimem só contagens" não vale para o `ac:criterios`, que imprime as referências gravadas (linha 102). Ajustar o cabeçalho.
- A4 (recomendado) docs/devops/105-roteiro-dono.md:226 · o `db:migrate` do 0.2 já aplica a 0040, com backup antes; o "backup, `db:migrate`" da seção 5 é repetição. Melhor como passo 0.4, antes da coleta religada (seção 3).
- A5 (recomendado) server/src/entradas/criterios-ac.ts:15 · agora comando de produção, sem o `catch` com `categoriaDoErro` dos irmãos `reprojetar-*-ac.ts`: erro do banco sai como pilha não tratada. Alinhar (o `security-engineer` decide se pesa).
