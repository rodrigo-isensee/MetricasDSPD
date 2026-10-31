---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: 47ea60ba0533d677c268dbf12721e9a84a475055
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E1.17, script de diagnóstico da WS1, K-185)

Escopo da primeira rodada: `9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5..27d32b26f346fdfd56d1ab45c5e38579d7c1018a` (1 commit, 7 arquivos, 734 linhas a mais). Lido por leitura: o diff inteiro e as seções 2, 3, 4, 8 e 9 do `docs/engineering/praticas.md`.

## Renovação por delta (E1.26, 2026-10-30)

Motivo: o `forge-check pr 052-integracao-businessmap` marcou este parecer como desatualizado porque a ADR 0015 mudou depois dele (revisão 1 da S-22, commits `52dfb30` e `485df6a` da `docs/052-plano-hierarquia`). O `forge-check delta --parecer` não roda aqui (`22af869` não é ancestral da branch, que nasceu do squash `11141d7`); o delta lido foi `git diff 11141d7 47ea60b -- docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md`, e só ele.

Lido: a linha "Revisão 1" do cabeçalho, a linha "HTTP de saída do BusinessMap" da tabela, a linha do `axios` em "Não adotar", o item "Timeouts em tudo", a linha S-22 e a seção "Revisão 1 (2026-10-30)" com o critério de reversão. Já lido e fora do delta: todo o código e os testes da WS1 (rodadas anteriores), sem mudança desde `11141d7`.

Conferência do script da WS1 contra a revisão: `diagnostico.ts` já usa `fetch` nativo, sem ky e sem p-throttle (`server/package.json` não tem nenhum dos dois); não segue redirect (`redirect: 'error'`, :112, mesmo efeito do 3xx em erro que a ADR exige numa volta); o erro de rede lê só o `code` do `cause` (:165) e não o propaga; só GET. O alcance da revisão 1 é o cliente do coletor em `plataforma/http.ts` (F0); o script de diagnóstico é manual, anterior à F0 e fora desse alcance. Conclusão: a mudança da ADR 0015 não afeta o script da WS1; nenhum achado novo.

## Revalidação (volta 1, delta)

Intervalo do delta: `c2f20382eb32f7a35228a44faa7b9070e086da6c..22af8695311a303f81760fbaac79c307664760d5` (1 commit de código, `22af869`; o `1bc1c52` seguinte só traz o parecer de segurança). O `forge-check delta --parecer docs/reviews/052-ws1-estrutura.md` listou e eu li só isto:
- `docs/integracao/businessmap-api-configuracao.md:150`
- `server/src/modulos/businessmap/diagnostico.ts`: 46-53, 55, 136, 151, 173 e 310
- `server/tests/diagnostico-businessmap.test.ts`: 285-297 e 302-312

Já lido na primeira rodada e fora do delta: o resto do `diagnostico.ts`, a entrada em `entradas/`, o `index.ts`, o `scripts/bm-diagnostico.sh`, o `package.json` e o resto dos testes.

Saída de ferramenta: `pnpm run pronto` da raiz da worktree, uma vez, rc=0. No `server`: 28 arquivos de teste aprovados e 15 pulados (os `*.pg.test.ts`, sem banco), 621 testes aprovados (2 a mais que na primeira rodada); cobertura de 100% em instruções (1446/1446), ramos (899/899), funções (375/375) e linhas (1173/1173). `docs:check` ok (800 páginas), web dentro do orçamento.

Achados da primeira rodada:
- A1 resolvido. O teste "302 para outro host" (tests:290) sobe um segundo servidor e confere 0 requisições nele, a seção `indisponivel` e a ausência da chave na saída. O mesmo teste fecha o A2 da segurança.
- A2 resolvido. O §8 diz agora 3 tentativas no total, com espera de 1 s e 4 s, o 429 com até 5 esperas por caminho e a mensagem `limite de 429 esgotado`, o que bate com o código (:145, :173, :174).
- A3 resolvido. A mensagem do 429 persistente diz `limite de 429 esgotado`, e o teste da linha 285 afirma esse texto.
- A4 segue para o PR da E1.19, com o número atualizado (abaixo).

Correção do A1 da segurança: `urlSegura` (:47) exige `https:` e aceita `http:` só em `127.0.0.1`, `localhost` e `[::1]` (o `hostname` do WHATWG traz os colchetes no IPv6, então a comparação está certa). O teste da linha 302 recusa `http://` de host comum, `http://10.0.0.1` e `ftp://127.0.0.1` com código 2 e só o nome da variável, e aceita https e os três loopbacks. Cobertura de 100% no arquivo, pela saída acima. A3 da segurança: o cabeçalho (:310) promete agora "sem campos de pessoa" e pede para conferir os nomes de quadro, coluna e raia antes de colar.

Sem regressão no delta: a troca do texto da mensagem não muda tipo de erro nem código de saída; o `refine` só estreita a validação que já existia.

## Achados
- A4 (recomendado) docs/reviews/052-ws1-estrutura.md:1 · teto M14: 765 linhas de código e teste (numstat de 9aa6b29..22af869). O corpo do PR leva `teto: excedido, 765 linhas, script de diagnóstico único: lógica, entrada e testes contra servidor falso`. Aceito por mim; sem a linha, vira bloqueante.
- A5 (recomendado) server/src/modulos/businessmap/diagnostico.ts:151 · `limite429` não volta a falso no `catch` de erro de rede: 429 esgotado seguido de 2 erros de rede sai como "erro de rede (limite de 429 esgotado)". Zerar no `catch` ou derivar da última falha. Só texto; não devolve.

## Parecer
Aprovado no commit `22af869`. A1 a A3 resolvidos, sem regressão; A4 fica para o corpo do PR da E1.19; A5 é recomendação. Pontos conferidos na primeira rodada e que seguem valendo:
- O Entregar da E1.15 está cumprido. A lógica fica em `modulos/businessmap/diagnostico.ts` e a entrada fina em `entradas/` (fora da cobertura, como o `vitest.config.ts` define). O `bm:diagnostico` chama `scripts/bm-diagnostico.sh`, que carrega o `.env` como o `db.sh`.
- Cliente só GET numa lista fechada (`CAMINHOS_PERMITIDOS`, testada), regex que recusa antes da rede, pedidos em sequência dentro do limite por minuto, `redirect: 'error'`.
- Allow-list na saída: campo customizado só com `field_id`, `name` e `type`; o teste injeta campos de pessoa e `allowedValues` e confere que nenhum aparece.
- Chave só no cabeçalho; toda mensagem passa pelo `limpar`; o teste confere a ausência da chave no stdout e no stderr em todos os caminhos de erro.
- Linha do `server/src/modulos/businessmap/index.ts`: fica (interface pública do módulo, sem efeito colateral ao importar).
- Regras invioláveis e ADR 0020: sem cards, sem `/users`, sem valores de campo, sem métrica por pessoa; nada gravado na base; BusinessMap sozinho.
- Commits em Conventional Commits em português, com `Cartão: K-185`; um tema por commit.
- Segurança: o parecer do security-engineer (`docs/security/052-ws1-estrutura.md`, aprovado em `1bc1c52`) não é refeito aqui.
