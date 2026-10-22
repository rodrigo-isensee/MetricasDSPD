---
tipo: review
contrato: 1
pedido: 025-front-do-011-lote2
branch: feature/025-front-taticas
commit: 7807199
parecer: aprovado
revisor: tech-lead
data: 2026-10-21
---

# Code review: front das táticas T10 a T14 no /tatico (pedido 025, K-110)

**Veredito: aprovado.** Não há achado bloqueante. Ficam sete recomendados (A1 a A7), sendo dois deles cartões para o quadro (A1 e A2).

Escopo lido: `568ea48...32a509f` (07969c8 e 32a509f), 20 arquivos, 1.490 linhas a mais e 46 a menos. Os commits 6c37789 e 35686fd, posteriores, trazem só o parecer de segurança e não foram revisados aqui. Fontes da leitura: a especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3 e §5, fichas T10 a T14), o pedido 025 (Escopo, Decisões e Andamento de 2026-10-21) e a seção 8 de `docs/engineering/praticas.md`.

**Ferramentas (citadas, sem refazer):** o `pnpm run pronto` deu rc=0 na raiz da worktree. A prova é a PQ-3 do brief `025-front-do-011-lote2-react-frontend-3`, conferida como "cumpriu" em 2026-10-21 14:04 (`docs/kanban/conferencias.md`, linha 80). Com isso estão cobertos lint, typecheck, testes com cobertura de 100%, `docs:check` e o bundle. Não rodei a suíte de novo, por dois motivos: R-TETO, porque a estação estava ocupada com o E2E de perf do 037, e a regra 5 da economia de tokens. Os E2E e a medição de CLS e C6 ficam com o QA (E1.5).

**Integração:** a `develop` andou até 794b982, mas só mudou `.forge/versao`, sem nenhum arquivo em comum com esta branch. Por isso não fiz o merge agora, porque ele correria junto com o push do security-engineer. A integração fica para o E1.7, e não muda o patch revisado.

## Aderência às fichas (E1)

| Cartão | Situação |
|---|---|
| T10 | **Conforme.** Uma linha por fornecedor na ordem da API (alfabética), com bloqueios, dias úteis somados e P50/P85 em barra com marca. Abaixo de 20 bloqueios a linha mostra "— amostra insuficiente". Não há prazo contratado nem status, e a frase "Prazo contratado não informado" é fixa. Sem fornecedor no período, aparece "Nenhum bloqueio por fornecedor no período." (§6). A leitura segue a ficha e a escala da barra é só de desenho. |
| T11 | **Conforme, com uma lacuna de contrato (A2).** O mapa mês × ano traz o número escrito em cada célula, com a rampa `--rampa-n`/`--rampa-n-fg` nos dois temas, o mês corrente listrado com "em andamento", o seletor de tipo, Período fora de `aplicaveis` e a nota de histórico curto. A leitura não traz a frase de picos da ficha: ela exigiria cálculo no front, e o autor fez certo em não calcular. |
| T12 | **Conforme.** As áreas vêm na ordem de volume dada pela API, com barra sólido × hachura cruzada, "k de n" e o percentual só a partir de 20. A nota "Não é nota da área." está lá e não há ordenação por pior desempenho. |
| T13 | **Conforme.** Uma granularidade por vez (Demandas/Frentes), destaque "k de n entregas (p%)" e par com × sem só dentro do mesmo tipo, com os dois grupos publicados. Quando falta um grupo, o aviso diz qual (CA-6). As entregas com quadro desconhecido ficam à parte e o outro quadro nunca é identificado. |
| T14 | **Conforme.** A equipe é obrigatória (CA-28, `semEquipe`) e aparece o selo "Só mostra meu time e os outros somados. Não compara times." Os projetos vêm na ordem da API, e "Outros times (somados)" é a única coluna sobre outros times, sem nome nem ranking. As diferenças de forma em relação à ficha (sem barra na linha oculta e destaque só na leitura) ficam em A4 e A5, para a UX no E1.6. |

**Leia junto (catálogo e links):** os pares estão ligados nos dois sentidos em `packages/contratos/src/cartoes.ts`: BLOQUEADOS↔T10, O12 a partir do T10, T4↔T11, T6 a partir do T11, O14↔T12, O11 a partir do T12, T1↔T13 e T9↔T14, com T13 a partir do T14. O O19, que as fichas do T10 e do T13 pedem, ainda não existe: é do lote 3 (pedido 026, K-111) e o par entra junto com ele. O link em `CartaoBloqueados.tsx` segue o precedente do lote 1 (CartaoE2) e a decisão técnica de 2026-10-21. O teste `leiajunto.test.tsx` percorre a cadeia e cobra que as 26 complementares sejam alcançadas.

**`COM_TAMBEM` no mock (pergunta do E1):** isso é limite do mock, não fere a ficha. Vira cartão (A1), sem bloqueio. Antes, uma correção de leitura: o `COM_TAMBEM` não tem nada a ver com os links "Leia junto", que vêm do catálogo e funcionam em qualquer fonte. Ele decide quais métricas recebem `ctx.tambem` (vínculos, time responsável e histórico sazonal) na `MockFonteMetricas`, a fonte só do navegador (`VITE_FONTE=mock`, padrão do desenvolvimento local). O caminho que a ficha governa é o da API. Lá, `server/src/modulos/metricas/servico.ts:57` já inclui T11, T13 e T14, e é nesse caminho que o E2E roda (`e2e/playwright.config.ts:30`, `VITE_FONTE=api`). A tela cumpre a ficha com os dados que recebe, e os testes provam isso com DTOs fixos. O que quebra é a coerência interna do mock: `web/src/data/mock/MockFonteMetricas.ts:51-55` manda atualizar `COM_TAMBEM` junto com `COM_EXTENSAO_MOCK`, e esta entrega atualizou só o segundo (T13 e T14 viraram `mock`). No modo mock, portanto, T13 e T14 aparecem sem vínculo e sem time. O adiamento tem motivo: o arquivo vai para `nucleoMock.ts` no pedido 037, e mexer nele agora daria conflito. Está registrado em `docs/tecnica/arquitetura-front.md:297`.

## Decisões do dono (E2, E3, E4)

- **E2, R-1 = B:** `outrosOculto` (`taticas.tsx:529`) usa `outrosTimes === null`, o sinal que o back manda quando os outros times somam menos de 2 pessoas (`packages/contratos/src/tambem.ts:383`). O front não recalcula pessoas. **Conforme.**
- **E3, T14-M1 = B:** a linha oculta mostra só "Meu time: k demandas", sem barra, `n`, total, percentual nem "sem time". Na tabela aparece "não exibido" (`taticas.tsx:610-613` e `655-662`). A base do cartão sai quando há um oculto em qualquer granularidade (`semBase`, `taticas.tsx:566`). A leitura com o total do recorte sai quando há um oculto na granularidade exibida (`taticas.tsx:533`). Assim não dá para obter n − k pela soma do recorte menos os projetos visíveis. Os testes (`taticas.test.tsx:474` e `500`) afirmam que nenhum dos números ocultos aparece em lugar nenhum do cartão. **Conforme.** O security-engineer aprovou a tela (`docs/security/025-t14-reidentificacao.md`, achados A1 e A2 recomendados) e registrou que a API ainda manda os campos: isso é pré-condição da fase 3, fora deste lote.
- **E4, B11-001:** o front mostra o nome como a API devolve e não normaliza (`taticas.tsx:97`). O teste `taticas.test.tsx:134` passa pelo `MockFonteMetricas` real, com "TOTVS", "Totvs" e " totvs ", e afirma que sai uma linha só, sem espaço nas pontas. **Conforme.**

## Regras invioláveis e checklist (leitura)

- **Sem cálculo no front:** percentis, taxas e totais vêm todos do DTO. No front há só escala de barra, faixa de cor da rampa (`taticas.tsx:177`) e a escolha do projeto de menor participação para o exemplo em texto (`taticas.tsx:539-541`, que a ficha pede "só em texto, nunca em ordenação"). Nada disso é estatística. **Ok.**
- **Avaliação individual e comparação entre times:** nenhum campo por pessoa, e nenhum time nomeado, listado ou ordenado. Nas listas do T10 e do T12 a ordem é a da API, alfabética ou por volume. **Ok.**
- **Mínimo de 20:** em todos os cartões, abaixo de 20 aparece "k de n" ou "— amostra insuficiente", nunca um percentil ou percentual. **Ok.**
- **BusinessMap × Acelerato:** os cinco cartões são só BusinessMap. **Ok.**
- **Fronteiras:** o painel não importa `metricas` nem `mock`. O teste importa `MockFonteMetricas` por `@/data`, o que é permitido. **Ok.**
- **Testes:** são 31 casos em `taticas.test.tsx`, cobrindo vazio, erro, abaixo e acima de 20, granularidade única, ausência de bloco e os casos do E2 ao E4. Os testes de ausência procuram números escolhidos para não colidir (47, 41, 213, 83, 79). **Ok.**
- **Acessibilidade:** tabela alternativa em todos os cartões, `scope` nas células de cabeçalho do mapa T11, `aria-label` nas células sem dado, barras com `aria-hidden` acompanhadas de texto, região rolável com foco. Os cinco ficam na seção recolhida "Mais métricas", então não entram no CLS inicial do /tatico. A medição F2/C6 é do QA. **Ok.**
- **Documentação:** `docs/tecnica/arquitetura-front.md` §12 e `docs/contratos/metricas/` foram atualizados no mesmo intervalo. **Ok**, salvo a frase de A6.
- **Commits:** Conventional Commits em português, com `Cartão: K-110` e as linhas de atribuição. **Ok.**

## Revisão incremental `b6c7673..5108fcd` (f06a6fb, 9e11071, 5108fcd)

**Veredito: aprovado, sem bloqueante.** Delta lido: 15 arquivos, 735 linhas a mais e 21 a menos. O que já estava lido (o front do primeiro review) não foi relido. O `pnpm run pronto` do 5108fcd é prova do autor e do QA, não refeito aqui (regra 5 da economia de tokens).

- **E2E novos (`tatico-011-lote2.spec.ts`, `t10-grafias.spec.ts`):** determinísticos. O dado vem do mock semeado, que é fixo, e o cabeçalho do arquivo declara o caso conhecido (P-0039 oculto em demandas com equipe=erp-protheus). Não há `waitForTimeout`, `.skip`, `fixme` nem `.only` (grep no arquivo novo). As esperas são por estado (`esperarCartoesProntos`, `toBeVisible`). A ordem alfabética do T10 é comparada com `localeCompare('pt-BR')`, sem número solto. O TT-04 simula a lista vazia por `page.route` sobre a resposta real, sem mexer no mock.
- **Ajustes em `complementares.spec.ts`, `intensivo-sistemico.spec.ts`, `lacuna-de-valor.spec.ts`:** só contagens (53 para 58; Complementar 21 para 26; `/tatico` de 2 para 7 cartões; T13 e T14 no conjunto `MOCK`; "Leia junto" de T1, T4, T9 e Bloqueados). Nenhuma asserção foi retirada nem afrouxada: cada uma foi trocada pela equivalente com o número novo, e os números batem com o catálogo do primeiro review (5 novas, 26 complementares, 7 do tático).
- **`E2E_PORTA` e `E2E_PORTA_ALT`:** padrão 4173 e 4174, igual ao que era; só evita servir o build de outra worktree. Sem efeito na CI.
- **Servidor de teste das grafias:** `MOCK_FORNECEDOR_GRAFIAS` só age em `server/tests/pg/servidor-api-mock.ts` (arquivo de teste), reescreve o fornecedor da base semeada em "TOTVS", "Totvs" e " totvs ", e nenhum arquivo de produção é tocado. O projeto `chromium-api-grafias` fica fora do `chromium-api` por `testIgnore`, então a suíte comum não depende da variável. O teste diz no cabeçalho que falha de propósito sem ela.
- **L2T-001 (T13 em Frentes):** `baseDoCartao` (nova prop opcional do `CartaoComplementar`) troca só o `n` e a unidade do selo quando o grupo exibido é insuficiente e a granularidade não é demandas. Nos demais casos devolve `x.base`, então o comportamento anterior fica. O `complemento` é descartado, como deve, porque o texto era das demandas. O `n` vem do DTO (`bg.entregas.n`), sem cálculo no front. O teste novo afirma "11 de 20 itens mínimos" e que "88" não aparece. Conforme.
- **L2T-002 (plural na T14, E3):** a linha oculta agora diz "Meu time: 1 demanda", "2 demandas", "1 frente" pelo `plural` já usado no arquivo. O texto continua sem `n`, total, percentual nem "sem time": o teste afirma `textContent` exato e que 53, 47, 59 e 43 não aparecem no cartão. T14-M1 = B preservado. Conforme.
- **E2 e E4:** `outrosOculto` e a normalização do fornecedor não estão no delta (nenhum hunk em `taticas.tsx` fora de T13 e do texto da linha oculta). R-1 = B e B11-001 não mudaram, e o teste de B11-001 segue no `taticas.test.tsx`; o E2E de grafias o confirma contra o back.
- **Perf (`perf-tatico-lote2`):** o caso mede o CLS que a seção soma depois de aberta e o C6 em mediana, e registra o CLS total da página. Ele não cobre o CLS de 0,073 a 0,100 que `/tatico?equipe=` já tinha antes de abrir (L2T-003, herdado, cartão próprio, pendência do PR). Isso fica claro no comentário e é limite do caso, não defeito. Ver A8.
- **Commits:** Conventional Commits em português. O 9e11071 só corrige o parecer do QA para apontar ao head testado.

## Revisão incremental `5108fcd..af1fa41` (reteste do QA)

**Veredito: aprovado, sem bloqueante.** Delta lido com `git diff 222a0a8..af1fa41`: 4 arquivos, sendo o parecer do QA, dois registros de bug (L2T-001 e L2T-002) e `e2e/tests-api/tatico-011-lote2.spec.ts` (12 linhas). Nenhum arquivo de `web/`, `server/` ou `packages/` mudou, então o código de produção revisado em 5108fcd é o mesmo. O que já estava lido não foi relido; o `pnpm run pronto` não foi refeito (regra 5 da economia de tokens).

- **TT-07 (L2T-001):** o caso lê o texto do T13 em Frentes até "Filtros aplicados:" e, se aparecer "Amostra insuficiente: N de 20 itens mínimos", exige N < 20. Determinístico: dado do mock semeado, sem espera por tempo. Limite: a guarda é condicional, então se o texto não aparecer o caso passa sem provar nada. Isso é aceitável aqui, porque o teste unitário do front já afirma "11 de 20 itens mínimos" e a ausência de "88"; ver A9.
- **TT-11 e TT-12 (L2T-002):** a expectativa passou a usar "demanda"/"frente" quando k = 1 e o plural nos demais casos, na linha e no `t14-fatia-<código>`. A decisão vem do `k` lido da própria API, sem número fixo. Continua exato (`toBe` e regex ancorada em `$`), então não afrouxou. Não há `waitForTimeout`, `.skip`, `.only` nem `fixme` no arquivo (grep). Nenhuma asserção foi retirada: as quatro mudanças trocam o texto esperado e a TT-07 só acrescenta.
- **E3, T14-M1 = B:** TT-11 e TT-12 ainda provam a T14 sem `n` nem total: a fatia não casa `/ de |%|sem time|outros/i`, o resto da linha não casa `%|sem time informado|outros times|\d+ de \d+`, e a linha oculta não tem marca gráfica (`span[aria-hidden]` = 0). As asserções do total e do `n` fora do trecho alterado seguem intactas.
- **E2 e E4:** R-1 = B (`outrosOculto`) e B11-001 (nome do fornecedor sem diferença de caixa e espaços) não estão no delta e não mudaram.
- **Commits:** o af1fa41 é do QA, em Conventional Commits em português.

## Revisão incremental `af1fa41..7807199` (correção do TS18048 no E2E)

**Veredito: aprovado, sem bloqueante.** Delta lido com `git show 7807199`: uma linha em `e2e/tests-api/tatico-011-lote2.spec.ts` (TT-07), que acrescenta `?? ''` ao `split('Filtros aplicados:')[0]` para o índice não ser `undefined` sob `noUncheckedIndexedAccess`. O `split` sempre devolve ao menos um elemento, então o valor em execução é o mesmo e a asserção não mudou. Nenhum arquivo de `web/`, `server/` ou `packages/` mudou, nem a T14 nem a T10: R-1 = B, T14-M1 = B e B11-001 seguem como em af1fa41. Commit do QA/autor em Conventional Commits em português, com `Cartão: K-110`. O `pnpm run pronto` não foi refeito (regra 5 da economia de tokens); o typecheck do E2E é o que o commit corrige. O A9 continua valendo.

**Integração e UX:** a `develop` foi trazida por merge (4fe19af) e só mudou `.forge/versao` (versão 0.27.0), sem arquivo em comum: nada a reler. A revisão de UX (`docs/ux/revisao-025-front-taticas.md`, aprovada com ressalvas, sem bloqueante) já está na branch; seus recomendados T14-1 e T14-2 seguem como pendência do PR.

## Achados
- A1 (recomendado) web/src/data/mock/MockFonteMetricas.ts:55 · COM_TAMBEM sem T11, T13 e T14, contra o comentário das linhas 51-54; no mock só do navegador o T13 e o T14 saem sem vínculo e sem time. Cartão no quadro, depois do 037 (nucleoMock.ts); não fere a ficha
- A2 (recomendado) web/src/features/complementares/taticas.tsx:168 · a leitura do T11 não traz a frase de picos da ficha, porque o contrato não a fornece e o front não deve calcular. Cartão para o back pôr os meses de pico no DTO, ou a UX ajusta a ficha no E1.6
- A3 (recomendado) web/src/features/complementares/taticas.tsx:424 · `tipo as never` é um escape de tipo sem comentário (praticas §2). Tipar o estado com o tipo de `comparacoes[].tipo` ou comentar o motivo
- A4 (recomendado) web/src/features/complementares/taticas.tsx:610 · a linha oculta não tem a barra só com a fatia nem "Sem time informado", que a ficha T14 prevê. É mais seguro (A2 da segurança), mas a UX decide no E1.6 e alinha o CA-45
- A5 (recomendado) web/src/features/complementares/taticas.tsx:533 · o destaque "k de n com time informado (p%)" da ficha T14 existe só como leitura, sem o bloco acima da lista que o T13 tem, e sem "as outras N estão em outros times". A UX confere no E1.6
- A6 (recomendado) docs/tecnica/arquitetura-front.md:302 · a doc diz que a leitura sai com projeto oculto "em qualquer granularidade", mas o código (taticas.tsx:533) olha só a granularidade exibida. Sem vazamento, porque a outra granularidade mostra todos os n; alinhar o texto
- A7 (recomendado) web/src/features/complementares/taticas.tsx:625 · `Number(p.outrosTimes)` depende do comentário para garantir o não nulo. Trocar `outrosOculto` por um type guard deixa o compilador provar o caso
- A8 (recomendado) e2e/perf/perf.spec.ts:203 · o caso de perf subtrai o CLS anterior à abertura, então não prova sozinho F2 < 0,1 em /tatico com equipe (ADR 0003); a pendência é L2T-003, cartão K-133, e deve estar no PR. Não bloqueia esta entrega
- A9 (recomendado) e2e/tests-api/tatico-011-lote2.spec.ts:170 · a guarda da L2T-001 é um `if` e passa sem asserir quando a frase não aparece; o unitário cobre o caso, então não bloqueia. Tornar a asserção incondicional se o texto ficar fixo
