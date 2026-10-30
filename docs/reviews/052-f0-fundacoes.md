---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: 746aae599b9cdb5c1029ed83e366f5646635b083
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E2.4, F0 do coletor do BusinessMap, K-182)

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
- A2 (recomendado) server/migrations/0016_bm_referencia_workflow_tipo_times.ts:6 · cita o data-model §3.4 com as tabelas novas, que só existe na worktree 052, sem commit (E1.24). Condição da E2.6: o PR da F0 só mescla com essa revisão já na develop (E1.26); sem isso, o achado vira bloqueante.
- A3 (recomendado) server/src/plataforma/http.ts:1 · M14: 699 linhas em 2303cd2 (cliente) e 575 em 746aae5 (referência e times), dois comportamentos. Na E2.6, dois PRs, um por commit, cada um com a linha de teto excedido e o motivo; um PR único com os dois vira bloqueante (M14).
- A4 (recomendado) server/tests/coletas.test.ts:69 · o teste de lerVersoes ainda afirma que versão sem métrica volta com afeta vazio (o dublê ignora o SQL), o contrário do filtro novo em repositorio.ts:53, e nenhum .pg prova o filtro. Ajustar o caso e afirmar no .pg que a versão da 0017 fica fora de /criterios.
- A5 (recomendado) server/src/modulos/referencia/repositorio.ts:37 · lerVersaoCriterioVigente não tem o filtro novo: sem o seed mock, a versão de partida da 0017 vira o versaoCriterio de /referencia, embora fique escondida de /criterios. Aplicar o mesmo critério ou registrar a diferença em docs/api/metricas.md:76.
- A6 (recomendado) server/src/plataforma/http.ts:168 · fields só vale em /users, mas a F3 do plano lê /cards com fields explícito (I-2 do k084). Na F3, ampliar por caminho como decisão revista, com teste, e não como ajuste de passagem.
- A7 (recomendado) server/migrations/0017_bm_carga_inicial_times.ts:65 · a vigência de partida é o dia da migração menos 12 meses, e card aberto antigo (Q-2b) tem eventos anteriores a vigente_de, sem time. A F4 precisa de regra e teste para instante anterior à vigência de partida.
- A8 (recomendado) docs/architecture/features/052-integracao-businessmap.md:166 · o plano (R-9) põe B-K1 e B-K2 na F0, mas a delegação da E2.2 não os listou, e o diff não toca o coletor. Não bloqueia, porque a F0 não grava staging. Precisam entrar antes de a F3 gravar stg_ (Jarvis decide a etapa).

## Parecer
Reprovado no commit `746aae5`, só pelo A1. O código cumpre a F0 do plano, as decisões H e as regras invioláveis, e nenhum achado pede mudança de lógica neste commit. A volta é de documentação: a revisão da S-22 da ADR 0015, pelo software-architect, nesta branch ou na `docs/052-plano-hierarquia`, antes do PR. Eu revalido pelo delta. A2 e A3 são condições que eu mesmo aplico na E2.6. A4 e A5 são ajustes pequenos de teste e de consistência, que o Jarvis pode juntar à volta, se quiser. A6 a A8 ficam para a F3 e a F4.
