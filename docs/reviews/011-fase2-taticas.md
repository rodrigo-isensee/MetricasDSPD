---
tipo: review
contrato: 1
pedido: 011-fase2-taticas
branch: feature/011-fase2-taticas
commit: ee552d9
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: back da fase 2 do pedido 011, lote 2 (táticas: T13, T14)

**Origem:** commits `3297fda` (E1) e `11113d0` (E2) da `feature/011-fase2-back`, sobre `b73bad3`, revisados contra o plano (`docs/architecture/features/metricas-tambem-disponiveis.md` §2 T13, §4, §5 "Fase 2" e §9), a ADR 0020, as decisões do usuário do pedido 011 (T14 nova = A, Q-T14-1 = B, Q-T14-5 = D, Q-T14-6 = A revista pela R-1 = B, Q-T14-10 = B, D-14' = A, R-4 = sim) e as regras invioláveis do `CLAUDE.md`.

**Separação por nível** (decisão do usuário de 2026-10-17): este lote é o commit `ee552d9`. Ele sai da `feature/011-fase2-estrategicas` (`3aeaa3d`), para não haver conflito nos arquivos compartilhados, e por isso o PR deste lote só abre depois do merge do lote 1. O commit acrescenta só T13 e T14 aos arquivos compartilhados (`METRICA_IDS`, `APLICABILIDADE_FLUXO`, `COM_EXTENSAO_MOCK`, `REGRAS_METRICA`, `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, `ExtensaoTambemBM`, gerador do mock, OpenAPI, fotografias, `docs/api`, `docs/tecnica`, `regras-metricas.md` e as contagens dos testes). Os hashes por campo da extensão continuam os do autor (`vinculos`, `equipeResponsavel`, `outrosPublicavel`, `configEquipes`); só o hash da extensão inteira mudou (`64d76236`). Nenhuma lógica foi alterada na separação.

**Veredito:** **aprovado**, com 3 ajustes recomendados e uma pendência de escopo do lote para o Jarvis. Nada bloqueia o QA.

## Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na raiz da worktree, nesta branch, sobre `ee552d9` mais este parecer: **rc=0** (2026-10-16 11:26, load 0,76 no início). Cobre lint, `format:check`, tipos, testes com cobertura de 100% em todos os pacotes, `docs:check`, `spec:check`, build e tamanho do web.
- `docs:fotografar`: o enum `indicadores[].metrica` do `VISAO_GERAL` cresce com T13 e T14. O aceite de uso único foi registrado, consumido e apagado, como no lote 1.

## Regras de leitura (`praticas.md` §2, §3, §4 e §8)
| Item | Situação |
|---|---|
| Faz o que o plano pede | ok. T13 segue o §2 e o T14 segue o §9.3, com os 8 testes obrigatórios do §9.3 presentes em `t14.test.ts` |
| Comparação entre times (7.1) | ok. O T14 traz só "meu time", "outros times" (um inteiro, `null` com menos de 2 pessoas) e "sem time". Não monta mapa por equipe, e o teste de contrato e o de rota confirmam que nenhum nome de outra equipe aparece. O T13 traz só o booleano, sem quadro nem equipe do outro lado |
| Pessoa | ok. A biblioteca não conta pessoas: `outrosPublicavel` chega pronto (ADR 0020, item 9). O gerador não lê `responsaveis` |
| Story, frente e projeto | ok. Blocos separados por granularidade, nunca somados. A base principal é a das demandas e as frentes vão em `complemento` |
| Mínimo de 20 | ok. T13: taxa com 20 e par com 20 em cada grupo do mesmo tipo (CA-6). T14: percentual só com n ≥ 20 de cards com time informado (CA-31), inclusive `total ≥ 20` com `n < 20` |
| Cálculo pela biblioteca | ok. Lead time pelo `blocosDe` do T1 (sem recálculo), `taxa`, `ordenarNeutro` |
| Documentação no mesmo commit | ok |

## Pontos que o autor deixou para o review
**(b) Enum do `VISAO_GERAL`:** ratificado, pelo mesmo motivo do lote 1 (agora com T13 e T14). Falta o registro do architect no plano.

**(c) Testes do QA e `regras-metricas.md`:** valem as mesmas conclusões do lote 1. No `qa011-fase1.api.test.ts`, A-2, as ids deste lote respondem 200, e O22 e O26 (lote seguinte), da fase 3 ou inexistentes respondem 404. Na `regras-metricas.md`, a linha do T14 fica `pendente-usuario`, de acordo com o plano §4.

**(d) Suposições do autor, uma por uma:**
- **T13 e T14 por granularidade, com os dois blocos na mesma resposta: aceita.** O plano pede "uma granularidade por vez (seletor, CA-8)" e, no §9.3, "uma só por resultado". A resposta entrega os dois blocos, que nunca são somados nem calculados juntos, e a interface mostra um de cada vez. Não há filtro de granularidade em `FiltrosFluxo`, e criar um seria mecanismo novo sem necessidade. O architect precisa alinhar o texto do contrato no plano.
- **T14 "em andamento no período": aceita, com base no CA-27** ("para cada projeto em andamento"). A Q-T14-4 já diz que o período escolhe os projetos e o projeto conta inteiro (CA-34). Em consequência, o projeto ainda não iniciado fica fora mesmo com cards do meu time (`t14.ts:59`). Isso precisa aparecer na pendência que vai ao usuário (R2).
- **`total` do bloco no T14**, que soma os projetos listados com o mesmo mínimo: base no plano §9.3, item 5 ("no projeto ou no total").
- **Q-T14-10 = B** (cadastro de membros, decidida em 2026-10-17): no mock nada muda, porque o booleano é gerado direto. A linha de pendência da Q-T14-10 em `REGRAS_METRICA.T14` ainda descreve a leitura A ("responsáveis distintos"). O usuário já decidiu, e a linha deve sair da lista de pendências e virar regra, com a fonte em K-112 (R2).

## Achados
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `packages/metricas/src/businessmap/t13.ts:59` e `:68` | O bloco das frentes usa `janelaPercentis(ctx, f, 'story')` e `amostraBM('story', ...)`, ou seja, a amostra de frentes vai rotulada como story. Hoje o valor é o mesmo (a janela é igual nas duas granularidades), mas o rótulo errado anula a trava de classe que impede misturar story e frente | Passar `granularidade` para os dois | recomendado |
| R2 | `packages/metricas/src/core/regras.ts:669` e seguintes (pendências do T14) | A Q-T14-4 não diz que "o período escolhe os projetos" é "em andamento no período (iniciado até o fim e não concluído antes do início)", e que por isso o projeto não iniciado fica fora. A Q-T14-10 continua como pendência com a leitura A, mas já foi decidida (B, 2026-10-17) | Deixar a Q-T14-4 explícita, citando o CA-27; tirar a Q-T14-10 das pendências e registrá-la como regra (cadastro de membros, fase 3, K-112) | recomendado |
| R3 | `packages/mock/src/businessmap/extensaoTambemFase2.ts:310` | A chave de `outrosPublicavel` é montada à mão, quando a biblioteca exporta `chaveOutrosPublicavel` | Usar a função da biblioteca (o mock já importa de `@metricas-dspd/metricas/businessmap`) | recomendado |

## Pendência de escopo do lote (para o Jarvis)
- **B11-001 = sim** (usuário, 2026-10-17: "o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços. Entra no lote 2 (táticas)"): **não está nesta entrega**. O K-103 não trata o T10, e `t10.ts` só faz `trim()`. É uma mudança de cálculo (`node-backend`, com teste) que precisa de cartão antes do PR do lote 2. Não a fiz aqui: é lógica e volta ao autor.

## Fora deste review
- **Segurança** (E2.3, `security-engineer`, gatilho: dado pessoal no T14 com `outrosPublicavel`): não refeito. O risco residual (b) da ADR 0020 (`n − k` ainda dá a quantidade de cards dos outros times) é decisão do usuário e fica com ele.
- **QA** (E2.4), **UX** (E3.2) e o PR (pedido 020).

## Commits
`ee552d9 feat(metricas): back da fase 2 do pedido 011, lote das táticas (T13, T14), em mock`. A mensagem segue Conventional Commits em português, com o cartão e as linhas de atribuição.
