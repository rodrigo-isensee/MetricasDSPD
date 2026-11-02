---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: 51d9ed4fd9ff124a56ae167939cdc649ff8eab9d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Revisão de segurança da trilha B da aba Apontamento: contrato, classificarApontamento e cálculos (pedido 059, E2.18, K-193)

Propósito: renovação por delta do parecer da trilha B sobre a correção dos achados A1 a A6 (E2.25). Intervalo revisado: `6de38da..51d9ed4` (o `commit:` do parecer anterior até a ponta; o commit do parecer anterior, 7254244, só tocou este arquivo), seis commits: 7662098, 63a5262, 90116a2, cb2b3e4, fed52e2, 51d9ed4. Referências: ADR 0020 revisão 4 (R4-2), plano 059 §3.4 e §3.9 no ramo `docs/059-apontamento-discovery`. Público: node-backend, tech-lead, qa-engineer, Jarvis. O `.env` não foi lido; nenhum nome de pessoa neste documento.

**Veredito: aprovado.** Os três bloqueantes (A1 a A3) e os três recomendados (A4 a A6) foram resolvidos como o parecer anterior pedia. O delta só toca o classificador, os seus testes, o contrato e os seus testes; nada muda na fronteira de identidade nem no bundle do web. O comentário só com pontuação (zero palavras) segue com as marcas de antes até a decisão do dono (pergunta de 06:30); o teste fixa esse comportamento (`classificarApontamento.test.ts:240`) e não é achado desta renovação.

## Achados
- A1 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:132 · era bloqueante; resolvido em 7662098: sem regex do dicionário, palavras ordenadas e `startsWith` por busca binária (51d9ed4); teste de fonte sem `new RegExp` e `øteste` não casa. Nada a fazer. Dono: node-backend.
- A2 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:106 · era bloqueante; resolvido em 7662098: remove surrogate isolado, `\p{Cf}` e `\p{Cc}`; palavras por `\p{L}\p{N}`; `- - -` conta 0 e `teste,carga,geral,ok` conta 4. Nada a fazer. Dono: node-backend.
- A3 (recomendado) packages/metricas/src/coletor/classificarApontamento.test.ts:491 · era bloqueante; resolvido em 63a5262 e 51d9ed4: gerador das dimensões 1, 2, 3 e 5 com oráculo à parte, corpus de legítimos completo e orçamento (10 000 em 5 s, 5 ms, 1 MB). Nada a fazer. Dono: node-backend.
- A4 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:89 · resolvido em 7662098: truncagem em 2000 pontos de código antes de normalizar, por laço sem copiar o texto inteiro; teste de 1 MB abaixo de 50 ms. Nada a fazer. Dono: node-backend.
- A5 (recomendado) packages/contratos/src/apontamento.ts:392 · resolvido em cb2b3e4: com `nomesReais` falso, `superRefine` só aceita Pessoa n, Pessoa não identificada e Outra área em `opcoes.pessoas`, sem eco do rótulo no erro. Nada a fazer. Dono: node-backend.
- A6 (recomendado) packages/contratos/src/apontamento.ts:167 · resolvido em 90116a2: `MAX_ROTULO` 200 em `opcaoSchema`, `linhaDistribuicaoSchema`, `rotuloRef` e rótulo de pessoa, com teste por campo. Nada a fazer. Dono: node-backend.

## Detalhe da revalidação

### A1: casamento sem regex do dicionário
`casaInicioDePalavra` (`:132-143`) recebe as palavras únicas ordenadas por unidade de código e verifica só a primeira palavra maior ou igual ao termo. Correto: na ordem lexicográfica por unidade de código, as palavras que começam com um prefixo formam um bloco contíguo que começa na primeira maior ou igual a ele, então a busca binária equivale a comparar `startsWith` com todas. O oráculo do teste (`:562`) usa a comparação ingênua `palavras.some(p => p.startsWith(t))` e a propriedade compara os dois sobre o produto gerado. `escapar` e a regex saíram; o teste em `:482-487` barra `new RegExp` e `RegExp(` no código sem comentário. Letra fora de `[a-z0-9]` antes do termo agora é parte da palavra (`:212-217`).

### A2: normalização e contagem
`normalizarTexto` (`:106-115`): surrogate isolado sai primeiro (regex sem a flag `u`, de propósito, para enxergar as metades), depois minúsculas sem localidade, NFD, remoção de `\p{M}` e `\p{Cf}`, colapso de `\s` e só então remoção de `\p{Cc}`. A ordem preserva tabulação e quebra de linha como separador e faz controle e direção sumirem sem deixar espaço; U+FEFF (que é `\s` no JavaScript) sai antes como `\p{Cf}`, e U+0085 sai como `\p{Cc}`. `palavrasDe` (`:118-120`) usa `[\p{L}\p{N}]+` com a flag `u`. Casos da réplica do parecer anterior (U+200B, U+202E, U+00AD, U+0000 no meio de `reuniao`) cobertos em `:219-223`, com U+200D, U+FEFF e U+0085 a mais.

### A3: matriz, corpus e orçamento
Conferido contra a lista completa do parecer anterior:
- dimensão 1: vazio, só espaços, 1, 3 e 4 palavras, exatamente 2000 e 2001 pontos de código (`:623-638`), e tamanhos 0 a 5000 no gerador (`:527`);
- dimensão 2: pré-composto e decomposto, caixa mista, `ß`, `İ`, emoji, surrogate isolado, `\u0000`, U+202E (`:640-649` e pedaços do gerador em `:511-525`);
- dimensão 3: início, meio, fim, colado, depois de pontuação, de número e de quebra de linha (`:651-661`);
- dimensão 5: vazio, um termo, prefixo um do outro, empate por prioridade resolvido pelo código do subgrupo (`:663-694`) e prefixos no gerador (`:534-560`);
- propriedades sobre o produto 1, 2, 3 e 5 com semente fixa: nunca lança, lista fechada, `qtdPalavras` igual à do oráculo por máquina de estados escrita à parte, determinismo e dicionário inalterado (`:579-621`);
- corpus de legítimos: os nove casos pedidos e mais dois (Kaizen com comentário nulo e um texto longo) (`:696-739`);
- orçamento: 10 000 comentários de 2000 pontos contra 500 termos abaixo de 5 s, um comentário no pior caso abaixo de 5 ms (melhor de 7, aquecido) e 1 MB abaixo de 50 ms (`:741-796`).
Execução local nesta revisão: `classificarApontamento.test.ts` 84 testes verdes em 3,32 s; `apontamento.test.ts` do contrato 28 verdes.

### A4, A5, A6
A4: `truncar` (`:89-98`) para no ponto 2000 e fatia por unidades de código acumuladas; o par de surrogate conta como um ponto (teste com emoji em `:321-328`). A5: a expressão `^Pessoa [1-9]\d{0,8}$` está ancorada e sem repetição aninhada; os casos de recusa incluem minúscula, zero, espaço final, `Outra area` sem acento e número de 10 dígitos, e o teste confere que o erro não repete o rótulo. O único lugar da resposta com rótulo de pessoa é `opcoes.pessoas` (os blocos por pessoa só levam `pessoaRef`), então o `superRefine` cobre a superfície inteira. A6: teto aplicado aos quatro tipos de opção e às três distribuições.

## O que segue correto (fora do delta, sem mudança)
- `classificarApontamento` e o novo `palavrasDe` ficam só em `coletor/index.ts`; o índice do pacote e o `exports` não citam `coletor` (teste de bundle intacto).
- A função continua pura: sem log, serialização, hash nem `process.env` (teste de fonte intacto); a saída é só subgrupo, máscara, contagem e versão.
- Contrato `strict` em todos os níveis; nenhuma identidade nova.

## Notas para as próximas etapas (não devolvem)
- Termo vazio no dicionário casaria qualquer comentário com palavra (`:245-256` documenta). A guarda é do `ref:sync` (plano §3.4: recusa termo vazio, de 1 caractere, com espaço, maiúscula, acento, metacaractere ou repetido); a conferência fica no parecer da coleta (`docs/security/059-beta.md`, E2.26).
- Os testes de orçamento medem tempo de relógio; se oscilarem na CI, o ajuste é do tech-lead e do qa-engineer, sem afrouxar o limite do plano.

## Plano em cartões
Nenhum cartão novo desta trilha.

## Riscos aceitos
Nenhum proposto.

## Ferramentas e lacunas
Leitura estática do diff, `forge-check delta --parecer`, e execução local de `vitest` nos dois arquivos de teste. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` seguem fora do PATH desta máquina (lacuna registrada; o delta não muda dependência nem workflow; as varreduras rodam no CI do `devops-engineer`). Nenhum segredo lido ou exibido; nenhum arquivo fora de `docs/security/` tocado.
