Agente destino: forge:tech-lead
Pedido: 071-release-069-070
Tipo: codigo
Branch: homolog   Base: main   Base-sha: 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe
Etapa: pedido-de-merge-ao-dono   Cobre: E1.6

## Objetivo
Abrir o PR de release da homolog (9a5705b566cf0d66f5840f10730fbac9c64ee261, com a release 071 e o portão verde) para a main, sem merge: o merge é do dono (pedido 071, E1.6, K-222). Sem worktree: tudo pelo `gh` a partir de `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/main..origin/homolog` (o que a release leva), o `CHANGELOG.md` da homolog, os pareceres `docs/reviews/071-release.md`, `docs/qa/071-release.md` e `docs/security/071-release.md` e `docs/engineering/fluxo-homologacao.md` (o check homolog-aprovada e o PR de release).

## Entregar
- "E1.6 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." (E1.6)
- (E1) (E1.6) `forge-check pr 071-release-069-070 --ref origin/homolog --base origin/main` e relatar a saída; conferir que o check `homolog-aprovada` aparece verde para a ponta 9a5705b5; abrir o PR `homolog` → `main` com o corpo pelo `--body-file` num arquivo escrito pela ferramenta Write: o que a versão traz (os PRs 222, 223, 230 a 236, uma linha cada, e as notas do CHANGELOG da release 071), os pareceres da release, o portão da homologação verde (run 42084351461) e, em "o que o dono faz depois do merge", o A3 do review: rodar o `ref:sync-calendario` na base (sem ele a referência do calendário fica vazia e sem a versão de critério); esperar os checks do PR por chamadas curtas com pausa (sem `--watch`), cada chamada abaixo de 2 minutos, e relatar o estado; NÃO mesclar, NÃO aprovar e NÃO usar `--admin`; o merge na main é do dono.

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
- 2026-11-05 15:02: PR 235 mesclado (E1.4): docs/071-release na develop por squash em c8a55d63, checks verdes, --match-head-commit bdf8f067, sem --admin; forge-check pr aprovado (QA isento, só .md). DECISÃO TÉCNICA (Jarvis): E1.5 com o tech-lead, PR da develop c8a55d63 para a homolog por merge commit com o portão verde, sem worktree, tudo pelo gh a partir do clone principal; limpeza da docs/071-release e da worktree 052f depois da E1.6.
- 2026-11-05 15:43: Promoção à homolog feita (E1.5): PR 236 develop para homolog por merge commit em 9a5705b5, --match-head-commit c8a55d63, sem --admin; forge-check pr aprovado (review, qa, revisão de segurança); portão da homologação verde (run 42084351461) e CI da homolog verde (42084351452). Ação do dono agora: rodar ref:sync-calendario na base da homolog (A3 do review). DECISÃO TÉCNICA (Jarvis): E1.6 com o tech-lead, PR de release da homolog 9a5705b5 para a main, sem merge; a develop volta a receber PRs (L9-c, pareceres que faltam).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O GitHub precisa também de `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- NÃO tocar: código, testes, dependências, o CHANGELOG, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, as worktrees, a `develop` e a `homolog`; a `main` só muda pelo merge do dono.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): review da release (develop contra homolog), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (L7-a grava em tabelas de referência), na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/071-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 071." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head homolog --base main --state open --json headRefOid` · espera: contém '9a5705b566cf0d66f5840f10730fbac9c64ee261'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
