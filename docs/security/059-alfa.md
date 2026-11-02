---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: ccf9651c2b26887d004d7078a9041dc82935d127
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Revisão de segurança da trilha B da aba Apontamento: contrato, classificarApontamento e cálculos (pedido 059, E2.18, K-193)

Propósito: segunda renovação por delta do parecer da trilha B, sobre as mudanças do classificador depois do parecer aprovado em 51d9ed4: preparação do dicionário uma vez por chamada, comparação de palavras e termos (A1 do review) e comentário sem palavra (decisão do dono de 2026-11-02). Intervalo revisado: `51d9ed4..ccf9651` (ee1c55a, ee08882, 7add30e, a8871e3, ff47cbd e commits de review). Referências: ADR 0020 revisão 4 (R4-2), plano 059 §3.4 e §3.9 no ramo `docs/059-apontamento-discovery`. Público: node-backend, tech-lead, qa-engineer, Jarvis. O `.env` não foi lido; nenhum nome de pessoa neste documento.

**Veredito: aprovado.** A1 a A6 seguem resolvidos. O delta não reabre regex do dicionário, normalização, truncagem nem teto de rótulo; a comparação nova é equivalente à anterior e o comentário sem palavra passa a receber só `sem-comentario`. Nenhum achado novo.

## Achados
- A1 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:132 · era bloqueante; segue resolvido: sem regex do dicionário, comparação por início de palavra com palavras e termos ordenados (ee1c55a), equivalente à `startsWith` ingênua do oráculo. Nada a fazer. Dono: node-backend.
- A2 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:106 · era bloqueante; segue resolvido: normalização sem controle, direção nem surrogate isolado; palavras por `\p{L}\p{N}`, `- - -` conta 0. Nada a fazer. Dono: node-backend.
- A3 (recomendado) packages/metricas/src/coletor/classificarApontamento.test.ts:491 · era bloqueante; segue resolvido: matriz, corpus de legítimos e orçamento mantidos, oráculo alinhado à decisão do comentário sem palavra. Nada a fazer. Dono: node-backend.
- A4 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:89 · segue resolvido: truncagem em 2000 pontos de código antes de normalizar. Nada a fazer. Dono: node-backend.
- A5 (recomendado) packages/contratos/src/apontamento.ts:392 · segue resolvido: rótulos fixos de pessoa com nomesReais falso, sem eco no erro; o delta não toca o contrato. Nada a fazer. Dono: node-backend.
- A6 (recomendado) packages/contratos/src/apontamento.ts:167 · segue resolvido: teto de 200 nos rótulos, sem mudança no delta. Nada a fazer. Dono: node-backend.

## Detalhe da revalidação (delta 51d9ed4..ccf9651)

### Preparação uma vez por chamada e comparação (ee1c55a)
`termosQueCasam` (`classificarApontamento.ts:133-144`) caminha as palavras únicas e os termos únicos, ambos ordenados por unidade de código (o `.sort()` padrão compara por unidade de código e o conjunto não tem empate), com o ponteiro das palavras só avançando. Correto: para termos crescentes, a primeira palavra maior ou igual ao termo nunca fica antes do ponteiro, e as palavras com o prefixo são contíguas a partir dela; o `break` ao esgotar as palavras só descarta termos maiores que todas. Equivale à `startsWith` ingênua, que segue como oráculo do teste de propriedade. Continua sem regex do dicionário e com custo O(palavras + termos), dentro do teto de 2000 pontos de código e 500 termos. `preparar` (`:149-171`) guarda regras e termos em `WeakMap` por objeto do dicionário: sem retenção de memória e sem dado de pessoa; o dicionário vem de tabela de referência, sem entrada do usuário. A suposição de objeto imutável é o A7 recomendado do tech-lead (correção de resultado, não de segurança).

### Comentário sem palavra (ff47cbd)
`semComentario` passa a ser `palavras.length === 0` depois de truncar e normalizar (`:176-180`); `generico` só vale com `!semComentario` (`:196`); a regra por tipo com condição de sem comentário também vale para pontuação. Entrada hostil (controle, direção, surrogate isolado, só símbolos) cai em vazio sem lançar e sem texto na saída, que segue só com subgrupo, máscara, contagem e versão. Os testes novos (`classificarApontamento.test.ts:246-260`) fixam `- - -`, `...`, `?!`, `*** ###` e emoji, e o oráculo da propriedade foi alinhado. Era o item pendente do parecer anterior: fechado.

### Delta dos cálculos (ee08882, 7add30e, a8871e3)
`doTime` (`comum.ts:25-32`) tira `outra-area` dos blocos por pessoa, por dia e das pessoas ativas. Efeito de segurança positivo: quem não é do time nunca ganha bloco nem linha própria; só entra em distribuição, matriz e totais, sem nome. Nenhuma identidade nova e nada no bundle do web.

## O que segue correto (fora do delta, sem mudança)
- `classificarApontamento` e `palavrasDe` ficam só em `coletor/index.ts`; o índice do pacote e o `exports` não citam `coletor`.
- A função continua pura: sem log, serialização, hash nem `process.env`; a saída é só subgrupo, máscara, contagem e versão.
- Contrato `strict` em todos os níveis; nenhuma identidade nova.

## Notas para as próximas etapas (não devolvem)
- Termo vazio no dicionário casaria qualquer comentário com palavra; a guarda é do `ref:sync` e fica conferida no parecer da coleta (`docs/security/059-beta.md`, E2.26).
- O cache por `WeakMap` supõe dicionário imutável depois de carregado (A7 do review); se o carregamento mutar o objeto, o resultado fica velho. Ajuste do node-backend, sem impacto de segurança.

## Plano em cartões
Nenhum cartão novo desta trilha.

## Riscos aceitos
Nenhum proposto.

## Ferramentas e lacunas
Leitura estática do diff e `forge-check delta --parecer`. Os testes não foram reexecutados nesta renovação (a execução local de `vitest` foi negada pelo classificador do ambiente); vale a execução na CI da branch, relatada verde no registro do pedido. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` seguem fora do PATH desta máquina (lacuna registrada; o delta não muda dependência nem workflow; as varreduras rodam no CI do `devops-engineer`). Nenhum segredo lido ou exibido; nenhum arquivo fora de `docs/security/` tocado.
