Agente destino: forge:tech-lead
Pedido: 071-release-069-070
Tipo: codigo
Branch: docs/071-release   Base: develop   Base-sha: 39b761d4d04e14457690a547ba1f39d65ff2e8d7
Etapa: merge-integracao   Cobre: E1.4

## Objetivo
PR da docs/071-release (CHANGELOG e pareceres de review, QA e segurança da release) para a develop, squash com a CI verde, antes da E1.5 (pedido 071, E1.4, K-222). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/071-release`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe..39b761d4d04e14457690a547ba1f39d65ff2e8d7` (os PRs que a release leva) e `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe...39b761d4d04e14457690a547ba1f39d65ff2e8d7`; os pareceres já aprovados de cada PR estão em `docs/reviews/`, `docs/qa/` e `docs/security/` da develop.

## Entregar
- "E1.4 (tech-lead): PR da docs/071-release para a develop, squash com a CI verde, antes da E1.5." (E1.4)
- (E1) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin docs/071-release` (ponta com o CHANGELOG 555a002c e os pareceres de segurança 7bfec8fe, review fc7f08f3 e QA bdf8f067); `forge-check pr 071-release-069-070 --ref origin/docs/071-release --base origin/develop` limpo; PR para a develop com título citando o pedido 071 e a release, corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, com os três pareceres (docs/reviews, docs/qa e docs/security 071-release.md) e os achados recomendados (A1 a A3 do review, A1 da segurança); o A3 do review (rodar ref:sync-calendario na homolog) fica para o corpo do PR de release, que é outra etapa; esperar os checks por chamadas curtas com pausa (sem `--watch`); com todos verdes, `gh pr merge docs/071-release --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "isso" (resposta ao recibo: "vou fazer: levar à main o que está na develop e não está na homolog (069 L7-a e L7-b; 070 simulado por cartão, correção do contraste, E2E e ADR 0028 vigente; Forge 0.32.0) por review, QA e segurança da release, develop para homolog com o portão verde e PR de release homolog para main aberto; não vou fazer: merge na main, incluir o L9-c; é isso?"): release confirmada com esse escopo.
### Do registro citado docs/pedidos/069-lacunas-alta.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-05): "B" (resposta à pergunta "No Acelerato, a lista de campos de etapa de cada chamado vem na ordem das etapas por onde ele passou? A) Sim, vem nessa ordem. B) Não vem, ou não sei. A regra muda para outro critério: vale o valor da etapa que vem por último no desenho do fluxo de atendimento, não na passagem real do chamado"): no campo repetido em várias etapas, o critério "etapa mais recente pela qual o chamado passou" da decisão "A" de 2026-11-05 é trocado por "vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento"; um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido. [Nota do Jarvis: o critério de ordem desta linha foi trocado pelo dono na decisão "B" de 2026-11-05, na resposta à opção B, que dizia "a regra muda para outro critério"; o "vazio nunca apaga" segue valendo.]
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/070-simulado-por-cartao.md (Depende de; todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
### Do Histórico deste pedido, docs/pedidos/071-release-069-070.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:57: Release começa: a develop está em 39b761d4d04e14457690a547ba1f39d65ff2e8d7 com PRs 222, 223, 230, 231, 232, 233 e 234; a homolog em 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe. DECISÃO TÉCNICA (Jarvis): o tech-lead cria docs/071-release da develop na worktree 052f, escreve primeiro as notas desses PRs no CHANGELOG.md (commit e push) e só então revisa (lição do 068: CHANGELOG depois do review invalidou os pareceres); QA e segurança começam quando o commit do CHANGELOG estiver no remoto e citam esse sha em commit:; pareceres no nome 071-release.md.
- 2026-11-05 14:37: QA da release aprovado: parecer docs/qa/071-release.md em bdf8f067 (commit: 555a002c), sem bugs nem achados; 4954 testes com cobertura 100% (server 1755, metricas 1262, contratos 208, mock 258, web 1471), 0 falhas; eslint server e web, prettier e docs:check verdes; pg e E2E ficam no portão da homolog. Os três pareceres da release estão na docs/071-release; próximo passo E1.4 (PR para a develop).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O GitHub precisa também de `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- NÃO tocar: código, testes, dependências, o CHANGELOG, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): review da release (develop contra homolog), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (L7-a grava em tabelas de referência), na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 071." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/071-release --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
