---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: f24c3a9b98722b2bf62961ef3ea8cf75e11de291
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---
# QA: 052-integracao-businessmap (E1.18, script de diagnóstico da WS1, K-185)

Veredito: aprovado, com 2 recomendações que não devolvem. Testado o head `780000b` (script `pnpm run bm:diagnostico` e `server/src/modulos/businessmap/diagnostico.ts`). Obrigações lidas do Entregar das duas entregas do E1.15 (briefs node-backend 1 e 2) e do §8 de `docs/integracao/businessmap-api-configuracao.md`; sem especificação de UX nem contrato de API (ferramenta de linha de comando). Pareceres de segurança (1bc1c52) e de review (780000b) aprovados, lidos só por veredito e achados.

Método: caixa-preta. Servidor falso próprio em `node:http` (127.0.0.1, portas 4701 a 4710) que devolve pessoa e `allowedValues` em todas as respostas e registra método, caminho e cabeçalho `apikey` de cada pedido; chave sentinela de teste. O script real rodou como processo (`tsx src/entradas/diagnostico-businessmap.ts`) com as variáveis só no comando. Não houve leitura nem edição de `.env` (a worktree não tem `.env`, conferido por listagem de nome, o que também impede o `scripts/bm-diagnostico.sh` de sobrescrever as variáveis), nem chamada ao BusinessMap real.

## Achados
- A1 (recomendado) server/tests/diagnostico-businessmap.test.ts:1 · nenhum teste afirma o cabeçalho "sem campos de pessoa; confira os nomes de quadro, coluna e raia antes de colar" (mutante que o encurta sobrevive). A frase existe e saiu certa na execução real; cartão K-186 pode somar a guarda.
- A2 (recomendado) server/src/modulos/businessmap/diagnostico.ts:98 · a redação da chave (`limpar`, também em :281) não tem teste que a faça falhar: as mensagens são montadas só de texto fixo e código de erro filtrado, então hoje é defesa em profundidade sem caminho vivo. Manter e justificar.
- A3 (recomendado) server/src/modulos/businessmap/diagnostico.ts:243 · o nó raiz de `currentStructure` sai como `- (sem campos permitidos)` seguido dos filhos; correto, mas confunde o dono ao ler a seção. Estético.

## Renovação por delta (E2.22, depois da E2.19)
Veredito: aprovado, mantido. Este parecer foi dado sobre `780000b` e ficou desatualizado porque o `.env.example` mudou depois dele: o commit `2303cd2` (F0 do 052) somou o bloco do BusinessMap e o merge `f24c3a9` (E2.19) somou o bloco do Acelerato da develop. Delta conferido (`780000b..f24c3a9`): `server/src/modulos/businessmap/diagnostico.ts`, `server/src/entradas/diagnostico-businessmap.ts`, `scripts/bm-diagnostico.sh` e `server/tests/diagnostico-businessmap.test.ts` não mudaram, então as obrigações e os resultados das tabelas abaixo continuam valendo.

Só o `.env.example` foi relido (ferramenta Read, no head `f24c3a9`): bloco do BusinessMap nas linhas 25 a 32 (`BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS` e os três de limite, tempo e página) e bloco do Acelerato nas linhas 33 a 44 (`ACELERATO_MYSQL_*`, comentados), separados por linhas de comentário próprias, sem mistura. As variáveis que o script lê continuam as mesmas e sem valor no exemplo; nenhuma chave nem senha no arquivo. O `.env` não foi lido.

Reexecução: `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052c run pronto` rc=0 (server 869 testes passaram e 106 pulados, cobertura do server 100%; os 30 testes do diagnóstico estão entre eles), o mesmo run registrado no parecer `docs/qa/052-f0-fundacoes.md`. Sem mutante novo: o código do script não mudou, e A1 e A2 do parecer anterior seguem como recomendações.

## Critério → teste → resultado
Obrigação = item do Entregar (`E1.15` e volta 1).

| Obrigação | Teste (QA, servidor falso) | Fronteira protegida | Resultado |
|---|---|---|---|
| Só GET, só caminhos da lista | `ok`: 8 pedidos, todos GET, em /workspaces, /boards, /boards/{10,11}/workflows e currentStructure, /cardTypes, /customFields | sem /users nem /cards (0 pedidos) | passou |
| Chave só no cabeçalho `apikey` | `ok`: 0 pedidos sem a chave certa; chave em stdout e stderr: 0 em todos os cenários | chave fora de saída, erro e URL | passou |
| https obrigatório; http só em loopback | `http://exemplo.invalid`, `ftp://`, `http://localhost.evil.com`, `http://127.0.0.1.evil.com`, `http://localhost@exemplo.invalid`: rc=2 `variável inválida: BUSINESSMAP_URL_BASE`; `http://127.0.0.1` e `http://[::1]` aceitos | host parecido com loopback, userinfo, esquema | passou |
| 302 para outro host recusado | servidor 4704 responde 302 para 4705: 0 pedidos em 4705, seção `indisponivel`, rc=0 | chave não vai a outro host | passou |
| Allow-list sem campo de pessoa | respostas com e-mail, realname, username, owner, user_id, `allowedValues`, descrição: 0 ocorrências na saída | pessoa e valores de lista descartados | passou |
| 401 e 403 | rc=1, stderr `autenticacao: GET /workspaces respondeu 40x`, 1 pedido (sem repetir) | credencial rejeitada | passou |
| 429 | 1º pedido 429 com retry_after=1: repete e conclui, rc=0 | limite da API | passou |
| 5xx | 12 pedidos (3 tentativas por seção), seções `indisponivel ... HTTP 500 (3 tentativas)`, corpo com a chave não vaza | falha do servidor | passou |
| Erro de rede | porta fechada: `erro de rede ECONNREFUSED (3 tentativas)`, rc=0, sem chave | rede fora | passou |
| Variável obrigatória faltando | sem chave, sem URL, chave só com espaços: rc=2 e nome da variável, nunca o valor | vazio | passou |
| `BUSINESSMAP_QUADROS_IDS` | `11`: só o quadro 11 no relatório e só pedidos a /boards/11; `abc`: rc=2 `variável inválida: BUSINESSMAP_QUADROS_IDS` | filtro e formato inválido | passou |
| Formato não reconhecido | `{foo,bar}`: `formato não reconhecido: foo, bar`, só chaves de topo | resposta inesperada | passou |
| Cabeçalho "sem campos de pessoa; confira ..." | presente no relatório real (linha 3) | texto exato | passou (sem teste automático, A1) |
| `pnpm run bm:diagnostico` ponta a ponta | servidor falso 4710: rc=0, 52 linhas em stdout (banner do pnpm incluso), chave ausente; sem chave: pnpm sai com 1 e repassa `exit code 2` | saída e código | passou |
| Nada gravado, árvore limpa | `git status --porcelain` vazio depois de tudo | n/a | passou |

Observação: o pnpm imprime o banner (`> metricas-dspd@... bm:diagnostico`) no stdout; o dono deve colar só a partir de `# Diagnóstico`. Código de saída via pnpm é 1 para qualquer falha; o 2 do script só aparece na linha de erro do pnpm.

## Mutação no código alterado (manual, em 9 mutantes, revertidos por `git checkout`; árvore limpa)
Rodado `vitest run tests/diagnostico-businessmap.test.ts` (30 testes) com cada mutante.
- M1 `redirect: 'follow'`: morreu. M2 https aceito sempre: morreu. M3 método POST: morreu. M4 campo `email` na allow-list: morreu (3 testes). M6 403 não tratado como autenticação: morreu. M8 filtro de quadros desligado: morreu. M9 lista fechada desligada: morreu.
- M5 redação da chave desligada: sobreviveu (A2, sem caminho vivo). M7 cabeçalho encurtado: sobreviveu (A1).

Vermelho antes do verde: o módulo `diagnostico.ts` não existe na base `9aa6b29`, então todos os testes novos falham por carga na base; o que vale como prova são os 7 mutantes mortos acima. `forge-testes --vermelho` não foi usado (comando da fábrica; sem ele disponível neste ambiente de projeto).

## Suíte
`pnpm run pronto` na raiz da worktree, uma vez, antes do commit: rc=0. Server 621 passaram, 84 ignorados (testes dependentes de banco, já existentes), cobertura 100% (instruções 1446/1446, ramos 899/899, funções 375/375, linhas 1173/1173); web 1228; metricas 1092; mock 258; contratos 161; homolog 73; pesquisa 33; spec-check 14; docs-contratos 102 e `docs:check` ok. Nenhum teste marcado como skip por mim.

## Cenários e resultado real
Resumo nas tabelas acima: 16 obrigações, 16 passaram, 0 bugs, 0 falhas. Acessibilidade e E2E de navegador não se aplicam (sem interface).
