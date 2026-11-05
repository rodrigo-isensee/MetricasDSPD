Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9c-projecao   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.2

## Objetivo
Segunda volta do lote L9-c do 069: corrigir o A1 bloqueante do review da volta (fronteira de importação do comando de apoio) e os recomendados A4 e A5, na branch feature/069-l9c-projecao (ponta a63d07f9) (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- O parecer `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/069-l9c-projecao:docs/reviews/069-zz5-l9c.md` (A1 a A5) e `server/eslint.config.js` (regra de fronteira, linha 48); `server/src/apoio/apoio-l9c.ts` e `server/src/modulos/acelerato/index.ts`.

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E4) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9c-projecao` (se tiver mudança local, pare e relate); A1: `server/src/apoio/apoio-l9c.ts` passa a importar o módulo acelerato só pelo `index.ts` (exportar lá o que faltar) e `src/apoio/**` entra na lista de pastas da regra de fronteira em `server/eslint.config.js`, com o `npx eslint --print-config src/apoio/apoio-l9c.ts` mostrando a regra `no-restricted-imports` ativa; A4: valor só de espaços não conta como preenchido em `camposEtapa` (igual à consulta B, que usa TRIM), com teste; A5: teste pg de versão nova de critério quando a lista etapa_fluxo muda (desenho §6), com a lista de teste semeada no próprio teste.
- (E4) (E1.2) Rodar `npx eslint .` com cwd em `server/` (rc=0), o vitest do server e dos pacotes com cobertura 100 por cento (no máximo 2 workers), `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052c add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9c-projecao`; sem PR; no relatório, a contagem de linhas de código e teste do lote inteiro contra a base b8b2a22b (sem .md) para a linha `teto: excedido`.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "B" (resposta à pergunta "No Acelerato, a lista de campos de etapa de cada chamado vem na ordem das etapas por onde ele passou? A) Sim, vem nessa ordem. B) Não vem, ou não sei. A regra muda para outro critério: vale o valor da etapa que vem por último no desenho do fluxo de atendimento, não na passagem real do chamado"): no campo repetido em várias etapas, o critério "etapa mais recente pela qual o chamado passou" da decisão "A" de 2026-11-05 é trocado por "vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento"; um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-1, de onde vem a ordem das etapas no desenho do fluxo de atendimento; opções: A uma lista escrita pelas pessoas que configuram o Acelerato e pelo dono, guardada com versão; B a tabela de 11 etapas do briefing §3.4; C confirmar com quem conhece o Acelerato que a lista de etapas do workflow vem na ordem do desenho): a ordem vem de uma lista escrita pelas pessoas (WS4) e pelo dono, versionada na referência (etapa_fluxo); preencher a lista é trabalho de pessoas, não do time.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-2, etapa fora da lista do fluxo ou empate entre etapas na mesma posição com valores diferentes; opções: A o campo fica vazio com contagem; B vale o último valor na ordem devolvida pelo Acelerato): o campo fica nulo com contagem, sem escolher valor por palpite.
- DECISÃO DO DONO (2026-11-05): "A" (consultas de apoio do L9-c, P-L9C-3; opções: A o time cria um comando que usa a conexão da coleta, roda só as duas consultas e mostra só as contagens, para o dono rodar numa linha; B o dono roda as consultas no cliente de banco): o node-backend cria o comando de apoio só leitura (só contagens), com review e segurança, junto com a volta do L9-c; o dono o roda no terminal.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido. [Nota do Jarvis: o critério de ordem desta linha foi trocado pelo dono na decisão "B" de 2026-11-05, na resposta à opção B, que dizia "a regra muda para outro critério"; o "vazio nunca apaga" segue valendo.]
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 16:05: Review da volta do L9-c reprovado: parecer docs/reviews/069-zz5-l9c.md em a63d07f9 (commit: d60f269a). A1 (bloqueante): server/src/apoio/apoio-l9c.ts importa 4 arquivos internos do módulo acelerato, e src/apoio fica fora da regra de fronteira do eslint (server/eslint.config.js:48), por isso o eslint passou. Resolvidos: A1 anterior (ordem da Q6), regra de fora da lista e empate, fluxo_sha256, versão de critério, comando só conta e só lê; decisões do autor fora do brief aceitas. Teto: 852 linhas, exceção aceita com a linha teto: excedido recontada no PR (A2). Recomendados: A3 recorte do comando é constante e pode divergir do ref_dominio; A4 valor só de espaços conta como preenchido no código e a consulta B o descarta; A5 teste pg de versão nova da lista. MELHORIA (técnica do projeto): a regra de fronteira só vale para as pastas listadas; pasta nova em src/ escapa sem aviso (cartão). DECISÃO TÉCNICA (Jarvis): volta ao node-backend com A1, A4 e A5 e os recomendados da segurança ficam para a CI; depois review, segurança só do delta e QA em série.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, os pareceres, as ADRs, a lista fechada de nomes de campos (listas-fechadas.ts) além de ler dela, o conteúdo da lista etapa_fluxo, o contrato da API, a constante AJUSTE_PRIORIDADE_COM_FONTE, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only a63d07f9 origin/feature/069-l9c-projecao -- server/eslint.config.js server/src/apoio` · espera: linhas>=2
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052c/server && npx eslint --print-config src/apoio/apoio-l9c.ts` · espera: contém 'no-restricted-imports'
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052c/server && npx eslint .` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).