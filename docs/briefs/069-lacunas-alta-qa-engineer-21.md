Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7b-leitura   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: qa   Cobre: E1.5

## Objetivo
QA do lote L7-b do 069 (as métricas do fluxo e da sustentação leem a referência de calendário e feriados), na ponta ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7b-leitura`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d show ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d --stat` e `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d` (o lote inteiro contra a develop; o desenho em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md, lote 4, e a ADR 0027).

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E5) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7b-leitura`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; rodar `npx eslint .` com cwd em `server/` (rc=0); conferir o teste de paridade (nenhum número muda com os feriados nacionais 2025-2026), que cada domínio lê a própria classe do calendário, que BusinessMap e Acelerato não se misturam e que nada calcula dia útil fora da T2.5; registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/069-zz3-l7b.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7b-leitura`; sem PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa (a leitura por domínio)
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 12:25: L7-b entregue: o node-backend entregou ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d em feature/069-l7b-leitura: lerCalendarioVigente(db, S, dominio, classe) comum no módulo de referência (a aba do apontamento só delega), carregarBM lê businessmap/fluxo e carregarAC lê acelerato/sustentacao pela T2.5 (criarCalendario), sem referência vale CALENDARIO_PADRAO; teste de paridade com os feriados nacionais 2025-2026 e testes de domínio, feriado novo e versão nova; server 1755 testes e pacotes com cobertura 100%, eslint, prettier e docs:check verdes; contrato da API sem mudança. DECISÃO TÉCNICA (Jarvis): review e QA do lote em paralelo na worktree 052d, pareceres no nome 069-zz3-l7b.md (por último na ordem do pedido); sem gatilho de segurança (o desenho marca o L7-b só leitura, o papel dspd_api já lê as tabelas); depois o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l7b-leitura`, `commit: ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7b-leitura` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/069-l7b-leitura:docs/qa/069-zz3-l7b.md` · espera: contém 'commit: ddbc45a91db0eb0eb226e5cceaefcb2f6830d07d'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).