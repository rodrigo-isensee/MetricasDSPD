---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: 6de38da68ba05d7315f5aa0b8fe6cf1094957fe1
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Revisão de segurança da trilha B da aba Apontamento: contrato, classificarApontamento e cálculos (pedido 059, E2.18, K-193)

Propósito: revisão estática do diff de `origin/feature/059-contrato-biblioteca` contra a `develop` (base b1c2865, ponta 6de38da, cinco commits: 279f9e2, de66d49, de9e320, ed5b8aa, 6de38da) contra a ADR 0020 revisão 4 (ramo `docs/059-apontamento-discovery`), o plano 059 §3.4 e §3.9 e o parecer `docs/security/059-adrs.md`. Público: node-backend (dono do código), tech-lead, qa-engineer, Jarvis. O `.env` não foi lido; nenhum nome de pessoa neste documento.

**Veredito: reprovado.** A identidade de pessoa fica só como `pessoaRef` opaca na biblioteca, o contrato não tem campo de pessoa além do previsto (`pessoaRef`, `rotulo`, `identificada`) e `classificarApontamento` fica fora do bundle do web; esses três pontos estão corretos. O que devolve é o classificador, um controle que analisa texto livre de origem externa: o código não cumpre o critério do cartão B2 que fechou o bloqueante A3 da leitura das ADRs (casamento sem regex do dicionário, normalização com remoção de controle e direção, palavras por letra e dígito, gerador nas dimensões 1 e 2 e teste de orçamento). Pela regra de analisador, os três vão juntos nesta rodada (A1 a A3). Severidade baixa em todos: nenhum leva o comentário para fora da fronteira; o efeito é classificação e flags divergentes do especificado e um controle sem a guarda que o desenho exigiu.

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/classificarApontamento.ts:91 · casamento por `new RegExp` montada do termo do dicionário, contra ADR 0020 R4-2 e plano §3.4; o lookbehind `[a-z0-9]` difere de palavra por letra e dígito: `øteste` casa `teste`. Trocar por palavras e `startsWith`.
- A2 (bloqueante) packages/metricas/src/coletor/classificarApontamento.ts:84 · normalização não remove `\p{Cc}`, `\p{Cf}` nem surrogate isolado e conta palavras por espaço (:102): zero-width, RLO ou NUL no meio de `reuniao` escapam do termo; `- - -` conta 3 palavras; `teste,carga,geral,ok` conta 1.
- A3 (bloqueante) packages/metricas/src/coletor/classificarApontamento.test.ts:278 · gerador só de vocabulário fixo, sem as dimensões 1 (tamanho, 2000 e acima) e 2 (codificação) do plano §3.4, sem o corpus de legítimos completo e sem o teste de orçamento (10 000 comentários em 5 s).
- A4 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:98 · a função não trunca a entrada e depende do coletor (trilha A); truncar em 2000 pontos de código também aqui, como defesa em profundidade; medido: 1 MB sem truncar custa cerca de 143 ms por comentário.
- A5 (recomendado) packages/contratos/src/apontamento.ts:369 · com `nomesReais: false` o contrato aceita qualquer `rotulo` de pessoa (:171); um `superRefine` restrito aos rótulos fixos (Pessoa n, não identificada, Outra área) faz o front recusar nome vazado com o interruptor desligado.
- A6 (recomendado) packages/contratos/src/apontamento.ts:165 · `opcaoSchema.rotulo` e `linhaDistribuicaoSchema.rotulo` (:181) sem teto de tamanho; limitar a 200 como `rotuloRef` e o rótulo de pessoa (título de card raiz vem da origem).

## Detalhe dos achados

### A1 (bloqueante): regex construída a partir do dicionário
Evidência: `casaInicioDePalavra` (`:90-91`) monta `new RegExp('(?<![a-z0-9])' + escapar(termo))` a cada termo e a cada comentário. A ADR 0020 R4-2 (`:125` do ramo do discovery) e o plano §3.4 (`:130`) exigem comparar cada palavra por `startsWith`, sem construir expressão regular do dicionário; esse foi o desenho que fechou o A3 de `docs/security/059-adrs.md`. O escape (`:87`) está correto para regex sem flag (testado em `:199`), então não há injeção nem ReDoS: o defeito é de requisito e de semântica. Caminho: uma palavra começada por letra fora de `[a-z0-9]` depois da normalização (`ø`, `ß`, `ł`, grego, cirílico) não conta como letra para o lookbehind, e o termo casa no meio da palavra (réplica fiel da função: `øteste` casa `teste`), divergindo da regra de início de palavra (C-6). Correção mínima: separar palavras por `\p{L}\p{N}` (ver A2) e casar com `palavra.startsWith(termo)`; remover `escapar` e a regex. Esforço P. Dono: node-backend.

### A2 (bloqueante): normalização e contagem de palavras fora do §3.4
Evidência: `normalizarTexto` (`:83-85`) faz minúsculas, NFD, remove `\p{M}` e colapsa `\s`; não remove `\p{Cc}` e `\p{Cf}` (controle e direção) nem surrogate isolado, como o plano §3.4 (`:129`) exige. `qtdPalavras` (`:102`) é `split(' ')`, não sequências de `\p{L}\p{N}`. Caminho (réplica fiel, entradas sintéticas): `re` + U+200B + `uniao`, `re` + U+202E + `uniao`, `re` + U+00AD + `uniao` e `re` + U+0000 + `uniao` não casam `reuni` (texto colado de outro sistema ou digitado com caractere invisível vira "Execução técnica" com `sem-vinculo`); `- - -` conta 3 palavras e recebe `generico` em vez de ser tratado pela contagem do plano; `teste,carga,geral,ok` conta 1 palavra e recebe `generico` com quatro palavras. Correção mínima: na normalização, remover `\p{Cc}`, `\p{Cf}` e surrogate isolado antes de colapsar; palavras = `match(/[\p{L}\p{N}]+/gu)`; `qtdPalavras` = número delas; `semComentario` = zero palavras ou texto vazio, conforme o node-backend confirmar com o §3.4 e a decisão do dono de 2026-11-02 (item 6); dúvida sobre "só pontuação" contar como sem comentário vai ao dono pelo Jarvis, não por inferência. Esforço P. Dono: node-backend.

### A3 (bloqueante): matriz, corpus e orçamento sem teste
Evidência: o gerador (`:278-286`) sorteia até 8 palavras de 18 fixas; as propriedades (`:288-391`) cobrem caixa, acento, espaço, pureza, lista fechada e não eco, mas não as dimensões 1 e 2 do §3.4 (`:131`) nem o orçamento (`:134`). O que falta, completo, para quem corrige:
- dimensão 1 (tamanho): vazio, só espaços, 1, 3 e 4 palavras, exatamente 2000 e acima de 2000 pontos de código;
- dimensão 2 (codificação): ASCII, acento pré-composto e decomposto, caixa mista, `ß`, `İ`, emoji, surrogate isolado, `\u0000`, controle e direção (U+202E);
- dimensão 3 (posição do termo): início, meio, fim, colado depois de outra palavra (não casa), depois de pontuação, de número e de quebra de linha (casa); hoje coberta em parte (`:189-197`);
- dimensão 5 (dicionário): vazio, um termo, termos que são prefixo um do outro, empate por prioridade; coberta em parte (`:140-171`);
- propriedade que falta no gerador: `qtdPalavras` igual à contagem do texto normalizado e truncado, e nunca lança, sobre o produto das dimensões 1, 2, 3 e 5;
- corpus de legítimos: `Análise do erro`, `reuniao de alinhamento`, `RDM 1234`, `GMUD`, número de chamado, texto com quebra de linha, comentário só com número, Kaizen sem comentário, Incidente sem comentário;
- orçamento: 10 000 comentários de 2000 pontos de código contra 500 termos em menos de 5 s; um comentário no pior caso em menos de 5 ms.
Medida informativa (réplica fiel da função atual, 500 termos sem casamento, comentário de 2000 caracteres, Node desta máquina): 10 000 comentários em 3654 ms e o primeiro em 4,42 ms; cabe, mas sem margem e sem teste que o guarde na CI. Correção mínima: acrescentar os casos e o teste de orçamento acima ao arquivo de teste (com a função já corrigida por A1 e A2). Esforço P. Dono: node-backend; o qa-engineer confere contra o plano de testes.

### A4 (recomendado): truncagem só no chamador
A R4-2 põe a truncagem no coletor, e a trilha A não está nesta branch. Se o coletor esquecer, a função aceita qualquer tamanho; o custo medido é baixo (cerca de 143 ms para 1 MB contra 500 termos), daí recomendação. Correção mínima: truncar em 2000 pontos de código no começo de `classificarApontamento` (por `Array.from` ou laço por ponto de código) e manter a do coletor. Esforço P. Dono: node-backend.

### A5 (recomendado): contrato não amarra rótulo ao interruptor
`pessoaApontamentoSchema.rotulo` aceita qualquer texto até 200 caracteres, com ou sem `nomesReais`. Caminho: um erro na rota que selecione `responsavel_nome` com `APONTAMENTO_NOMES` desligado passa pelo parse do front e mostra nome real (critério de reversão da R4). Correção mínima: `superRefine` em `respostaApontamentoSchema` que, com `nomesReais: false`, aceite em `opcoes.pessoas[].rotulo` só os rótulos fixos que a rota define (Pessoa n, Pessoa não identificada e o de Outra área). Não muda a forma do contrato; a combinação com a E2.21 fica com o node-backend. Esforço P. Dono: node-backend.

### A6 (recomendado): rótulos sem teto
`opcaoSchema.rotulo` (`:165`) e `linhaDistribuicaoSchema.rotulo` (`:181`) são `z.string()` sem `max`; o rótulo de projeto é o título do card raiz, texto livre da origem. Correção mínima: `.max(200)`, como `rotuloRef`. Esforço P. Dono: node-backend.

## O que foi verificado e está correto
- Identidade só em memória e opaca: a biblioteca recebe só `pessoaRef` (`tipos.ts:22`) e os rótulos para a ordem neutra; nada de `user_id`, nome em saída ou comentário; linha com `pessoaRef` nulo (eliminação) fica no agregado do time e fora dos blocos por pessoa (`comum.ts:21-23`).
- Fora do bundle do web: `classificarApontamento` só em `coletor/index.ts`; os índices do pacote, de `businessmap` e de `core` e o `exports` do `package.json` não a expõem (teste em `classificarApontamento.test.ts:394`); o lint bloqueia `@metricas-dspd/metricas` nas features e caminho relativo entre pacotes; `businessmap/apontamento/` não importa `coletor/`.
- Comentário na fronteira: a função é pura, devolve só subgrupo, máscara, contagem e versão; teste de não eco com marcador e de ausência de log, serialização, hash e `process.env` (`:313-338`, `:419-424`).
- Contrato: `strict` em todos os níveis; teste recusa `user_id`, `responsavel_id`, `comentario`, `email` e confere que o JSON Schema não tem identidade, meta, semáforo, média nem ranking; `pessoaRef` só `p<n>` ou `outra-area`; consulta estrita, filtro de pessoa só por chave opaca e mensagem de erro sem eco; domínio fixo `businessmap`.
- Cláusulas o1 a o3 no código: ordem neutra por pessoa (alfabética com nomes, numérica sem, Outra área por último, nunca por total), sem campo de faixa ou média por pessoa, `pctComPiso` com piso de 20 no contrato e no cálculo; achados sem `pessoaRef`.
- Sem segredo, credencial ou nome real nas fixtures (pessoas fictícias).

## Plano em cartões
- A1, A2, A3: node-backend, na mesma volta da branch `feature/059-contrato-biblioteca`; revalidação por delta deste parecer depois.
- A4, A5, A6: node-backend, quando couber; não devolvem.

## Riscos aceitos
Nenhum proposto.

## Ferramentas e lacunas
Leitura estática, `git grep` e duas réplicas fiéis da função em Node, com entradas sintéticas, no scratchpad da sessão (fora do repositório). `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; a branch não muda dependência nem workflow; as varreduras rodam no CI do `devops-engineer`). Nenhum segredo lido ou exibido; nenhum arquivo fora de `docs/security/` tocado.
