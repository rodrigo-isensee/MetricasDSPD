---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f2-referencia
commit: 5a75265de1b84f6bf81c5f147a65dc433f98f04f
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.34, F2 do coletor do BusinessMap, referência real do quadro, K-182)

**Veredito: reprovado** em `5a75265`, por um achado bloqueante (A1: o marco de compromisso de `folhasDoMarco` não segue a H-23 por card). Ficam seis recomendados (A2 a A7). O resto confere com o plano e com as decisões do dono.

## Escopo e o que foi lido

Delta: `64644b1..5a75265`, 2 commits (`07422d4` e `5a75265`), 8 arquivos, 861 linhas a mais e 18 a menos. Li o delta inteiro e, no plano da worktree 052e, a seção F2 (linhas 142 a 154), o §10 e o §11. Para conferir o que o código grava, li também as migrações `0007_bm_referencia.ts` e `0018_bm_referencia_workflow_tipo_times.ts`, o interpretador de tipos de `pool.ts` (date volta como texto `AAAA-MM-DD`) e `lerColunas` em `repositorio.ts` (só a vigência aberta).

Não li o `.env` nem a saída bruta da E2.28, e não chamei o BusinessMap. A única execução foi `vitest run` de `referencia-businessmap.test.ts`, `conferencia.test.ts` e `metricas.mapa.test.ts`: 3 arquivos, 37 testes, todos passaram. O verde do `pnpm run pronto` fica com o QA (E2.35). O `praticas.md` não tem regra com "decidida por: `<comando>`", então não há saída de ferramenta a citar e nada vira pendência por isso.

A segurança deu parecer em `cf902ff` (`docs/security/052-f2-referencia.md`, aprovado, recomendados A1 e A2). Este review cita esse parecer e não o refaz. Decisão do tech-lead sobre o A1 da segurança (teste negativo de pessoa): entra na volta deste review, já que a volta existe, sem bloquear. O A2 da segurança (transação e papel no chamador) fica para o comando da F3, e eu confiro no plano da F3.

## Conferência contra o plano e as decisões

- **Função única de papel por folha** (`spike-lista.ts:72`, `papelDaFolha`). A lista da F1 e a carga da F2 usam a mesma função. A ordem é descarte (pelo nome ou pelo arquivo, H-11), depois a exceção de trabalho e depois a seção. O tipo vem da exceção H-8 ou do `flow_type`. A lista da F1 manteve a saída anterior: o teste antigo da F1 continua verde, e há teste novo para a marca de trabalho. Confere.
- **H-1, H-2 e H-17.** `nivelDoWorkflow` usa o quadro 35 como projeto, `type` 1 como feature, `type` 0 como story e `type` 2 como "nenhum". O `type` desconhecido sai e é contado (`workflowsIgnorados`), sem inferência. Sprint fica sem item e sem categoria, o que respeita a CHECK `eh_item = (categoria IS NOT NULL)`. Tipo fora do mapa recebe o padrão. Os testes cobrem os três casos. Confere.
- **H-8 a H-12 e H-26.** Seção e `flow_type` restritos aos valores das CHECKs. A filha sem seção usa a seção da mãe. Descartado da seção 4 fica com `papel = NULL` e `eh_descarte = true`, sem entrega. Homologação vem pela função da F1. Confere.
- **Limite 0 como NULL** (`referencia.ts:140`). A H-12 diz que 0 é "sem limite". Gravar NULL faz o O1 mostrar o WIP sem limite e nunca comparar com 0. Limite negativo também vira NULL, e o teto é 32767, que cabe no `smallint`. A mudança de limite é processo automático e marca só o O1. Confere.
- **Vigência e motivo obrigatório (U-1).** A mudança de significado sem `motivo` não grava nada (`ErroReferencia('motivo')`), então processo ou correção é decisão de quem opera. Processo abre versão de critério com as 12 métricas, e mudança só de limite marca só o O1. Correção não marca. A troca de rótulo na `ref_coluna` vai como correção. Uma segunda mudança no mesmo dia é recusada antes da PK `(chave, vigente_de)`. A escrita é só INSERT de vigência nova e UPDATE de `vigente_ate`, como o gatilho `proibir_alteracao_vigencia` exige, então o histórico nunca é sobrescrito. A versão de partida é única por `referencia` (idempotente). Confere, com o A2 e o A3.
  - Leitura de `vigenteEm`: a correção vale desde o início da versão que ela corrige. Logo, depois de uma mudança de processo, ela corrige só o período desse processo. É coerente com a U-1 ("como foi" mais a correção do erro de mapeamento). Registro aqui como leitura, não como achado.
- **U-2** (`contextoDoEvento`). A coluna dá o workflow no dia, e o workflow dá o nível e o time no dia. Teste com um card que muda de workflow e com um time que muda de definição. Confere.
- **Pergunta 2 da lista de colunas (2026-10-31).** O campo novo `excecoes_papel_trabalho` tem esquema próprio: `papel` literal `trabalho`, `nome` opcional, coluna única e `.default([])`. Ele fica separado de `excecoes_papel_coluna`, cujo `papel` guarda fila ou execução. Separar evita misturar papel e tipo num campo só, e por isso é a forma certa. Na carga, a folha listada vira `trabalho` com o tipo do `flow_type`, e a entrega passa para a folha seguinte da seção 4. A lista da F1 não marca mais essa folha como candidata de marco, e a H-23 não conta uma folha `trabalho` da seção 4 como "folha da seção 4". `excecoesSemColuna` também cobre o campo novo. As perguntas 1 e 3 não geram exceção, como diz a nota do arquivo. Confere, com o A4.
- **`mapa.ts` por id com o rótulo "Nome (id)"** (`mapa.ts:29-33` e `:73-80`). A chave segue `quadro|coluna_id`. O rótulo é o nome quando ele é único no quadro e "Nome (id)" quando ele se repete. `nomesDeColuna`, que serve para transições, cards e bloqueios, e `colunasDe`, que serve para a dimensão, recebem a mesma lista (`montarBaseBM`) e por isso dão o mesmo rótulo. Duas colunas nunca se fundem, e sem repetição nada muda nos dados de exemplo. **Efeito nos cartões:** no quadro real (78 workflows em 7 quadros), "Backlog", "Concluído" e "Descartado" se repetem muito. A legenda do CFD, os blocos por coluna do O2, o envelhecimento por coluna e o arquivo exportado vão mostrar "Backlog (2530)". Isso é correto para a métrica, mas é mudança visível (A7). A contagem inclui as colunas mãe, que podem dar id a uma folha sem necessidade. O efeito é só no rótulo.
- **ADR 0020, 0022 e 0015.** Nenhuma pessoa é lida ou gravada (só ids e nomes de coluna, workflow e tipo). Só há GET por `lerReferenciaReal`, pelo cliente da F0, sem cards nem usuários. A SQL usa nomes de tabela e coluna de constantes e valores por parâmetro. BusinessMap e Acelerato não se cruzam. Confere, e a segurança aprovou.
- **Plano F2, item fora da entrega.** O "O quê" do plano lista `ref_dominio` e o mapa `field_id` → domínio. A E2.32 não os pediu, e o código não os traz (A6).

## A1 (bloqueante): compromisso por card na H-23

`referencia.ts:371-380`. Para o compromisso, `folhasDoMarco` devolve as folhas `compromisso` quando o workflow as tem, e só no workflow sem nenhuma devolve as folhas da seção 3. A H-23 = A (plano, linha 148) é por card: "card que pula a seção 2 tem o compromisso na primeira entrada na seção 3".

Prova: no workflow 191 do teste (`referencia-businessmap.test.ts:158`), a função devolve só `['2531']`. Um card que vai de 2530 (seção 1) direto para 2533 (seção 3) nunca entra em 2531 e fica sem compromisso. Com isso, sai do tempo de ciclo e do WIP que dependem do compromisso.

A entrega já funciona por card: une as folhas de entrega das seções 4 e 5, e a primeira entrada do card em qualquer uma delas é o marco. O compromisso deve ter a mesma forma: folhas `compromisso` mais as folhas `trabalho` e `homologacao` da seção 3. A primeira entrada do card nesse conjunto é o marco. Para quem passa pela seção 2, nada muda, porque ele entra nela antes. Pedido: o teste de `:155` deve provar o card que pula a seção 2 num workflow que a tem, e o comentário da `:378` deve ser ajustado.

## Testes do gravador contra PostgreSQL (para o QA, E2.35)

A F2 não traz testes `.pg`. O dublê confere o texto e os valores, mas não confere grants, CHECKs, gatilho nem tipos. O QA deve rodar contra o PostgreSQL local, com o papel que a F3 vai usar (`dspd_ref`, conforme o A2 da segurança):

1. A carga inicial dos fixtures grava nas 4 tabelas: grant por coluna em `ref_coluna`, inclusive `section`, `flow_type`, `eh_folha`, `eh_descarte` e `motivo`; CHECK de `ref_tipo_card`; regex de `ID`; e `nivel` de `ref_quadro` em `coordenacao` e `gerencia`.
2. A segunda carga com mudança de processo passa pelo gatilho: o UPDATE só de `vigente_ate` em `ref_workflow` e `ref_tipo_card`, e o grant de UPDATE de `vigente_ate` em `ref_coluna`.
3. A comparação de `vigente_de` com o dia, com o date como texto (`pool.ts`). A recusa no mesmo dia deve vir da `ErroReferencia`, não da PK.
4. `ref_versao_criterio` e `ref_versao_criterio_metrica` aceitam os 12 ids, inclusive `EI_FL1` (não há catálogo com FK a conferir, mas a gravação precisa passar), e a segunda execução no mesmo dia não duplica.
5. `registrarFolhasSemConferencia` como `dspd_coletor` (UPDATE e INSERT em `ctl_coleta_contagem`).
6. Erro no meio da carga dentro de uma transação desfaz tudo.
7. `lerColunas` depois da carga, mais `montarBaseBM`: o rótulo "Nome (id)" sai igual na dimensão e nas transições.

## Teto de linhas (M14)

`git diff --numstat --no-renames 64644b1..5a75265`, só código e teste: 869 linhas.
- `referencia.ts`: 380;
- o teste novo: 409;
- `spike-lista.ts`: 45;
- `mapa.ts`: 24;
- `conferencia.ts`: 5;
- `index.ts`: 4;
- `conferencia.test.ts`: 2.

O JSON de conferência (10 linhas) é dado de configuração e não entra na conta. O `praticas.md` não tem regra própria de tamanho de PR, então vale o teto da fábrica, como na F1 (PR 179).

Conto um comportamento só: a referência do quadro passa a ser identificada por id. Isso cobre a carga com vigência, a regra única de papel por folha que a carga usa e o consumo por id em `mapa.ts`. Sem esse consumo, a carga real fundiria colunas homônimas nos painéis, e o plano junta as três partes na F2. Aceito a exceção.

O PR da E2.36 deve trazer a linha `teto: excedido, <n> linhas, F2 do plano 052: referência do quadro por id (carga com vigência, papel único por folha e consumo em mapa.ts)`, com o `<n>` medido depois da volta. Sem essa linha, ou com um número antigo, o teto vira achado bloqueante quando o PR for aberto.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/referencia.ts:376 · H-23 por card: card que pula a seção 2 num workflow que a tem fica sem compromisso (prova no parecer). Compromisso = folhas compromisso mais trabalho e homologação da seção 3, como a entrega já faz; teste do card que pula.
- A2 (recomendado) server/src/modulos/businessmap/referencia.ts:230 · Um só motivo por execução vale para todas as mudanças de significado; processo e correção na mesma carga não se expressam. Sugestão: motivo por chave no comando da F3, ou erro que liste todas as chaves.
- A3 (recomendado) server/src/modulos/businessmap/referencia.ts:215 · Coluna, workflow ou tipo que some do quadro segue vigente para sempre, sem contagem. Sugestão: contar as chaves ausentes no Resultado; fechar ou não a vigência vira pergunta ao arquiteto, sem inferir.
- A4 (recomendado) docs/architecture/fontes/businessmap-conferencia.json:24 · 242/2314 e 248/2326 sem nome e uma folha por workflow, mas a pergunta 2 cita três nomes. Sugestão: arquiteto confere na lista da E2.28 que nenhuma outra folha desses nomes antecede na seção 4 (ordem do 191).
- A5 (recomendado) server/src/modulos/businessmap/referencia.ts:133 · Folha sem seção é gravada com papel NULL sem contagem no Resultado; o Pronto da F2 pede nenhuma folha sem papel ou sem motivo. Sugestão: contar folhas sem papel no Resultado e mostrar no comando da F3.
- A6 (recomendado) docs/architecture/features/052-integracao-businessmap.md:143 · O plano lista ref_dominio e o mapa field_id para domínio na F2, que a E2.32 não pediu nem trouxe. Sugestão: software-architect registra a fatia onde entram (F3 ou F3b).
- A7 (recomendado) server/src/modulos/metricas/mapa.ts:31 · O rótulo Nome (id) vai aparecer muito nos cartões e na exportação do quadro real, e a contagem inclui colunas mãe. Sugestão: ux-designer confere na F6; contar só folhas.
