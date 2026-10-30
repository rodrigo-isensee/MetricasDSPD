---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: 27d32b26f346fdfd56d1ab45c5e38579d7c1018a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E1.17, script de diagnóstico da WS1, K-185)

Escopo: `9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5..27d32b26f346fdfd56d1ab45c5e38579d7c1018a` (1 commit, 7 arquivos, 734 linhas a mais). Lido por leitura: o diff inteiro e as seções 2, 3, 4, 8 e 9 do `docs/engineering/praticas.md`.

Saída de ferramenta: `pnpm run pronto` da raiz da worktree, rodado uma vez neste review, deu rc=0. No `server`: 28 arquivos de teste aprovados e 15 pulados (os `*.pg.test.ts`, sem banco), 619 testes aprovados; cobertura de 100% em instruções (1438/1438), ramos (889/889), funções (374/374) e linhas (1167/1167), o que inclui o `diagnostico.ts`. Lint, formato e `docs:check` ok (799 páginas). Não rodei o `shellcheck` no `scripts/bm-diagnostico.sh` porque o `pronto` não o chama. O script usa a mesma linha de `.env` do `scripts/db.sh:5`.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/diagnostico.ts:104 · `redirect: 'error'` sem teste: sem ele, o fetch seguiria um 302 levando o cabeçalho `apikey` a outro host. Falta um teste com servidor falso respondendo 302 para outra porta, sem pedido lá. Vira cartão de segurança (E1.16).
- A2 (recomendado) docs/integracao/businessmap-api-configuracao.md:150 · o texto diz "repetem até 3 vezes", mas o código faz 3 tentativas no total (diagnostico.ts:163) e o 429 espera até 5 vezes (:136), o que o parágrafo não diz. Ajustar o texto.
- A3 (recomendado) server/src/modulos/businessmap/diagnostico.ts:163 · um 429 persistente faz 5 esperas e mais 3 tentativas (8 pedidos), mas a mensagem diz "(3 tentativas)". Dizer o total real ou "limite de 429 esgotado".
- A4 (recomendado) docs/reviews/052-ws1-estrutura.md:1 · teto M14: 732 linhas de código e teste (numstat do intervalo). O corpo do PR leva `teto: excedido, 732 linhas, script de diagnóstico único: lógica, entrada e testes contra servidor falso`. Aceito por mim; sem a linha, vira bloqueante.

## Parecer
Aprovado. Pontos conferidos:
- O Entregar da E1.15 está cumprido. A lógica fica em `modulos/businessmap/diagnostico.ts` e a entrada fina em `entradas/` (fora da cobertura, como o `vitest.config.ts` define). O `bm:diagnostico` chama `scripts/bm-diagnostico.sh`, que carrega o `.env` como o `db.sh`. O relatório sai em Markdown no stdout.
- Variáveis: `BUSINESSMAP_URL_BASE` e `BUSINESSMAP_APIKEY` são obrigatórias (código 2, mensagem só com o nome). `QUADROS_IDS`, `LIMITE_POR_MINUTO` (25) e `TIMEOUT_MS` (30000) são validadas por zod, e valor inválido aparece só pelo nome. O `plataforma/config.ts` não foi tocado.
- Cliente só GET. A lista fechada `CAMINHOS_PERMITIDOS` é exportada e testada. O regex recusa o pedido antes da rede (o teste confere 0 requisições para `/cards`, `/users`, `allowedValues` e outros). Os pedidos saem em sequência e espaçados pelo limite por minuto. O 429 segue o `retry_after` do corpo, depois o do cabeçalho e, sem nenhum, 60 s, sempre entre 1 e 120 s. 401 e 403 param o relatório com `autenticacao`. 5xx e erro de rede deixam a seção como `indisponivel` ou `tempo-esgotado` depois de 3 tentativas.
- Allow-list na saída: `reduzir` guarda só os escalares dos campos permitidos e os filhos de estrutura. O campo customizado fica só com `field_id`, `name` e `type`. O teste injeta `email`, `realname`, `username`, `user_id`, `description`, `owner_user_id` e `allowedValues` em todas as respostas e confere que nenhum aparece. Resposta em formato inesperado mostra só as chaves de topo (filtradas por `\w{1,40}`, no máximo 10).
- Chave: vai só no cabeçalho. Toda mensagem passa pelo `limpar`, e o teste confere que a chave não aparece no stdout nem no stderr em sucesso, 401, 403, 500, erro de rede, timeout e formato estranho, nem na URL.
- Os testes falham sem a mudança: importam o módulo novo. As afirmações pegam o defeito (método, caminho, cabeçalho, campos de pessoa, espera do 429, número de tentativas). São determinísticos, com `dormir` e `agora` injetados e servidor falso em 127.0.0.1. O teste de relógio real usa limite 1000/min (cerca de 60 ms por pedido).
- Linha do `server/src/modulos/businessmap/index.ts`: fica. O `index.ts` é a interface pública do módulo, e a entrada importa por ele, como o `entradas/worker.ts` faz com `modulos/operacao/index.js`. A cadeia de imports (`webhook`, `responsaveis`, `pool`) não tem efeito colateral ao carregar: nada conecta nem lê config no import. Só os testes importam o arquivo direto, para as funções internas.
- Documentação do §8 coerente com o código (caminhos, variáveis, padrões, códigos de saída, o que não traz), exceto o ponto do A2.
- Regras invioláveis e ADR 0020: sem cards, sem `/users`, sem valores de campo, sem métrica nem visão por pessoa. Nada é gravado na base (ADR 0022 fora). BusinessMap sozinho.
- Nota para o dono (sem achado): nomes de raia, coluna e quadro saem como estão. Se algum quadro tiver raia com nome de pessoa, ela aparece. O próprio §8 manda o dono conferir a saída antes de colar (E1.20).
- Commit em Conventional Commits em português, com `Cartão: K-185` e as linhas de atribuição; um tema só.
- Segurança: o parecer do security-engineer (E1.16) vem em paralelo e não é refeito aqui. O A1 vai para ele.
