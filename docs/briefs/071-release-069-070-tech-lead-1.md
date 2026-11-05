Agente destino: forge:tech-lead
Pedido: 071-release-069-070
Tipo: codigo
Branch: docs/071-release   Base: develop   Base-sha: 39b761d4d04e14457690a547ba1f39d65ff2e8d7
Etapa: review   Cobre: E1.1

## Objetivo
Review da release 071: a develop 39b761d4d04e14457690a547ba1f39d65ff2e8d7 contra a homolog 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe (pedido 071, E1.1, K-222). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/071-release` (nova).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe..39b761d4d04e14457690a547ba1f39d65ff2e8d7` (os PRs que a release leva) e `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe...39b761d4d04e14457690a547ba1f39d65ff2e8d7`; os pareceres já aprovados de cada PR estão em `docs/reviews/`, `docs/qa/` e `docs/security/` da develop.

## Entregar
- "E1.1 (tech-lead): review da release (develop contra homolog), parecer na branch docs/071-release." (E1.1)
- (E1) (E1.1) primeiro criar a branch: `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin`, `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c docs/071-release 39b761d4d04e14457690a547ba1f39d65ff2e8d7` e `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/071-release` (sem commit novo); escrever no `CHANGELOG.md` as notas dos PRs que a release leva (PRs 222, 223, 230, 231, 232, 233 e 234), no formato das entradas anteriores, commit só desse arquivo com a mensagem `docs(changelog): notas da release 071` e push, para o QA e a segurança começarem; depois revisar a release: cada PR da lista tem review aprovado, nada entrou sem portão, a migração e a ordem dos PRs fazem sentido para a homolog; parecer em `docs/reviews/071-release.md` gravado inteiro pela ferramenta Write (sem editar depois), com `commit:` igual ao sha do commit do CHANGELOG; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/071-release`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "isso" (resposta ao recibo: "vou fazer: levar à main o que está na develop e não está na homolog (069 L7-a e L7-b; 070 simulado por cartão, correção do contraste, E2E e ADR 0028 vigente; Forge 0.32.0) por review, QA e segurança da release, develop para homolog com o portão verde e PR de release homolog para main aberto; não vou fazer: merge na main, incluir o L9-c; é isso?"): release confirmada com esse escopo.
### Do registro citado docs/pedidos/069-lacunas-alta.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/070-simulado-por-cartao.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
### Do Histórico deste pedido, docs/pedidos/071-release-069-070.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:57: Release começa: a develop está em 39b761d4d04e14457690a547ba1f39d65ff2e8d7 com PRs 222, 223, 230, 231, 232, 233 e 234; a homolog em 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe. DECISÃO TÉCNICA (Jarvis): o tech-lead cria docs/071-release da develop na worktree 052f, escreve primeiro as notas desses PRs no CHANGELOG.md (commit e push) e só então revisa (lição do 068: CHANGELOG depois do review invalidou os pareceres); QA e segurança começam quando o commit do CHANGELOG estiver no remoto e citam esse sha em commit:; pareceres no nome 071-release.md.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 071-release-069-070`, `branch: docs/071-release`, `commit:` igual ao sha do commit do CHANGELOG (o `docs(changelog)` desta branch), veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres da release são gravados ao mesmo tempo nesta branch: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin docs/071-release` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052f add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-222' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, dependências, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (L7-a grava em tabelas de referência), na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/071-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 071." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-0 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%s origin/docs/071-release -- CHANGELOG.md` · espera: igual 'docs(changelog): notas da release 071'
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/docs/071-release:docs/reviews/071-release.md` · espera: contém 'pedido: 071-release-069-070'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
