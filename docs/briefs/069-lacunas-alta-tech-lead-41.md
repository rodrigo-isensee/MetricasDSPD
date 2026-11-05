Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9c-projecao   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: review   Cobre: E1.4

## Objetivo
Code review do lote L9-c do 069 (projeção das colunas da fatia F3 na dim_chamado, regra do campo repetido e previsao_retorno booleano), na ponta 56bee4530c962a651adee2565e986b3bed4cc0ca (pedido 069, E1.4, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/069-l9c-projecao`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c show 56bee4530c962a651adee2565e986b3bed4cc0ca --stat` e `git -C /home/rodrigoisensee/MetricasDSPD-052c diff b8b2a22b77f80d9445a4af7aca7456ed6f7f731a...56bee4530c962a651adee2565e986b3bed4cc0ca` (o lote inteiro contra a base); o desenho em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md (seção E4 · L9, Lote L9-b e Lote L9-c, D-L9-1); a ADR 0023 item 4; a consulta Q6 em server/src/modulos/acelerato/sql.ts e docs/architecture/fontes/acelerato-mysql.sql.

## Entregar
- "E1.4 (tech-lead): code review por lote." (E1.4)
- (E4) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9c-projecao`; revisar o lote contra o desenho e as decisões do dono abaixo: se a ordem das linhas da Q6 é cronológica pelas etapas (a regra "etapa mais recente" depende disso; se não for ou não houver como garantir, achado bloqueante), o USING NULLIF(previsao_retorno IS NOT NULL, false) e a guarda da migração 0035, a recriação das 3 views, se os arquivos fora do módulo acelerato (mapa.ts, repositorio.ts, seed.ts, snapshot, testes) cabem no lote, o tamanho frente ao teto de PR e os testes; parecer em `docs/reviews/069-zz4-l9c.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9c-projecao`; sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:42: L9-c entregue: o node-backend entregou 56bee4530c962a651adee2565e986b3bed4cc0ca em feature/069-l9c-projecao: as 7 colunas da F3 no normalizador e no projetor; campo repetido: último valor preenchido vence, vazio nunca apaga, fora do domínio vira nulo com contagem; migração 0035 troca previsao_retorno para booleano nas duas dimensões com guarda (recusa se houver valor), recriando 3 views da 0009 e down simétrico; testes pg (linhas nulas iguais, falha com valor, paridade S2, S3, S4, S8, S10); server 1762 testes e pacotes com cobertura 100%, eslint, prettier e docs:check verdes. Desvio 1: o USING do brief (previsao_retorno IS NOT NULL) transformaria nulo em false; usou NULLIF(previsao_retorno IS NOT NULL, false), linha nula segue nula (erro do Jarvis no brief, corrigido pelo autor). Desvio 2: arquivos além do módulo acelerato (metricas/mapa.ts com previsao_retorno nulo para o S9, que é SDR; repositorio.ts; seed.ts; snapshot, migracoes, checksums; testes pg com o down da 0035; data-model.md). Riscos: "etapa mais recente" pela ordem das linhas da Q6, sem kanbanStatusKey nem ORDER BY; a fusão do campo repetido mudou camposEtapa em allow-list.ts sem mudar a lista de campos; prioridade_ajustada_manualmente só vira true com o valor exato SIM. DECISÃO TÉCNICA (Jarvis): review, QA e segurança em paralelo na worktree 052c, pareceres no nome 069-zz4-l9c.md; o review decide se a ordem da Q6 é cronológica (se não for, achado bloqueante e volta ao autor) e se os arquivos do desvio 2 cabem no lote; a segurança confere a mudança em allow-list.ts e a migração; o PR espera a promoção da release 071.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l9c-projecao`, `commit: 56bee4530c962a651adee2565e986b3bed4cc0ca`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9c-projecao` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052c add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/069-l9c-projecao:docs/reviews/069-zz4-l9c.md` · espera: contém 'commit: 56bee4530c962a651adee2565e986b3bed4cc0ca'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).