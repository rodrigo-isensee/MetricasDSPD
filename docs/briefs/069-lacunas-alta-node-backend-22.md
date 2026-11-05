Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9c-projecao   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.2

## Objetivo
Terceira volta do lote L9-c do 069 (A1, A4 e A5 da segunda volta já resolvidos em e62f3cd0, review aprovado em d1f7e05e): corrigir o teste pg que falhou na CI do PR 238 (coluna errada em dim_chamado_versao), na branch feature/069-l9c-projecao (ponta 2b8f71ef03bbf9b1c839fc541a64f7e2afb48ec9) (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `server/tests/acelerato-l9c.pg.test.ts` (linha 113 e o caso "versão nova de critério") e a migração que cria `dim_chamado_versao` em `server/src/plataforma/db/` (nomes reais das colunas de vigência); o log da falha: `gh run view --repo rodrigo-isensee/MetricasDSPD --job 127485364815 --log-failed` (erro 42703, coluna vigente_ate não existe, dica vigente_de).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E4) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9c-projecao` (se tiver mudança local, pare e relate); corrigir em `server/tests/acelerato-l9c.pg.test.ts` o nome da coluna de vigência de `dim_chamado_versao` para o nome real da migração e conferir, pela migração, todos os outros nomes de tabela e coluna que esse arquivo de teste usa; só o teste muda, nenhum código de produção; se houver PostgreSQL disponível, rodar o test:pg desse arquivo e relatar; sem banco, dizer isso no relatório.
- (E4) (E1.2) Rodar `npx eslint .` com cwd em `server/` (rc=0) e o `tsc` do server; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052c add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9c-projecao`; não mexer no PR 238 (o tech-lead retoma).
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "B" (resposta à pergunta "No Acelerato, a lista de campos de etapa de cada chamado vem na ordem das etapas por onde ele passou? A) Sim, vem nessa ordem. B) Não vem, ou não sei. A regra muda para outro critério: vale o valor da etapa que vem por último no desenho do fluxo de atendimento, não na passagem real do chamado"): no campo repetido em várias etapas, o critério "etapa mais recente pela qual o chamado passou" da decisão "A" de 2026-11-05 é trocado por "vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento"; um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-1, de onde vem a ordem das etapas no desenho do fluxo de atendimento; opções: A uma lista escrita pelas pessoas que configuram o Acelerato e pelo dono, guardada com versão; B a tabela de 11 etapas do briefing §3.4; C confirmar com quem conhece o Acelerato que a lista de etapas do workflow vem na ordem do desenho): a ordem vem de uma lista escrita pelas pessoas (WS4) e pelo dono, versionada na referência (etapa_fluxo); preencher a lista é trabalho de pessoas, não do time.
- DECISÃO DO DONO (2026-11-05): "A" (P-L9C-2, etapa fora da lista do fluxo ou empate entre etapas na mesma posição com valores diferentes; opções: A o campo fica vazio com contagem; B vale o último valor na ordem devolvida pelo Acelerato): o campo fica nulo com contagem, sem escolher valor por palpite.
- DECISÃO DO DONO (2026-11-05): "A" (consultas de apoio do L9-c, P-L9C-3; opções: A o time cria um comando que usa a conexão da coleta, roda só as duas consultas e mostra só as contagens, para o dono rodar numa linha; B o dono roda as consultas no cliente de banco): o node-backend cria o comando de apoio só leitura (só contagens), com review e segurança, junto com a volta do L9-c; o dono o roda no terminal.
- DECISÃO DO DONO (2026-11-05): "A" [SUBSTITUÍDA no critério de ordem pela decisão "B" de 2026-11-05; só o "vazio nunca apaga" segue valendo] (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 16:45: PR 238 do L9-c aberto (https://github.com/rodrigo-isensee/MetricasDSPD/pull/238) e parado: o job banco (test:pg) falhou em server/tests/acelerato-l9c.pg.test.ts:113 (coluna vigente_ate não existe em dim_chamado_versao; erro 42703). Escape registrado (QA aprovou sem rodar o pg, sem banco no sandbox). Contagem contra a develop atual: 1238 linhas. DECISÃO TÉCNICA (Jarvis): volta ao node-backend para corrigir a coluna do teste pg (ler o nome real na migração), depois review por delta e o tech-lead retoma o PR 238.
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only 2b8f71ef03bbf9b1c839fc541a64f7e2afb48ec9 origin/feature/069-l9c-projecao` · espera: igual 'server/tests/acelerato-l9c.pg.test.ts'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c grep vigente_ate origin/feature/069-l9c-projecao -- server/tests/acelerato-l9c.pg.test.ts` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).