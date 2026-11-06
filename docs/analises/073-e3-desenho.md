# 073 E3 (K-224): mudança de lista em `ref_dominio` pede o reconhecimento do CA-8

Desenho curto (E3.5, software-architect), só leitura no checkout da develop `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD 8a789d43). Escopo: o coletor do Acelerato (`dspd_ac`), único com CA-8. Base da implementação E3.1 (node-backend).

## 1. O que o CA-8 faz hoje
- `server/src/modulos/acelerato/controle.ts:17-22`: `ParametrosColeta` e `CHAVES_COMPARADAS` (host, banco, tabela, colunas, campos, SQL, TLS, fluxo). `montarParametros` (`:31-37`) faz hash só de constantes do código (`COLUNAS_DA_LINHA`, `NOMES_CAMPO_FATIA_F1`, `CAMPOS_ETAPA_F3`, `sqlSha256()`) e da config; a única lista de `ref_dominio` com hash é `etapa_fluxo` (`fluxoSha256`, `:28-29`, L9-c).
- `server/src/modulos/acelerato/coletor.ts:201-211`: lê as listas, o último sucesso e a ordem do fluxo; compara (`parametrosDiferentes`, `controle.ts:40-41`) e, sem `reconhecerMudanca`, lança `parametros-mudaram` (`erros.ts:28`) com só os nomes das chaves, antes de abrir conexão. O reconhecimento é a opção `--reconhecer-mudanca` (`server/src/entradas/coleta.ts:12,27`); o registro é implícito: a linha de sucesso grava os parâmetros novos (`coletor.ts:244`, `registrarSucesso`), que viram a base da próxima comparação.
- ADR 0023 §6 (linha 100) descreve o hash das "listas de nomes de campo", não dos valores das listas de `ref_dominio`. Esse é o buraco do K-224.

## 2. Onde as listas de `ref_dominio` entram no cálculo (coletor)
- `referencia.ts:23-45` `carregarListas`: `tipo_recorte`, `organizacao_recorte`, `equipe` (filtro de origem no `WHERE` da Q1 por chave, ADR 0023 §5, e segunda camada zod CA-11) e os vocabulários `etapa`, `prioridade`, `categoria`, `descricao_workflow` (allow-list: valor fora vira nulo).
- `referencia.ts:52-60` `carregarDominiosEtapa`: valores permitidos dos campos de etapa `lista` (`cpe_*`, P-DS-19; hoje podem estar vazios).
- `referencia.ts:71-80` `carregarOrdemFluxo`: `etapa_fluxo`, já coberta pelo `fluxo_sha256`.
- Fora do coletor: `natureza_prefixo` é lida no projetor (`projetor.ts:36-43`), não na coleta. `campo_personalizado` está no conjunto do `ac:ref-sync` (`dominio-acelerato.ts:16-18`) e nenhum leitor no coletor foi achado.
- O `ac:ref-sync` já registra versão de critério `056:ref-dominio:<sha do arquivo>` a cada mudança (`dominio-acelerato.ts:177-189`), mas a coleta não fica sabendo: nada a recusa.

## 3. Proposta
- **O que entra no hash:** duas chaves novas em `ParametrosColeta` e em `CHAVES_COMPARADAS`, para o erro dizer qual grupo mudou (só o nome, nunca o valor):
  - `recorte_sha256`: `tipo_recorte`, `organizacao_recorte`, `equipe`;
  - `vocabulario_sha256`: `etapa`, `prioridade`, `categoria`, `descricao_workflow` e os domínios `cpe_*` de `carregarDominiosEtapa`.
  - Forma canônica: uma linha `campo|codigo|rotulo` por item vigente, ordenada por `campo` e `codigo` (como o `fluxoSha256`, a ordem de chegada não muda o hash). O `rotulo` entra porque o zod confere os nomes e o vocabulário aceita código e rótulo. A `ordem` fica fora (só tem sentido em `etapa_fluxo`, `CAMPOS_COM_ORDEM`, que já tem chave própria). Lista vazia tem hash estável.
- **Quando é calculado:** na partida, a partir das listas já carregadas em memória (as mesmas que vão no `PedidoLeitura`), antes de abrir a conexão MySQL. `carregarDominiosEtapa` (hoje em `coletor.ts:218`, depois da comparação) sobe para antes do `montarParametros`. Assim o hash é do mesmo retrato que a leitura usa, mesmo se o `ac:ref-sync` rodar no meio.
- **Onde o reconhecimento fica gravado:** como hoje, em `ctl_coleta.parametros` (jsonb) da linha de sucesso, que passa a ter as duas chaves. Sem coluna nova, sem campo novo.
- **Como a coleta recusa:** o mesmo caminho de hoje: `parametros-mudaram` com `coluna = 'recorte_sha256'` e/ou `'vocabulario_sha256'`, linha de falha sem marca d'água (ADR 0006), e o e-mail de falha da coleta agendada. Libera com `pnpm coleta ac --reconhecer-mudanca` rodado por uma pessoa.
- Sem mecanismo novo: duas chaves num controle que já existe, mesmo molde do `fluxo_sha256` (069 L9-c, `docs/reviews/069-zz5-l9c.md`).

## 4. Impacto
- **Migração:** nenhuma (o `parametros` é jsonb; o papel do coletor já grava a linha inteira no INSERT). `ref_dominio` não muda.
- **Primeira coleta depois do deploy:** a linha anterior não tem as chaves novas (`undefined !==` hash), então a coleta agendada das 06:30 é recusada até alguém rodar `pnpm coleta ac --reconhecer-mudanca` uma vez. É o mesmo passo que o L9-c já pede; na release combinada (decisão "A" do dono) um único reconhecimento cobre os dois. Isso precisa estar no roteiro da release.
- **Testes (node-backend + QA):** unitário do hash (ordem de chegada não muda; incluir/tirar código e trocar rótulo mudam; `ordem` não muda; lista vazia estável); coletor com duplo: trocar lista de recorte recusa com `coluna = recorte_sha256` sem abrir conexão, trocar vocabulário ou `cpe_*` recusa com `vocabulario_sha256`, com a opção passa e grava o hash novo; pg: `ac:ref-sync` fecha vigência e abre outra (sem apagar), a coleta seguinte recusa e, reconhecida, segue. Atualizar o CT-34 de `docs/qa/056-coletor-plano-de-testes.md`.
- **Documentação:** ADR 0023 §6 (linha 100, nova leitura: "valores vigentes das listas de recorte e de vocabulário de `ref_dominio`"), por edição revisada, não nesta entrega; `docs/architecture/fontes/acelerato-listas.md` (passo de reconhecer depois do `ac:ref-sync`); `docs/architecture/data-model.md` §4, se listar as chaves de `parametros`.

## 5. Riscos
- **Carga incremental e histórico:** reconhecer não reescreve nada. Staging e `ref_dominio` seguem append-only (vigência fechada, linha nova). Mas a lista nova vale só daí em diante: com equipe ou organização a mais, o incremental parte da marca d'água e não traz os chamados antigos dela até a releitura semanal (ADR 0023 §6). Com uma a menos, os já coletados ficam na base e a releitura grava versão nova `fora_do_recorte = true`. O que fazer com o passado depende de P2.
- **Recusa vira rotina:** se toda carga do `ac:ref-sync` vier seguida de reconhecimento automático, o controle perde o sentido. A opção continua manual e não entra no agendador.
- **Reconhecimento sem versão de critério:** a opção libera também uma edição feita direto no banco, sem `ref_versao_criterio`. É o R1 de `docs/reviews/056-coletor-f1-f2.md:109`, que vale para todas as chaves. Fica fora do E3 (cartão próprio, se o Jarvis quiser).
- **BusinessMap:** `dspd_bm.ref_dominio` (`campo_customizado`) decide qual campo sai da fonte e o coletor do BusinessMap não tem CA-8 nenhum. Está fora do K-224 e é registrado aqui só para o Jarvis decidir se abre cartão.
- **Mistura de fontes:** as chaves novas ficam só no `dspd_ac.ctl_coleta`. Nada do BusinessMap entra no hash.

## 6. Perguntas ao dono (regra de negócio; não se decide no desenho)
- **P1:** a mudança da lista `natureza_prefixo` (classifica a natureza na projeção das métricas de sustentação, não na coleta) também deve parar a atualização até alguém reconhecer, ou basta a versão de critério que o `ac:ref-sync` já registra? Hoje ela não para nada.
- **P2:** quando uma equipe, organização ou tipo entra no recorte, os chamados antigos dela entram na base (releitura completa do recorte junto com o reconhecimento) ou só os atualizados depois da data de vigência da lista?
