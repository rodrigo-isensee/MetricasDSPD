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
