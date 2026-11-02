---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: ff47cbd7dfea974248c2b099579e9d479296e736
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: 059-aba-apontamento, trilha B (contrato, classificador e cálculos; E2.45, K-193)

Links: plano de testes `docs/qa/059-plano-testes.md` (ramo `origin/docs/059-apontamento-discovery`, casos da trilha B: PR alfa), review `docs/reviews/059-alfa.md` (aprovado em `ff47cbd`, commit do parecer `ccf9651`), segurança `docs/security/059-alfa.md` (aprovado sobre `ccf9651`, commit `14f9d84`), plano técnico `docs/architecture/features/059-aba-apontamento.md` (§3.4, §3.7, §3.9).

**Parecer: aprovado**, sem bug aberto, sobre o código de `ff47cbd`. Os commits seguintes (`ccf9651` e `14f9d84`) só trazem pareceres de review e de segurança, sem mudar código: a ponta de código é a mesma do review aprovado. Escopo `completo`: contrato zod, `classificarApontamento` e `calcularApontamento` (T2.5), contra a base `origin/develop`. Rota, coleta e tela são de outras branches e não entram aqui.

## Achados
- A1 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:133 · o casamento é por início de palavra: o termo "reuniao" não casa "reunioes" (o plano CT-33 supõe que casa). O dicionário versionado (E2.19) deve trazer radicais ("reuni"); conferir os termos com o dono antes da carga.
- A2 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:34 · o cache por identidade supõe dicionário imutável e os campos de DicionarioApontamento não são readonly. É o A7 do review, ainda aberto; marcar os campos readonly resolve.

## Critério → teste → resultado
Fixtures só sintéticas (pessoas `p1` a `p6`, ids `9000000001`, marcador `PESSOA-FICTICIA-MARCADOR-059`); nenhum teste lê o `.env`, chama o BusinessMap ou grava comentário.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-3 (piso de 20) | CT-05, CT-51: pessoa com 19, 20 e 21 apontamentos num recorte de 100+ linhas; insuficiente só com chaves `status`, `n`, `minimo` | 19, 20, 21; base do piso por pessoa e não do recorte | passou |
| CA-3 (contrato) | CT-06: schema recusa ok com n<20, insuficiente com n>=20, pct em insuficiente, pct negativo | n = 19 e 20 | passou |
| CA-7 (valor atípico) | CT-14: dia com 15:59:59, 16:00:00, 16:00:01 e 115 h; 30 apontamentos de 3 h 50 min no mesmo dia; limite configurável; `anomalos=ocultar`; atípico decidido sobre o dia inteiro mesmo com filtro de tipo | 16 h exatas, +1 s, 115 h; nunca descartado por padrão | passou |
| CA-9 (utilização) | CT-18: chaves de `capacidade.porPessoa` são lista fechada (sem meta, faixa, semáforo, média); utilização passa de 100% | utilização > 100%; 19 apontamentos | passou |
| CA-10 (de-para por id) | CT-20: n/a na biblioteca (a chave chega pronta como `pessoaRef`); fica com a coleta e a rota | n/a | n/a, outra branch |
| CA-11 (achados) | CT-22: achados sem nome nem `pessoaRef`, marcador ausente de toda a saída; todos os códigos gerados; limiar mudando o resultado (20% exato entra, 15% não); 19 apontamentos sem achado de percentual; recorte vazio dá lista vazia | limiar >=, piso, vazio | passou |
| o1 (ordem neutra) | CT-24: nomes reais em ordem alfabética sem acento nem caixa; "Pessoa n" pelo número (`p10` depois de `p2`); nunca por total | empate de grafia, acento | passou |
| o3 (piso por pessoa) | CT-26: coberto com CT-05 | 19 e 20 | passou |
| o2 (sem semáforo) | CT-25 no nível da biblioteca: coberto com CT-18 (a tela é da branch do front) | n/a | passou (lib) |
| C-3 (segundos inteiros) | CT-28: 5000 apontamentos somam exato e inteiro | soma grande | passou |
| CA-4 (filtros) | pessoa inexistente zera sem lançar; listas vazias não filtram; pessoa eliminada (`pessoaRef` nulo) soma no time e sai dos blocos por pessoa | vazio, valor inexistente | passou |
| Outra área (decisões de 2026-11-02) | soma em kpis, distribuição e matriz; fora de capacidade por pessoa, mensal, qualidade por pessoa, mapa diário, dia atípico (três de 6 h no mesmo dia não são atípico) e de pessoas ativas | soma de várias pessoas | passou |
| CA-6/CA-8 de capacidade (M-8) | CT-32: feriado em dia útil sai da capacidade, feriado no sábado não altera; quem só apontou em fim de semana fica fora da capacidade por pessoa; mês corrente corta na última coleta com `parcialAte`; fevereiro bissexto de 2028 (21 dias úteis) | primeiro e último dia, feriado em fim de semana | passou |
| CT-33 (classificador) | início de palavra ("reuniao" casa "reuniaozinha", não casa "areuniao", "xreuniao" nem "re"); prioridade menor vence; empate pelo código do subgrupo; entradas de 10 000 caracteres, 5000 palavras, emoji, `\u0000`, surrogate isolado, U+200B e U+202E; saída em lista fechada; função pura (sem `console`, sem trecho do comentário na saída, dicionário intacto) | vazio, 10 000, controle e direção | passou |
| CT-34 (flags) | genérico com 3 palavras sim e 4 não; vazio, nulo, espaços, `- - -`, `...`, `?!` só com `sem-comentario`, nunca genérico (decisão do dono de 2026-11-02); regra por tipo só sem comentário; `sem-vinculo` só nos dois residuais | 3 e 4 palavras; zero palavras | passou |
| CT-38 (consulta) | janela de 367 dias, `de > ate`, só um limite, data impossível, chave desconhecida, nome no lugar de `pessoaRef`, `p0`, nível de matriz inválido, diário de mais de 62 dias e texto de injeção recusados sem eco do valor | janela 366 e 367 | passou |
| CA-AP-9 / CA-AP-12 (nível da biblioteca) | 115 h marcada e mantida na soma; piso por pessoa em 19 e 20 | 115 h; 19 e 20 | passou |
| CT-29 e CT-69 (fronteiras estáticas) | `lint` do pronto cobre BusinessMap sem import de Acelerato (nenhuma ocorrência em `businessmap/apontamento` nem no classificador); `web/` só importa a biblioteca em `data/mock/**`; `classificarApontamento` fica fora da raiz e do subcaminho `businessmap` | import cruzado | passou |
| CT-30 (rota só repassa) | n/a nesta branch (rota é da branch gama) | n/a | n/a, outra branch |

Os testes do plano ficaram em `packages/metricas/src/qa-059-alfa.test.ts` e `qa-059-diff.test.ts` (43 e 1 casos, todos verdes), rodados na árvore do autor e retirados antes do commit, porque a entrega manda commitar só este parecer. Cópia em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/b137b592-4e44-436e-8a8d-3ffa9e1b0ad4/scratchpad/`. O teste diferencial (2000 casos com semente fixa, termos que são prefixo uns dos outros) prova que o caminhar duplo do `ee1c55a` dá o mesmo subgrupo que o `startsWith` ingênuo.

## Cenários e resultado real
- **Recursos:** `free -m` com 14 615 MB disponíveis e load 5,24 antes da suíte; uma suíte por vez.
- **`pnpm run pronto`** (worktree 052e, ponta `ff47cbd`, rodado com HEAD em `ccf9651`, mesmo código): rc 0. `test:trava` ok, `lint` e `format:check` limpos. Contratos 199 testes; metricas 42 arquivos, 1257 testes, cobertura 100%; mock 258; server 1130 passaram e 170 pulados (os `.pg`, que dependem de banco e não são desta branch); web 1256; tools (homolog 73, pesquisa 33, spec-check 14, docs-contratos 102); `docs:check` ok (851 páginas). Orçamento de 10 000 comentários dentro do teto de 5 s no arquivo `classificarApontamento.test.ts` (85 testes em 2,4 s sem cobertura).
- **E2E e acessibilidade:** n/a, a branch não toca interface; ficam para a branch do front (CT-60 a CT-70).
- **Vermelho antes do verde (E2.41, a regra mais recente).** O Forge não é o repositório deste projeto, então vale a forma da stack: classificador de `a8871e3` posto no lugar do de `ff47cbd`, com os testes de `ff47cbd`:
  `git checkout a8871e3 -- packages/metricas/src/coletor/classificarApontamento.ts` e `vitest run src/coletor/classificarApontamento.test.ts src/qa-059-alfa.test.ts` → rc 1, 5 falhas: "comentário sem nenhuma palavra (só pontuação ou símbolos) recebe só sem-comentario, nunca genérico", "A2: palavras são sequências de letra e dígito", "termo vazio casa só quando há alguma palavra", "termo com metacaractere nunca vira expressão regular" e a sonda do QA (`- - -` veio `generico`, esperado `sem-comentario`). Arquivo restaurado com `git checkout HEAD -- ...`; `git status` limpo. Para o resto da branch a base (`origin/develop`) não tem os módulos, então os testes novos caem por construção.
- **Mutação no código alterado:** Stryker não está instalado no projeto (`docs/engineering/praticas.md` não fixa meta). Rodei 14 mutantes à mão sobre o código do diff, com os testes do autor e as sondas do QA juntos, restaurando o arquivo depois de cada um: piso `>` no lugar de `>=` (`core/estatistica.ts`), atípico `>=` limite, `doTime` sem o filtro de Outra área, genérico `<` 3, vazio por `normalizado === ''`, pessoa sem dia útil entrando na capacidade, `ocultar` ignorado, achado `>` no limiar, `includes` no lugar de `startsWith`, ordem por total, `pessoasAtivas` contando Outra área, mensal com Outra área, atípico calculado depois do filtro, corte da última coleta ignorado. **14 de 14 mortos, 0 sobreviventes.** Os 14 também caem só com as sondas do QA.
- **Revisão sem achado bloqueante:** `outra-area` fora dos blocos por pessoa e dia, `pessoasAtivas` só do time, comentário sem palavra tratado como vazio e orçamento do classificador verde, tudo conferido pelos testes acima.
- **Ordem do dono:** o PR para a `develop` leva a linha `teto: excedido` com o número recontado (3805 linhas no review) e só abre depois do merge da exceção (PR 193), pela decisão do dono sobre a ADR 0020 revisão 4; não é gate do QA.
- Casos fora desta branch (coleta, rota, tela, banco, 421, `no-store`, exportação, acessibilidade) continuam no plano para as branches beta, gama e delta.

## Bugs
Nenhum aberto. Nenhum registro em `docs/qa/bugs/`.
