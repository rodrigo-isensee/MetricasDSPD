---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-dicionario-radicais
commit: f0cd292bfe043911b9b2f67c0a1dd461759732e4
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: 059-aba-apontamento, branch da rota (E2.54, K-193)

Links: plano de testes `docs/qa/059-plano-testes.md` (ramo `origin/docs/059-apontamento-discovery`, casos da rota: PR gama), review `docs/reviews/059-gama.md` (aprovado em `abfd287`), segurança `docs/security/059-rota-apontamento.md` (aprovado, ponta `e38c519`, código em `abfd287`), plano técnico `docs/architecture/features/059-aba-apontamento.md` (§3.7 a §3.9), contrato `docs/api/apontamento.md`.

**Parecer: aprovado**, sem bug aberto, sobre a ponta `e7abdad` (código em `abfd287`; os commits depois dele só trazem pareceres de review e de segurança). Escopo `completo` contra a base `origin/develop`: rota única `GET /api/apontamento`, papel `dspd_api_apontamento`, view de quem é do time (0033), interruptor de nome real, 421, `no-store`. O contrato, a biblioteca e a coleta que vieram por merge têm parecer próprio (`059-alfa.md`, `059-beta.md`) e só foram exercitados pelo que a rota usa. O pedido não toca interface: E2E e acessibilidade são n/a nesta branch (ficam em `059-delta.md`).

## Achados
- A1 (recomendado) server/tests/qa-059-rota.pg.test.ts:1 · os testes do QA (CA-AP-12 na rota, rótulos fixos, Outra área, filtro por tipo, A3 da segurança) não estão no repositório, pela regra de commitar só o parecer; o tech-lead deve trazê-los (cópia na pasta de apoio do QA) na integração, senão o A3 da segurança fica sem teste na branch.
- A2 (recomendado) server/tests/coleta-businessmap.pg.test.ts:150 · o teste só passa com `cfg_pessoa_eliminada` vazia (a etapa devolve `sem-sal` com a lista não vazia); qualquer teste que deixe linha ali o derruba. Provado quando uma falha de limpeza do QA deixou a linha e o teste caiu na rodada seguinte. Limpar a tabela no `beforeAll`.

## Critério → teste → resultado
Fixtures só sintéticas (ids na faixa 9 720 000 000, março de 2032, nomes `QA-...`, marcador `MARCADOR-QA-059-ECO`); nenhum teste lê o `.env` nem chama o BusinessMap. Testes do QA: `qa-059-rota.test.ts` (48, banco falso, sem apoio nos testes do autor) e `qa-059-rota.pg.test.ts` (6, PostgreSQL real com os papéis de verdade).

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-AP-6 consulta estrita (CT-45) | 13 abusos (nome no lugar de `pessoaRef`, `p0`, `p01`, repetido na forma `pessoa=p1&pessoa=p1`, tipo com texto e com sinal, dois níveis de matriz, nível vazio, chave desconhecida, mês no lugar de data, 29 de fevereiro em ano comum, só o fim do mapa) dão 400 só com `path` e `code`, nenhuma chamada ao banco, sem eco no corpo nem no log | cada lista no limite e +1: pessoa 200/201, projeto 200/201, tipo 50/51, qualidade 6; janela 366/367; mapa 62/63; `de` igual a `ate` | passou |
| CT-38 janelas | mesmos casos de janela e mapa acima, com `no-store` no 400 | 366/367 e 62/63 dias | passou |
| CT-84 Host e Origin (R4-5) | 421 sem corpo, sem eco no log e sem tocar o banco, com o interruptor ligado e desligado: `localhost.`, `localhost@atacante`, `localhost/x`, `[::ffff:127.0.0.1]`, `127.0.0.2`, Origin com credencial embutida, subdomínio do atacante, rede privada não declarada, Origin vazio; Host ausente (HTTP/1.0) e Host vazio em socket real recusados (o `inject` do Fastify põe um Host padrão, por isso o socket) | comparação exata, sem sufixo nem prefixo; caixa e porta aceitas; rede local só quando declarada | passou |
| CA-AP-7 cabeçalhos (CT-46, parte da rota) | `no-store` em 200, 400, 421 e 500, com Origin local; nenhum `Access-Control-*`; OPTIONS, POST, PUT, DELETE e PATCH respondem 4xx sem CORS | pré-voo; resposta de erro | passou |
| CA-AP-3 log e erro (CT-42, parte da rota) | falha do banco com marcador no erro: 500 genérico sem o marcador; valores recusados não vão ao log | erro do driver | passou |
| CA-AP-4 interruptor (CT-43) | com `nomesReais` falso, só `Pessoa n`, `Pessoa não identificada` ou `Outra área` e nenhum nome nem `user_id` no corpo; ligado, o nome só em `opcoes.pessoas[].rotulo`, uma vez, e Outra área nunca recebe nome; a guarda de partida e o valor inválido (`talvez`, vazio) são do teste de configuração do autor, que rodou verde no `pronto` | desligado por padrão; HOST fora do perímetro | passou |
| CA-AP-1 papéis (CT-40, lado da rota) | `dspd_api_apontamento` negado (42501) em `stg_`, `evt_`, `cfg_pessoa_eliminada`, `responsavel_id`, `logged_time_id`, `responsaveis` e em INSERT, UPDATE e DELETE do fato; `dspd_api` negado na view, no fato e em `pessoa_ref` | tabela interna; escrita | passou |
| CA-AP-12 piso de 20 (CT-51) | na rota com banco real: pessoa com 20 apontamentos tem utilização `ok`, com 19 `insuficiente` e a soma de horas segue; ao tirar o dia 1 do período, os 20 viram 19 e a utilização cai para `insuficiente` | 19 e 20; contagem na janela do filtro | passou |
| Outra área fora dos blocos por pessoa | soma em kpis e nas opções com rótulo fixo; fora de `capacidade.porPessoa` e de `diario.linhas`; `pessoasAtivas` só do time; chave de pessoa real e nome ausentes | soma de várias pessoas; interruptor ligado e desligado | passou |
| Filtro por tipo | `tipo=12` (o id de `opcoes.tipos`) recorta, `tipo=999` zera com 200 (nenhum 422), `tipo=12&tipo=34` do teste do autor segue verde | tipo inexistente | passou |
| A3 da segurança da rota | com uma pessoa do time eliminada pelo procedimento a pedido: a view `apt_pessoa_time` não devolve o `pessoa_ref` antigo, `opcoes.pessoas` e `capacidade.porPessoa` também não, nome e chave ausentes do corpo com o interruptor ligado e desligado, horas totais iguais às de antes (agregado do time), pessoas ativas de 3 para 2 | pessoa eliminada; as duas posições do interruptor | passou |
| CA-AP-5 (CT-44) e CT-30 | cobertos pelos testes do autor, rodados no `pronto`: OpenAPI fora da aba sem `pessoaRef`, nome, `responsavel_id` nem `user_id`; a rota só repassa o que a biblioteca devolve | rota nova | passou (autor) |
| CA-AP-6 sem banco / CT-63 (sem papel) | a rota responde sem credencial (decisão do dono, "C"); não há tela de acesso negado | n/a | passou |

## Cenários e resultado real
- **Recursos:** antes de cada suíte, MemAvailable de 14 a 15 GB e load abaixo de 3; uma suíte por vez, na worktree 052g, HEAD `e7abdad`.
- **`pnpm run pronto`** (HEAD `e7abdad`, após adicionar os testes do QA): rc 0. `test:trava`, `lint` e `format:check` limpos. Contratos 199; metricas 42 arquivos e 1257 testes; mock 258; server 1590 passaram e 229 pulados (os `.pg`); web 1256; tools: homolog 73, pesquisa 33, spec-check 14, docs-contratos 102 e `docs:check` ok (861 páginas). Cobertura de 100% do server mantida com os testes do QA presentes.
- **Suíte `.pg`** (`pnpm run test:pg`, banco do Compose): rc 0, 33 arquivos e 230 testes, contra 224 do autor mais os 6 do QA. Uma rodada anterior caiu por falha de limpeza do meu próprio teste (DELETE em tabela append-only), corrigida; ela é o que revelou o A2.
- **E2E e acessibilidade:** n/a, a branch não toca interface.
- **Vermelho antes do verde:** os testes do QA vêm depois do código, então a prova é por mutação sobre o código da rota (cada mutante aplicado, suíte rodada, arquivo restaurado; `git status` limpo ao fim). Mutantes e resultado, todos mortos:
  - M1 `hosts.ts` ignora o Origin: rc 1, 8 falhas ("421 ... Origin com credencial embutida" e vizinhos).
  - M2 `rotas.ts` sem o cabeçalho `no-store`: rc 1, 32 falhas.
  - M3 `hosts.ts` compara o Host por prefixo: rc 1, 4 falhas ("421 ... ponto final no nome").
  - M4 `apontamento.ts` (contrato) limite de tipo 51: rc 1, 1 falha ("tipo 51 responde 400").
  - M5 janela de 367 dias aceita: rc 1, 2 falhas.
  - M6 `rotas.ts` aceita valor repetido: rc 1, 1 falha ("repetida na forma lista").
  - M7 piso de 19 no lugar de 20 (`comum.ts`): rc 1, 1 falha, no teste CA-AP-12 do QA.
  - M8 eliminação sem o DELETE da pessoa (`eliminacao.ts`): rc 1, 2 falhas, o teste do autor e o A3 do QA.
- **Mutação (ferramenta):** Stryker não está instalado e `docs/engineering/praticas.md` não fixa meta; os 8 mutantes acima foram escolhidos sobre as linhas de guarda do diff da rota (Host, Origin, cabeçalho, estrita, limites, piso, eliminação). Nenhum sobreviveu.
- **Conferência com o review e a segurança:** ambos aprovados na ponta de código; os recomendados A1 a A4 do review (semântica do corte de 12 meses para card encerrado, dois INSERT de critério sem transação, `opcoes.subtarefas` de outro recorte, cast sem comentário) não são bloqueantes e o A1 já está como pergunta ao dono; o A3 da segurança fica provado por este parecer, com a ressalva do A1 acima.
- **CI do GitHub:** run `41429255932` em `abfd287` com sucesso, citado pelo review, não refeito aqui.
- **Orçamento e teto:** o teto da decisão M14 é coberto pela decisão do dono de 2026-11-02; o PR da rota leva a linha `teto: excedido` com o número recontado e só abre depois do PR da exceção mesclado. Não é gate do QA.

## Renovação por delta (E2.73, K-193)
Intervalo `0b4519c8791705208c4d2b1da133565a127937a2..1bf3338d43124f711d98a1bc15ac42ffb2123da4`: merge da develop (squashes dos PRs 194 e 195) na rota. O parecer acima segue valendo para o que a rota entrega; esta seção cobre só o delta, com o veredito **aprovado** sobre `1bf3338` (os commits depois dele, `cbff473`, `2b23fb0` e `4fb983b`, só mexem em pareceres de review, devops e segurança).
- **Diff do intervalo:** só 4 arquivos de documentação (`docs/qa/059-beta.md`, `docs/qa/059-excecao-apontamento.md`, `docs/reviews/059-beta.md`, `docs/security/059-beta.md`); nenhum arquivo de código muda, porque a rota já continha a coleta e a trilha B.
- **Diff contra a develop** (`origin/develop..origin/feature/059-rota-apontamento -- packages`): uma linha, o export `ordenarPorPessoa` em `packages/metricas/src/businessmap/index.ts`. A função existe em `apontamento/comum.ts`, já é usada por `apontamento/index.ts` e tem teste (`apontamento.test.ts`, ordem com e sem nome real e com Outra área); é a causa do carimbo desatualizado do `forge-check pr`, sem mudança de comportamento.
- **Suíte sobre o head** (MemAvailable 14 GB, load 0,8; uma por vez): `pnpm run pronto` rc 0: contratos 199, metricas 1257, mock 258, server 1542 passaram e 224 pulados (os `.pg`), web 1256, homolog 73, pesquisa 33, spec-check 14, docs-contratos 102, `docs:check` ok (865 páginas). `pnpm run test:pg` rc 0: 32 arquivos, 224 testes (o parecer anterior contava 230 com os 6 do QA, que seguem fora do repositório, A1).
- **Vermelho antes do verde e mutação:** nenhum teste novo nem guarda nova no delta; os mutantes M1 a M8 seguem sobre linhas que o merge não tocou. Interface e acessibilidade: n/a.
- **Achados:** A1 e A2 do parecer anterior seguem como recomendados, sem mudança (a suíte `.pg` passou com `cfg_pessoa_eliminada` vazia, como antes). Nenhum achado novo, nenhum bug aberto.

## Renovação por delta na branch do front (E2.88, K-193)
Branch `feature/059-aba-front`, base `origin/develop` (31de83f), ponta revisada `4882e16b45de15fbb391c93deee35e67188ca659`. Veredito **aprovado**. Causa do carimbo: `docs/tecnica/arquitetura-front.md` mudou na branch (seção 14, aba Apontamento); a rota não mudou.
- **Diff contra a develop:** `server` e `packages` sem nenhuma linha de diferença (a rota, o contrato e a biblioteca são os da develop, com os squashes dos PRs 194 a 196). O que a branch muda está em `web` (aba, seletor, router), `e2e`, `docs/ux` (revisões r1 a r4) e `docs/tecnica/arquitetura-front.md`; o diff do arquivo de arquitetura soma só a seção 14 e uma linha do diagrama, sem mudar contrato.
- **Casos da rota seguem atendidos com o front:** a seção 14 descreve o front como cliente da rota (GET `/api/apontamento`, mesma origem, `no-store`, resposta validada por `respostaApontamentoSchema`, consulta pela mesma `consultaApontamentoSchema` do servidor, filtro por tipo pelo id de `opcoes.tipos`, `outra-area` sem nome); isso bate com CA-AP-6 (consulta estrita), CA-AP-7 (`no-store`), CA-AP-4 (rótulos fixos com interruptor desligado) e com os testes de Outra área e filtro por tipo deste parecer. Nenhum caso da rota perdeu a base.
- **Prova de suíte:** pela DECISÃO TÉCNICA da prova de suíte na renovação sem código, valem o `pronto` (web 1401) e o `test:e2e` (795, 26,7 min) verdes da E2.78 em `dc3a5b4`. Desde `dc3a5b4` só mudam `docs/qa/059-delta.md` e `docs/reviews/059-gama.md` (`git diff --stat dc3a5b4..HEAD`), nenhum arquivo de código.
- **Reteste dirigido** (MemAvailable 14 GB, load 0,4; uma suíte por vez; HEAD `4882e16`): web, `api.test.ts`, `ligacao.test.tsx`, `rota.test.tsx` e `exportacao-fora.test.ts`: 4 arquivos, 32 testes, rc 0. Server, projeto `unit`, filtro `apontamento` (rota, hosts, papel, sql, config, classificador, coleta e demais): 16 arquivos, 367 testes, rc 0. Os `.pg` e os 54 testes do QA da rota (A1 abaixo) não foram refeitos: o server não muda desde a rodada da E2.73.
- **Vermelho antes do verde e mutação:** nenhum teste novo de rota nem guarda nova de rota neste delta; os mutantes M1 a M8 seguem sobre linhas de `server` e `packages` que a branch não toca. Acessibilidade e E2E do front: parecer `059-delta.md`.
- **Achados:** A1 e A2 seguem como recomendados, sem mudança. Nenhum achado novo, nenhum bug aberto.

## Renovação por delta na branch do dicionário em radicais (E2.92, K-193)
Branch `feature/059-dicionario-radicais`, base `origin/develop` (60be28a), ponta revisada `f0cd292bfe043911b9b2f67c0a1dd461759732e4` (merge da develop com o squash do PR 198). Veredito **aprovado**. Causa do carimbo: `docs/architecture/fontes/apontamento-dicionario.json` mudou (versão `2026-11-02-v2`, termos em radicais); a rota não mudou.
- **Diff contra a develop:** soma o dicionário (6 linhas trocadas), um parágrafo de `docs/architecture/server.md`, o teste `server/tests/apontamento-dicionario.test.ts` e pareceres (`059-epsilon` de review e de QA, a renovação da exceção). `server/src` e `packages` sem nenhuma linha de diferença: rota, contrato, biblioteca e classificador são os da develop.
- **A rota segue atendida com o dicionário novo:** ela não lê o arquivo; só repassa rótulo e código de subgrupo vindos de `ref_apontamento_subgrupo` e `fato_apontamento`, preenchidos pela carga (`ref:sync`) e pela coleta. O contrato `docs/api/apontamento.md` (filtro `subgrupo` por lista de códigos, até 50) não muda: os 12 códigos, as prioridades e as duas regras por tipo são os da v1; só os termos viram radicais. CA-AP-6 (consulta estrita) e o filtro por subgrupo seguem válidos sem mudança de código.
- **Prova de suíte** (MemAvailable 14 GB, load 0,8; uma por vez; HEAD `f0cd292`): server, `vitest run --project unit apontamento`: 16 arquivos, 381 testes, rc 0 (rota, hosts, papel, sql, config, classificador, coleta e o teste do dicionário). Os `.pg` e os testes do QA da rota (A1 abaixo) não foram refeitos: o server não muda desde a rodada da E2.73. O vermelho antes do verde dos testes novos do dicionário e a mutação dos 19 termos estão em `docs/qa/059-epsilon.md`.
- **Vermelho antes do verde e mutação:** nenhum teste novo de rota nem guarda nova de rota neste delta; os mutantes M1 a M8 seguem sobre linhas de `server` e `packages` que a branch não toca. Interface e acessibilidade: n/a.
- **Achados:** A1 e A2 seguem como recomendados, sem mudança. Os recomendados do dicionário (analiso e call) estão em `059-epsilon.md`. Nenhum achado novo, nenhum bug aberto.

## Bugs
Nenhum aberto. Nenhum registro em `docs/qa/bugs/`.
