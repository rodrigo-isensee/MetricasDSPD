---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: f24c3a9b98722b2bf62961ef3ea8cf75e11de291
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.4 e revalidação E2.9, F0 do coletor do BusinessMap, K-182)

Escopo: `11141d7516b7a71418b3ec069473e3449453fe81..746aae599b9cdb5c1029ed83e366f5646635b083`, 2 commits (`2303cd2` cliente HTTP e config; `746aae5` referência, tabela de times, carga inicial e conferência), 22 arquivos, 1365 linhas a mais e 11 a menos. Lidos: o diff inteiro, a seção F0 e a "Tabela de times" do plano `docs/architecture/features/052-integracao-businessmap.md` (worktree 052, revisão da E1.22 com as respostas de 19:33), as seções 2, 3, 4, 6, 7, 8 e 9 do `docs/engineering/praticas.md`, a ADR 0015 (S-22) e o `data-model.md` §3.4 desta branch. O `.env.example` não foi lido: a regra de permissão da sessão o barra. O conteúdo fica com a segurança (E2.3) e o QA.

## Regras de ferramenta

- Lint, typecheck, testes e cobertura ficam com o `pnpm run pronto`. O autor declara 662 testes e 95 `.pg` aprovados (Histórico do pedido, 20:03). Não rodei de novo: só uma suíte por vez, e a E2.3 corre em paralelo. O verde dos `.pg` contra o PostgreSQL local fica com o QA (E2.5).
- Segurança (gatilhos: segredo, integração externa, grants e migrações) tem parecer próprio em `docs/security/052-f0-fundacoes.md` (E2.3), que este review não refaz.

## Conferência contra o plano, as decisões H e as regras invioláveis

- **Cliente (F0, "O quê" e "Pronto").** Os itens do plano estão cobertos, com teste para cada um (`server/tests/http.test.ts`):
  - só GET, recusado antes da rede;
  - lista fechada de caminhos e de parâmetros;
  - `/users` só com `fields=user_id,realname` (ADR 0020, revisão 3);
  - host fixo e https, com http aceito só em loopback;
  - redirect com `redirect: 'manual'`, sem seguir;
  - erro sem `cause` nem corpo, e chave só no cabeçalho, fora de log e de erro;
  - limitador por janela móvel até 25/min, e 429 que respeita `retry_after` (corpo, depois cabeçalho, entre 1 e 120 s, até 5 esperas);
  - 401 e 403 encerram a execução, sem nova tentativa;
  - teto de páginas por execução.

  As seis variáveis `BUSINESSMAP_*` são validadas por zod. A apikey não é ecoada (`config-businessmap.test.ts`).
- **Tabelas (0016).** `ref_workflow` (H-1), `ref_tipo_card` (H-2 e H-17, com `CHECK` item x categoria) e as colunas novas de `ref_coluna` (H-8 a H-11; `limite_wip` da H-12 já existia) seguem o `data-model.md` §3.4 da revisão E1.22. O mesmo vale para `ref_time` e `ref_time_workflow` (decisão de 16:44), que têm o `CHECK` time x fora e o índice parcial único da vigente. O gatilho `proibir_alteracao_vigencia` aceita um único UPDATE: fechar a vigente, sem mudar outra coluna. DELETE e TRUNCATE são barrados até para o dono. O `down` existe. `versao_id` sem FK está de acordo com o modelo ("lógico").
- **Carga dos 63 workflows (0017).** Conferi lista a lista contra a tabela do plano:
  - 3 times próprios (224, 265, 229);
  - 6 fora de todo cálculo (H-7);
  - 7 fora do operacional (6 do 057 E3, mais o 323 pela H-22 = A);
  - 47 demais, um time cada (H-21 = A), com o nome provisório `Workflow <id>` até a F2, que traz o nome real por `correcao`.

  Os ids são estáveis (1 a 50). A versão de critério de partida não leva métrica, e `registrado_por = 'carga-inicial-057-E3'`. A exceção ao "sem INSERT em migração" (ADR 0014) se limita a esta migração e às três tabelas, e o teste estático a delimita (`migracoes.estatico.test.ts:76`). O `down` recusa quando há vigência posterior, então nada de histórico se perde.
- **Regras invioláveis.**
  - Times só como filtro: nenhuma view nem rota lê as tabelas. Isso é provado no banco (`view_table_usage` e `view_column_usage`) e no código (`times-sem-comparacao.test.ts`, que afirma um mínimo de itens nos dois laços).
  - Nenhum nome de pessoa na carga nem no arquivo de conferência (teste).
  - `registrado_por` fica fora da API (`COLUNAS_FORA_DA_API`, com teste de `42501`).
  - Nada mistura Acelerato.
  - Histórico: só nova vigência.
  - Credenciais só no ambiente: o cliente não lê `process.env`.
- **Mudança em `lerVersoes` (fora da lista da F0).** `repositorio.ts:53` passa a exigir ao menos uma métrica. Ela fica: é consequência direta da versão de partida "sem marca nos gráficos" do plano. Não há regressão:
  - `janelasCalibracao` e `MudancasCriterio.tsx:25` já ignoravam versão com `afeta` vazio;
  - toda versão do seed e da pesquisa leva métrica.

  O efeito visível é só no `GET /criterios`. Ficam dois pontos soltos, A4 e A5.
- **Troca de ky e p-throttle por `fetch` nativo.** A troca fica, por três razões:
  - zero dependência nova num cliente que carrega uma chave capaz de escrever no quadro (Q-5 = B);
  - os controles pedidos pelo plano exigiriam `hooks` e configuração no ky de tamanho comparável: 401/403 que encerram a execução, `retry_after` no corpo, consulta fechada e redirect manual;
  - a janela móvel conta também as novas tentativas e as esperas de 429, o que o p-throttle sozinho não faz.

  A lógica tem cerca de 150 linhas, cobertas por testes com servidor falso e relógio injetado. Critério de reversão sugerido para a ADR: voltar ao ky se um segundo cliente de saída precisar do mesmo controle, ou se a F1 ou a F3 acharem defeito no limitador. A ADR 0015 ainda descreve o desenho antigo (A1).
- **Commits.** Conventional Commits em português, um tema por commit, com `Cartão: K-182` e as linhas de atribuição.

## Teto M14

Contagem por `git diff --numstat --no-renames`, só código e teste, sem o snapshot de esquema:
- `2303cd2`: 691 linhas, mais 8 no `.env.example`.
- `746aae5`: 575 linhas.

Os dois commits são comportamentos independentes: o cliente HTTP não depende das tabelas, e as tabelas não dependem do cliente. A forma do PR é decisão minha na E2.6 (A3).

## Achados
- A1 (bloqueante) docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md:95 · S-22 (e :31, :69) ainda diz ky + p-throttle; o código usa fetch nativo com limitador próprio. A troca fica; falta revisar a ADR (praticas §7 item 7, §8 item 10): o software-architect revê S-22 com o motivo, o critério de reversão e o cliente só do BusinessMap.
- A2 (recomendado) server/migrations/0018_bm_referencia_workflow_tipo_times.ts:6 · cita o data-model §3.4 com as tabelas novas. Condição da E2.6 cumprida na E2.21: a revisão está na develop (PR 174, c892137) e entrou nesta branch pelo merge da E2.19 (data-model.md:123 e :124).
- A3 (recomendado) server/src/plataforma/http.ts:1 · M14: 699 linhas em 2303cd2 (cliente) e 575 em 746aae5 (referência e times), dois comportamentos. Na E2.6, dois PRs, um por commit, cada um com a linha de teto excedido e o motivo; um PR único com os dois vira bloqueante (M14).
- A4 (recomendado) server/tests/coletas.test.ts:69 · o teste de lerVersoes ainda afirma que versão sem métrica volta com afeta vazio (o dublê ignora o SQL), o contrário do filtro novo em repositorio.ts:53, e nenhum .pg prova o filtro. Ajustar o caso e afirmar no .pg que a versão da 0017 fica fora de /criterios.
- A5 (recomendado) server/src/modulos/referencia/repositorio.ts:37 · lerVersaoCriterioVigente não tem o filtro novo: sem o seed mock, a versão de partida da 0017 vira o versaoCriterio de /referencia, embora fique escondida de /criterios. Aplicar o mesmo critério ou registrar a diferença em docs/api/metricas.md:76.
- A6 (recomendado) server/src/plataforma/http.ts:168 · fields só vale em /users, mas a F3 do plano lê /cards com fields explícito (I-2 do k084). Na F3, ampliar por caminho como decisão revista, com teste, e não como ajuste de passagem.
- A7 (recomendado) server/migrations/0019_bm_carga_inicial_times.ts:65 · a vigência de partida é o dia da migração menos 12 meses, e card aberto antigo (Q-2b) tem eventos anteriores a vigente_de, sem time. A F4 precisa de regra e teste para instante anterior à vigência de partida.
- A8 (recomendado) docs/architecture/features/052-integracao-businessmap.md:166 · o plano (R-9) põe B-K1 e B-K2 na F0, mas a delegação da E2.2 não os listou, e o diff não toca o coletor. Não bloqueia, porque a F0 não grava staging. Precisam entrar antes de a F3 gravar stg_ (Jarvis decide a etapa).
- A9 (recomendado) server/src/plataforma/http.ts:160 · a janela de 1 h vive no cliente (uma execução); retomar a carga na mesma hora começa do zero e pode passar dos 600/h da conta. Na F3, intervalo mínimo entre execuções ou contagem persistida, com teste.
- A10 (recomendado) server/src/plataforma/http.ts:27 · expand saiu da lista geral, mas o plano (linha 129, F1) lê /cards com expand=custom_fields,transitions,block_times,linked_cards. Na F1 ou F3, expand por caminho como decisão revista, com teste (mesmo caminho do A6).
- A11 (recomendado) docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md:103 · a revisão 1 (branch docs/052-plano-hierarquia) descreve só a janela de 60 s; faltam a janela de 1 h com parada (550), a parada por retry_after acima de 120 s e o teto de 10 MB. Registrar na próxima passada da ADR.
- A12 (recomendado) server/src/plataforma/db/migrar.ts:91 · com checkOrder, banco local que já aplicou 0016_bm e 0017_bm (antes da renumeração) recusa migrar. Só alcança quem rodou a F0 antes da E2.19: recriar o banco local, passo a registrar no PR da E2.6.

## Revalidação (E2.9, volta 1)
Delta lido (`forge-check delta --parecer`, intervalo `746aae5..051c46e`, commits `474f9bd` e `051c46e` da E2.7): `server/src/plataforma/http.ts` (+89 -29), `log.ts` (+3), `referencia/repositorio.ts` (+7 -2) e os testes `http.test.ts`, `coletas.test.ts`, `log.test.ts` (novo) e `referencia-times.pg.test.ts`. Já lido na rodada anterior e fora do delta: as migrações 0016 e 0017, a config, a conferência e o resto dos testes. Os achados de segurança (A1 a A5 do `docs/security/052-f0-fundacoes.md`) ficam com a E2.8, em paralelo; aqui li o código só pelo que toca o review.

- **A1 resolvido fora desta branch:** ADR 0015 revista em `52dfb30` e `485df6a` (branch `docs/052-plano-hierarquia`, review `d699885` aprovado): linhas 32, 96 e a seção "Revisão 1" (101 a 108) trazem `fetch` nativo, motivo, alcance só BusinessMap e critério de reversão com fato observável. Condição da E2.6, como no A2: o PR da F0 só mescla depois da E1.26 (a revisão já na `develop`). Defasagem com o código da volta vira A11, recomendado.
- **A4 resolvido:** `coletas.test.ts:81` afirma o filtro no texto do SQL (o dublê ignora o SQL), e o `.pg` (`referencia-times.pg.test.ts:203` a `:220`) prova no banco que a versão de partida da 0017 fica fora de `lerVersoes` e que uma versão com métrica entra.
- **A5 resolvido:** `repositorio.ts:42` aplica o mesmo critério (`versao_id IN (SELECT ... ref_versao_criterio_metrica)`), com teste unitário e `.pg`; nenhuma mudança em `docs/api/metricas.md` é precisa, porque o comportamento passou a ser o mesmo de `/criterios`.
- **Suposição do autor, teto de 550 por hora com parada:** aceita. Fica abaixo dos 600/h do roteiro de configuração (plano linha 266, não reconferido), conta novas tentativas e esperas de 429, e parar em vez de esperar 1 h combina com a carga retomável (R-3 do plano). O estado é por execução (A9).
- **Suposição do autor, `expand` fora da lista geral:** aceita para a F0, que não lê cards; ninguém no diff usa `expand`. A F1 precisa dele (A10).
- **Suposição do autor, `lotesDeUserIds` de 200:** aceita. É o mesmo limite de `LISTA_IDS` (`http.ts:23`), então todo lote passa pelo cliente, e a lista inteira acima disso é recusada (teste). O limite da própria API para `user_ids` não está confirmado; se a F3 achar outro, a mudança é uma constante (`LOTE_USER_IDS`, `http.ts:51`).
- **Leitura do resto da volta:** `requisitar` deixou de ser exportado (o cliente devolve só `get` e `listarPaginas`) e valida o caminho antes do log e da checagem de parada; `parada` guarda o erro e o repete nas chamadas seguintes; `lerCorpo` aplica o teto por `content-length` e por blocos, inclusive no 429. Sem achado de código.
- **Testes focados** (`nice -n 19 pnpm exec vitest run tests/http.test.ts tests/coletas.test.ts tests/log.test.ts`, em `server/`): `Test Files 3 passed (3)`, `Tests 48 passed (48)`. O `.pg` fica com o QA (E2.5); `pronto` não rodou nesta etapa (decisão técnica do Jarvis, E2.8 e E2.9 sem suíte).
- **Teto M14 (A3 atualizado):** `474f9bd` soma 234 linhas ao cliente (925 no total, com `2303cd2`), e `051c46e` soma 47 à referência (622 com `746aae5`). Na E2.6, os dois PRs ficam: cliente com `2303cd2` e `474f9bd`, referência com `746aae5` e `051c46e`, cada um com a linha de teto excedido.

## Revalidação por delta depois da E2.19 (E2.21, 2026-10-31)
Delta lido: `e86e8d5..f24c3a9`, o merge da `develop` (`4e7a180`, PR 175, coletor do Acelerato) feito pela E2.19, olhado pela resolução (`git show --remerge-diff f24c3a9`) e pelos arquivos da F0 que ela tocou. O `forge-check delta --parecer` aponta `051c46e..7c52a97`, que inclui todo o conteúdo da `develop` (PRs 174 e 175, com reviews próprios); dele li só o que a E2.19 resolveu ou renomeou. Já lido e fora do delta: o código da F0 em `051c46e`, sem mudança.

- **Os 5 conflitos.** O `remerge-diff` mostra conflito em `.env.example`, `checksums.json`, `migracoes.ts`, `migracoes.estatico.test.ts` e `pesquisa.pg.test.ts`. Todos foram resolvidos mantendo os dois lados, sem mistura:
  - `.env.example`: bloco do BusinessMap (052) e bloco do Acelerato (056) separados, cada um com o seu comentário;
  - `checksums.json`: 0016 e 0017 do Acelerato e 0018 e 0019 do BusinessMap;
  - `migracoes.ts`: os quatro módulos importados e indexados na ordem 0016 a 0019;
  - `pesquisa.pg.test.ts`: `down` com `quantas: 7` e a lista de 0019 a 0013 na ordem de reversão;
  - `migracoes.estatico.test.ts`: `COLUNAS_FORA_STG_ESPERADAS = 446`, que fecha com 436 da F0 mais as 10 colunas da 0017 do Acelerato (406 na `develop`, 396 mais 10).
- **Renumeração.** `0016_bm_*` e `0017_bm_*` viraram `0018_bm_*` e `0019_bm_*` com similaridade de 100% (`git diff -M --numstat`: 0 e 0), e os checksums das duas são os mesmos de antes (`5f427f7f...` e `80d4011e...`). A ADR 0016 continua cumprida, porque o conteúdo não muda.
- **Referências ajustadas.** `CARGA_INICIAL` do teste estático, os imports de `conferencia.test.ts` e `referencia-times.pg.test.ts` e o `import` dinâmico do teste de `down` da carga apontam para a 0019. Nenhuma referência a `0016_bm` ou `0017_bm` ficou no código (`git grep` em `f24c3a9`); só as linhas A2 e A7 deste parecer, atualizadas agora.
- **Condições da E2.6.** As condições de A1 e A2 (revisão da ADR 0015 e do data-model na `develop` antes do PR) estão cumpridas: o PR 174 (`c892137`) já está na `develop` e veio para a branch com o merge. A3 continua: o merge soma cerca de 15 linhas de resolução e não muda a divisão em dois PRs.
- **Achado novo.** A12 (recomendado): banco local que já tinha a numeração antiga recusa migrar por causa do `checkOrder`. Não devolve, porque a F0 nunca foi para a `develop` e os testes `.pg` criam esquema com prefixo novo.
- **Saída de ferramenta.** Testes focados (`nice -n 19 pnpm exec vitest run tests/migracoes.estatico.test.ts tests/conferencia.test.ts`, em `server/`): `Test Files 2 passed (2)`, `Tests 30 passed (30)`. O autor declarou o pronto verde na E2.19. Os `.pg` contra o PostgreSQL local ficam com o QA (E2.22).
- **Segurança.** A revalidação da E2.20 (`docs/security/052-f0-fundacoes.md`, `7c52a97`) aprova o mesmo `f24c3a9`. Não refaço essa leitura aqui.

## Parecer
**Aprovado** na revalidação por delta (E2.21), no commit `f24c3a9`. A resolução do merge mantém BusinessMap e Acelerato separados, e a renumeração não muda o conteúdo das migrações. A12 é recomendação. Segue para o QA (E2.22).

Rodada E2.9: **aprovado** no commit `051c46e`: A1 resolvido pela revisão 1 da ADR 0015 (`485df6a`), A4 e A5 resolvidos no código, com teste. A2 e A3 são condições que eu aplico na E2.6 (ordem de merge depois da E1.26 e dois PRs). A6 a A11 são recomendações para a F1, a F3 e a próxima passada da ADR, e não devolvem. Segue para o QA (E2.5), junto com o parecer da segurança (E2.8).

Rodada anterior (E2.4, commit `746aae5`): reprovado no commit `746aae5`, só pelo A1. O código cumpre a F0 do plano, as decisões H e as regras invioláveis, e nenhum achado pede mudança de lógica neste commit. A volta é de documentação: a revisão da S-22 da ADR 0015, pelo software-architect, nesta branch ou na `docs/052-plano-hierarquia`, antes do PR. Eu revalido pelo delta. A2 e A3 são condições que eu mesmo aplico na E2.6. A4 e A5 são ajustes pequenos de teste e de consistência, que o Jarvis pode juntar à volta, se quiser. A6 a A8 ficam para a F3 e a F4.
