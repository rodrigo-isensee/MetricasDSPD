---
tipo: review
contrato: 1
pedido: 025-front-do-011-lote2
branch: feature/025-front-taticas
commit: 35686fdc2b7058d77836dfc71a0c9e19e461c80d
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

## Achados
- A1 (recomendado) web/src/data/mock/MockFonteMetricas.ts:55 · COM_TAMBEM sem T11, T13 e T14, contra o comentário das linhas 51-54; no mock só do navegador o T13 e o T14 saem sem vínculo e sem time. Cartão no quadro, depois do 037 (nucleoMock.ts); não fere a ficha
- A2 (recomendado) web/src/features/complementares/taticas.tsx:168 · a leitura do T11 não traz a frase de picos da ficha, porque o contrato não a fornece e o front não deve calcular. Cartão para o back pôr os meses de pico no DTO, ou a UX ajusta a ficha no E1.6
- A3 (recomendado) web/src/features/complementares/taticas.tsx:424 · `tipo as never` é um escape de tipo sem comentário (praticas §2). Tipar o estado com o tipo de `comparacoes[].tipo` ou comentar o motivo
- A4 (recomendado) web/src/features/complementares/taticas.tsx:610 · a linha oculta não tem a barra só com a fatia nem "Sem time informado", que a ficha T14 prevê. É mais seguro (A2 da segurança), mas a UX decide no E1.6 e alinha o CA-45
- A5 (recomendado) web/src/features/complementares/taticas.tsx:533 · o destaque "k de n com time informado (p%)" da ficha T14 existe só como leitura, sem o bloco acima da lista que o T13 tem, e sem "as outras N estão em outros times". A UX confere no E1.6
- A6 (recomendado) docs/tecnica/arquitetura-front.md:302 · a doc diz que a leitura sai com projeto oculto "em qualquer granularidade", mas o código (taticas.tsx:533) olha só a granularidade exibida. Sem vazamento, porque a outra granularidade mostra todos os n; alinhar o texto
- A7 (recomendado) web/src/features/complementares/taticas.tsx:625 · `Number(p.outrosTimes)` depende do comentário para garantir o não nulo. Trocar `outrosOculto` por um type guard deixa o compilador provar o caso
