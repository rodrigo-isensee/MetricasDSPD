---
tipo: revisao-seguranca
contrato: 1
pedido: 081-categoria-erro-entradas
branch: feature/081-categoria-erro-entradas
commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: categoria do erro nas entradas de referência (K-241)

Propósito: parecer do gatilho "mensagem de erro e log de entrada que lida com segredo" da E1.1: `ref:sync-calendario`, `ac:ref-sync` e `bm:ref-sync` passam a imprimir a categoria do erro por `categoriaDoErro` em vez da frase fixa. Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `852b9406...1f8a19c6` (8 arquivos); nada foi alterado em código e nada rodou contra a base real.

## Gatilho
Segredo: a saída de entradas que recebem `PG_REF_URL` (URL com senha) e credenciais (`R-SEGURANCA`).

## Resultado por pergunta

**1. A saída leva valor, URL, senha, host, papel ou texto do erro do banco? Não.**
- `categoria-erro.ts:25-30`: o retorno é uma de quatro cadeias: `configuração: <nomes>`, `autenticação`, `conexão` ou `outro`. A única parte variável é `e.nomes.join(', ')`. O texto da mensagem é lido só por `TEMPO_ESGOTADO.test(...)` (`:30`), para decidir a categoria, e nunca devolvido. O `code` do erro também só classifica; não é impresso.
- Caminhos que o teste não cobre, lidos no código: `AggregateError` sem `code` próprio usa só os `code` dos filhos (`:27-28`), sem imprimir nada deles; `AggregateError` aninhado em mais de um nível cai em `outro` (seguro, só menos informativo); erro sem `code`, `code` não string, não-`Error`, `null` e `undefined` caem em `outro` (`codigoDe` usa `?.` e checa `typeof`); `mensagemDe` devolve vazio para não-`Error`. Não há `JSON.stringify`, `String(e)` nem `e.stack` no caminho de saída.
- Os três pontos de saída (`ref-sync-calendario.ts:27`, `ref-sync-ac.ts:26`, `ref-sync-businessmap.ts:28`) só interpolam `categoriaDoErro(e)` ou a mensagem de `ErroDominio`/`ErroCalendario`, que já existia e não mudou. Nenhum outro `stderr`, `console` ou log de erro foi adicionado; o `pino` das entradas só nasce depois da configuração válida e o diff não o toca.

**2. `ErroConfiguracao` carrega só nomes: confere.**
- Só `config.ts` o instancia (busca em `server/src`): `validar` (`config.ts:121-122`) passa `nomes` vindos de `issue.path[0]`, isto é, o nome da chave do `process.env`, nunca o valor (o Zod não põe o valor no `path`); `carregarConfigApi` (`config.ts:140`) passa a lista fixa `VARIAVEIS_REMOVIDAS_API`. A `message` do erro continua a mesma de antes e não é impressa pelas entradas.
- O nome da variável na saída não é segredo: são identificadores públicos do contrato de configuração (`.env.example`), e quem roda a entrada já os conhece. Sem caminho de ataque realista: o nome não dá acesso a nada.

**3. `config.ts` não passou a expor valor: confere.** O diff do arquivo é só o `import` e a troca de `Error` por `ErroConfiguracao` com a mesma mensagem (`config.ts:3`, `:122`, `:140`). Nenhum retorno, log nem campo novo.

**4. Código de saída: segue 1.** `process.exitCode = 1` mantido nos três catch; o uso incorreto segue com 2 (linhas de uso intactas). Os testes do diff afirmam o código 1.

**5. Entrada do apontamento: fora, como na exclusão do pedido.** `ref-sync-apontamento` não aparece no diff.

**6. Suposição do pedido (a categoria com o nome da variável não fere "sem causa por desenho"):** confirmada por este parecer. O que a regra protege é valor, URL, senha, host, papel e texto do erro do banco, e nada disso sai. Não há pergunta a levar ao dono.

**7. Testes.** Rodei os testes do arquivo novo, `server/tests/categoria-erro.test.ts`: 6 de 6 passam. Os testes de subprocesso das entradas dependem de `tsx` e a CI do push (run 42367687534) está verde pelo brief; a suíte inteira é do QA (D-5).

## Ferramentas
Nenhuma varredura nova: o diff não toca dependência, workflow, imagem nem segredo, e não há valor sensível no diff (o teste usa marcadores fictícios). Sem lacuna a registrar.

## Achados

## Riscos aceitos
Nenhum.
