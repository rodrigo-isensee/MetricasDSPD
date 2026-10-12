# Code review: 17 métricas complementares (rodada 1)

- Branch: `feature/metricas-complementares` (comparada com `origin/develop`, até `15d2966`)
- Revisor: tech-lead · Data: 2026-10-11
- Referências: `CLAUDE.md`, `docs/architecture/features/metricas-complementares.md`, `docs/alinhamentos/2026-10-11-decisoes-complementares.md`, `docs/engineering/praticas.md`

## Parecer

**Ajustes necessários** (nenhum bloqueante para o QA da fase mock; 3 importantes devem ser corrigidos antes do PR).

`pnpm run pronto` verde: contratos 23, mock 145, metricas 458, server 251 (44 pulados sem PG), web 687 testes; cobertura 100% em todos os pacotes; orçamento de bundle ok (inicial 186,26 KB < 200; gráficos 111,62 KB; mock+lib 8,73 KB).

## O que foi verificado e está conforme

| Item | Situação |
|---|---|
| Hashes da base mock | `924448d4` e `b2bfd4c0` intactos (`packages/mock/src/mock.test.ts:39-40`, repetidos em `complementares.test.ts:11-12`). Extensões em streams próprios de PRNG (`packages/mock/src/complementares.ts:26-28,73-74`), fora de `BaseBM`/`BaseAC`. Nenhum cálculo das 33 existentes alterado (só `export` de `faixasBloqueio`/`Faixa` em `estado.ts` e refatoração de tipo em `acelerato/modelo.ts`). |
| Contrato do 007 | Schema de preferências `{versao, paineis:{p:{ocultar}}}` inalterado; ids novos aceitos via `CATALOGO_CARTOES`; abrir a seção é estado de visita, não entra no perfil (`ProvedorPreferencias.tsx`). |
| Percentis e < 20 | Toda estatística passa por `estatistica`/`taxa`/`publicavel`/`histograma`/`montecarlo` de `core/` (gate de 20 itens). O5, O6, O8, S9, S10 usam `percentisDe`/`medianaDe` sobre `amostraBM`/`amostraAC`; T6/E5 usam `preverTermino`/`preverItens`. Nenhum cálculo próprio de percentil. |
| BM × AC | Arquivos separados por domínio; extensões separadas (`ExtensaoBM`/`ExtensaoAC`); teste P3 troca a base do outro domínio e exige resultado idêntico para as 50. |
| Nada individual | Sem campo de pessoa nas 17; teste `metricas.test.ts` varre as 50 respostas e o OpenAPI. O16 lista os mais antigos só por `cardId`; O14 por área/sistema; T8 sem ranking nem alvo de 100%. |
| O5 | Bloqueio em coluna de execução sai do tempo de execução (`businessmap/o5.ts:33-40`), conforme decisão. |
| O11 | Requested = papel `backlog`, In Progress comprometido = papel `compromisso`, sem sexto papel (`businessmap/o11.ts`, `regras-metricas.md`). |
| S8 | Reabertura = ticket anterior indicado no campo reincidente, sem N dias e sem sintoma (`acelerato/s8.ts`); `DIAS_REABERTURA_PADRAO` e `sintoma` removidos do código. |
| S12 | Reincidente já conta, sem K; contagem e proporção por sistema na janela de 12 semanas (`acelerato/s12.ts:354-379`). |
| T8 | Card-template pai, planejado = ligado até o início, depois = entrada não planejada, por sprint e agregado só das sprints fechadas (`businessmap/t8.ts`). |
| Rótulo | Selo "Dados fictícios" em todo cartão `status: 'mock'` (`CartaoComplementar.tsx:85-96,151`) e na tabela de `/metricas` (`catalogo/linhas.ts:39`). |
| `Math.min/max` com spread | Nenhuma ocorrência nas linhas adicionadas. |
| Lazy da seção | `<details>` fechado por padrão e filhos montados só com `aberta` (`MaisMetricas.tsx:55`): nenhuma consulta das 17 antes de abrir. |
| Segurança | Sem segredo, sem dependência nova, sem SQL novo, sem migração. |

## Achados

### Importantes (corrigir antes do PR)

1. **Ausência de extensão vira 0% publicado, e o servidor injeta o mock sempre.**
   - `server/src/app.ts:60`: `extensoes: deps.extensoes ?? extensoesMock`. O padrão vale para qualquer fonte, inclusive a real. Com cards reais, os ids não batem com o mock: T8 fica vazio, mas S8 publica 0% de reabertura com `statusMeta: 'dentro'`, S11 publica conversão de 0% e E4 mostra Manter/Evoluir zerados.
   - Mesmo sem extensão, `acelerato/s8.ts:272,293-305` (com `EXTENSAO_AC_VAZIA`) devolve `taxa(0, n)` com status `ok`, e o mesmo vale para `acelerato/s11.ts:253-256`. Isso contraria o plano, seção 2: "sem `ext` retorna resultado vazio/insuficiente".
   - Sugestão: (a) injetar `extensoesMock` só quando a fonte configurada é o mock; (b) quando `ext` é `undefined`, as partes que dependem dela (S8, conversão do S11, natureza do E4, causa do O17, reincidência do S12) devolvem `insuficiente`/`sem-dados`, nunca 0% nem "dentro da meta". Incluir um teste por métrica.

2. **"Dados fictícios" em métricas que já têm fonte real.**
   - `packages/contratos/src/cartoes.ts:63` marca `status: 'mock'` em todas as 17 complementares. Pela decisão do usuário, o rótulo vale para "cartões sem fonte real".
   - O5, O6, O8, O11, O13, O14, O16, T6, E5, S9 e S10 derivam só de `BaseBM`/`BaseAC`. Na fonte real, esses cartões apareceriam como fictícios. Hoje o efeito some porque toda a aplicação roda em mock e já é rotulada.
   - Sugestão: `status` por cartão no `secao(...)` complementar. `'mock'` só para quem depende de extensão: O17, T8, E4, S8, S11 e S12 (este, parcialmente). Ajustar `cartoes.test.ts:33-60`.

3. **O17: a fonte segue em aberto, mas a regra está como `ok` e a pendência como resolvida.**
   - A decisão diz que "o campo causa raiz virá do Metabase" e pede "confirmar se a O17 é do BusinessMap ou da Sustentação".
   - Em `docs/alinhamentos/2026-10-11-metricas-complementares-pendencias.md`, a linha O17-lista-causa-raiz registra "o campo virá do BusinessMap", o que contradiz a decisão. Em `packages/metricas/src/core/regras.ts:509-518`, O17 está com `status: 'ok'`.
   - Se a causa raiz vier do Metabase (Acelerato) e for ligada a cards do BusinessMap, o cálculo mistura BM e AC, o que viola uma regra inviolável.
   - Sugestão: reabrir a pendência `O17-fonte` com `status: 'pendente-usuario'` e corrigir o texto do documento. Não decidir por inferência.

### Menores

4. `web/src/features/preferencias/ProvedorPainelPreferencias.tsx:126`: `tudoOculto` passou a exigir que o núcleo e as complementares estejam todos ocultos. Antes, bastava ocultar o núcleo (CA-12). Ocultar os 9 do núcleo não mostra mais o estado "painel inteiro oculto". Confirmar com o UX se a mudança foi intencional e cobrir com teste.
5. Nomenclatura: o campo de origem se chama "reincidente", mas o código usa `reabertoDe` (`acelerato/extensao.ts:154`). Além disso, S8 conta o ticket **anterior** (o referenciado) e S12 conta o ticket **novo** (o que tem o campo preenchido). As duas leituras são coerentes com as decisões, mas precisam estar explícitas nas notas dos cartões e em `docs/api/metricas.md`. Sugestão: renomear para `reincidenteDe` antes da coleta real.
6. `businessmap/t8.ts:176-202`: no mock, as sprints são globais. Na coleta real cada time terá o seu card-template, e a lista "por sprint" sem filtro de equipe vai pôr sprints de times diferentes lado a lado. Registrar no plano da fase real: agregado por padrão e linhas por sprint só com uma equipe filtrada.
7. `acelerato/s9.ts:225-226`: o cumprimento da previsão compara cada pendência com a `previsao_retorno` do chamado, que é uma só. Chamados com várias pendências contam a mesma previsão mais de uma vez. Já está como pendência (`S9-cumprimento-da-previsao`); documentar o efeito na nota do cartão.
8. Histórico: `7487c63 feat(web): ... (em andamento)` e `86e1ac4 fix(web): corrige os erros de lint` indicam um commit que não passava no `pronto`. Isso vai contra a prática "o projeto compila e os testes passam em cada commit". Não é preciso reescrever o histórico já enviado; nas próximas entregas, consolidar antes de commitar.
9. `regras.property.test.ts`: há nove novas isenções da propriedade P2 (O13, O14, O16, O17, E4, S8, S9, S11, S12). Cada uma tem justificativa, mas o volume é alto. Fica o registro para o arquiteto confirmar que nenhuma esconde uma falha real de segmentação.

## Itens fora do escopo desta revisão
- `e2e/tests/complementares.spec.ts` (não rastreado, do QA) não foi revisado nem commitado aqui.
- O parecer de UX (`15d2966`) é do `ux-designer`.

## Próximo passo
Devolver os itens 1 a 3 ao `node-backend` (no item 2, o ajuste do teste de catálogo também é dele). Depois da correção, fazer uma revisão rápida (r2) só dos itens apontados e seguir para o QA.

---

# Rodada 2 (revalidação após as correções)

- Faixa revisada: `b0e9cc5..7aa4d6c` (11 commits: `5dfe47d`, `e032a78`, `4e2a431`, `51dc4b5`, `2aa8e31`, `ad777ea`, `7aa4d6c` e os de QA/UX intermediários)
- Revisor: tech-lead · Data: 2026-10-11
- Referências adicionais: `docs/alinhamentos/2026-10-11-decisoes-complementares.md` (O17 na Sustentação) e `docs/alinhamentos/2026-10-11-decisoes-delegadas-ao-time.md` (decisões 13 a 19)

## Resultado do `pnpm run pronto` (rodado nesta revisão, saída 0)

contratos 25, mock 146, metricas 460, server 252 (44 pulados sem PG), web 695 testes; cobertura 100% (statements, branches, functions, lines) nos cinco pacotes; bundle inicial 186,39 KB (< 200), gráficos 111,62 KB, exportar-pdf 132,64 KB, mock+lib 8,73 KB. O `pronto` não roda o E2E; o E2E `complementares.spec.ts` é do QA e não foi executado aqui.

## Achados da rodada 1

| Nº | Situação | Evidência |
|---|---|---|
| 1 (importante) | **Resolvido** | `server/src/app.ts:62` só injeta `extensoesMock` fora de `fonteDados === 'real'`; `DADOS_FONTE` em `server/src/plataforma/config.ts:24`, repassado em `server/src/entradas/api.ts:11`. Sem extensão: S8 `taxa(0,0)` e `statusMeta: 'sem-referencia'` (`acelerato/s8.ts:43-46`), S11 conversão insuficiente (`s11.ts:39-46`), S12 proporção insuficiente (`s12.ts:70`), E4 e O17 com lista vazia, todos com `campoDisponivel: false`; o cartão mostra "Campo sem fonte" (`CartaoComplementar.tsx:65,89`). Testes em `complementares.test.ts` e `server/tests/metricas.test.ts`. |
| 2 (importante) | **Resolvido** | `packages/contratos/src/cartoes.ts:52` (`COM_EXTENSAO_MOCK` = O17, T8, E4, S8, S11, S12); as demais complementares são `disponivel`. Teste em `cartoes.test.ts`. |
| 3 (importante) | **Resolvido** | Decisão do usuário (O17 na Sustentação, Acelerato). `acelerato/o17.ts` novo; `businessmap/o17.ts` removido; `causasRaiz` saiu de `ExtensaoBM` e foi para `ExtensaoAC`; `regras.ts:511` (O17) com `dominio: 'acelerato'`, `granularidade: 'chamado'`; contrato `O17: Sust<...>` e `METRICAS_SUSTENTACAO`. Nenhum vínculo a card do BusinessMap: BM × AC preservado. |
| 4 (menor) | Aberto | `ProvedorPainelPreferencias.tsx:126` continua exigindo núcleo + complementares ocultos para "painel inteiro oculto"; sem registro de confirmação do UX. |
| 5 (menor) | Parcial | Notas de S8/S12 agora explicitam a contagem pelo chamado reincidente. O nome `reabertoDe` (`acelerato/extensao.ts:12`) segue diferente do campo de origem "reincidente". |
| 6 (menor) | Aberto | Nada registrado no plano sobre T8 por equipe na fase real (`docs/architecture/features/metricas-complementares.md`). |
| 7 (menor) | Aberto | A nota de S9 (`web/src/features/complementares/notas.ts:146-149`) não menciona que um chamado com várias pendências conta a mesma previsão mais de uma vez. |
| 8 (menor) | Resolvido nesta faixa | Os commits novos são coerentes e cada um passa no `pronto`. |
| 9 (menor) | Aberto | Fica com o arquiteto (isenções P2). Só mudou o texto da isenção de O17. |

## Verificação de regressões

| Item | Situação |
|---|---|
| Hashes da base mock | `924448d4` e `b2bfd4c0` intactos (`packages/mock/src/mock.test.ts:39-40`). A causa raiz passou a ser sorteada em stream próprio (`complementares:causas`) sobre os chamados, fora de `BaseAC`. |
| As 33 do núcleo | Nenhum cálculo do núcleo alterado. No catálogo, só os `leiaJunto` dos cartões do núcleo mudaram (lista). |
| Contrato do 007 | Schema de preferências inalterado; o catálogo só passou de `par` para `pares` (lista), interno a `cartoes.ts`. |
| BM × AC | O17 agora é só do Acelerato; nenhuma métrica cruza os domínios. |
| < 20 itens | Sem cálculo próprio de percentil; S8/S11/S12 sem fonte saem `insuficiente`, nunca 0%. |
| Nada individual | Sem campo de pessoa nas mudanças; O17 agrupa por causa e sistema. |
| `Math.min/max` com spread | Uma ocorrência nova, no E2E (achado R2-4). |
| Segurança | Sem segredo, sem dependência nova, sem SQL, sem migração. `DADOS_FONTE` validado por zod com padrão `mock`. |

## Achados novos

### Bloqueantes
Nenhum.

### Importantes (corrigir antes do PR)

**R2-1. S8: o denominador conta como "não" o chamado sem o campo, mas a tela diz o contrário.**
- `packages/metricas/src/acelerato/s8.ts:43,46`: `taxa(r, doMes.length)` e `taxa(k, n)` usam todos os incidentes, inclusive os de `reincidenteAusente`.
- Na prática, a ausência entra no cálculo como "não reincidente". Isso contradiz a decisão 13 ("nunca converter ausência em 'não reincidente' em silêncio"), o comentário em `acelerato/extensao.ts:13` ("nunca como 'não'") e o texto do cartão em `web/src/features/complementares/sustentacao.tsx:100` ("A taxa considera só o que foi informado").
- O teste `complementares.test.ts:270-292` não confere o denominador.
- Sugestão: denominador = incidentes com o campo informado (`informados`), e `cobertura` continua mostrando o "n de N". É a leitura conjunta das decisões 13 e 14. Se o Jarvis entender que a decisão 14 fixa o denominador em todos os incidentes, então o texto da tela e o comentário precisam mudar, e a dúvida volta ao usuário. Acrescentar um teste com o valor exato da taxa.
- Devolver ao `node-backend` (cálculo) e ao `react-frontend` (texto).

**R2-2. S12 não expõe a cobertura "n de N" que a decisão 13 exige.**
- A decisão 13 diz: "S8 e S12 mostram a cobertura 'n de N'". `resultadoS12` (`packages/contratos/src/schemas.ts:1124-1145`) não tem `cobertura`. `calcularS12` (`acelerato/s12.ts:52`) conta só `reabertoDe` e trata o ausente como "não".
- Sugestão: o mesmo tratamento do S8 (cobertura por sistema ou total), com o texto no cartão e testes.
- Devolver ao `node-backend` e ao `react-frontend`.

**R2-3. O mapa "Leia junto" e o status das regras não refletem as decisões finais.**
- A decisão 19 fixa o mapa final como O3→O5,O6,O8; O4→O8; O10→O11; O15→O13,O16,O17; T1→T6; T4→T8; T5→O14; T9→T6,E5; E1→E4,E5; S1→S9,S10; S2 e S3→S8,S12; S5 e S7→S11.
- `packages/contratos/src/cartoes.ts:85-136` implementa o mapa "provisório", só dentro do mesmo painel. Divergências:
  - T4 não aponta para T8 (`:105`);
  - T5 não aponta para O14 (`:102`);
  - T9 não aponta para T6/E5 (`:109`);
  - E1 não aponta para E4 (`:116`);
  - S2/S3 apontam só para um cada (`:126,130`);
  - S5 não aponta para S11 (`:134`);
  - O15 perdeu O17 (que foi para a Sustentação).
  - Em compensação, aparecem O7→O14, E2→E4 e S6→O17, que não estão na decisão.
- Parte da decisão 19 cruza painéis (T5→O14, T9→E5, O15→O17), e o componente hoje só navega dentro do painel. Isso precisa de escolha explícita: implementar o link entre painéis ou registrar a adaptação no documento de decisões. Não decidir por inferência no código.
- Em `docs/alinhamentos/2026-10-11-metricas-complementares-pendencias.md`, as linhas 8, 10, 14, 16, 17 e 19 (O8, O16, leia-junto-mapa, E4, campos-sem-fonte-real e S9) ainda estão "Pendente", mas as decisões 15 a 19 já as resolveram.
- `packages/metricas/src/core/regras.ts:462,507,553,587,610` mantém `pendencias` em O8, O16, E4, S9 e S11. Ajustar o `status` e as pendências conforme as decisões. E4 e S11 continuam `mock` pela decisão 17, mas a regra deixa de ser dúvida.
- Devolver ao Jarvis, que roteia para o `ux-designer` (link entre painéis) e para o `node-backend`.

### Menores

- **R2-4.** `e2e/tests/complementares.spec.ts:198`: `Math.min(...nums)`/`Math.max(...nums)`, proibidos por `docs/engineering/praticas.md:35` em todos os pacotes (o lint não cobre `e2e/`).
  - O teste COMP-12 também é condicional: o mock não gera `reincidenteAusente`, então o ramo da cobertura nunca roda no E2E.
  - Sugestão: `expect(Number(m[1])).toBeLessThan(Number(m[2]))` e uma fixture que garanta cobertura parcial. Responsável: QA.
- **R2-5.** `web/src/features/complementares/CartaoComplementar.tsx:65,89`: com `campoDisponivel: false`, o cartão S12 inteiro vira "Campo sem fonte". Com isso, some também o volume por sistema e a exceção de SLA, que têm fonte real. Sugestão: no S12, esconder só a reincidência. O mesmo vale para os trimestres do E4, que derivam de `BaseBM`.
- **R2-6.** O17 continua dizendo "lista de causas provisória até a decisão final" (`sustentacao.tsx:58`, `notas.ts:96`), mas a pendência `O17-lista-causa-raiz` está como resolvida ("lista mantida"). Alinhar o texto.
- **R2-7.** `CartaoO17` (`sustentacao.tsx:27-35`): se todas as causas tiverem n = 0, a leitura diz "a causa mais frequente é Requisito, com 0 incidentes". Usar `topo.n > 0`.
- **R2-8.** A árvore tem 20 PNG de evidência de QA modificados e não commitados (`docs/qa/evidencias/b12/*`, `docs/qa/evidencias/b3/*`), fora do escopo desta entrega. O QA decide se entram no commit dele ou se são descartados. Não entram neste commit.

## Parecer da rodada 2

**Ajustes necessários.** Os três importantes da rodada 1 estão resolvidos, o `pronto` está verde com 100% de cobertura e não há regressão nas regras invioláveis (BM × AC, < 20, nada individual, hashes das 33, contrato do 007).

Antes do PR, é preciso corrigir R2-1 a R2-3:
- R2-1: o S8 trata a ausência do campo como "não", contra a decisão 13, e a tela afirma o contrário;
- R2-2: falta a cobertura na S12;
- R2-3: o mapa "Leia junto" e o status das regras estão desalinhados com as decisões 15 a 19.

Os menores podem ir no mesmo ciclo ou virar cartão. Depois da correção, faço uma rodada 3 só sobre R2-1 a R2-3, e o QA reexecuta COMP-12 e os E2E do Leia junto.
