---
tipo: review
contrato: 1
pedido: 026-front-do-011-lote3
branch: feature/026-lote3-operacionais
commit: b1438586dbac82751d6def23673b870feae88ad9
parecer: reprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review: front do lote 3 (O19 a O26) no /operacional (pedido 026, K-111)

**Veredito: reprovado.** Há quatro achados bloqueantes. A1 a A3 voltam ao `react-frontend`. A4 é das E2E, que pertencem ao `qa-engineer` (§9 do `praticas.md`), e entra no E1.3. Ficam ainda seis recomendados (A5 a A10).

Escopo lido: `e342a2c...b143858`, um commit do autor com 28 arquivos, 1.988 linhas a mais e 79 a menos. Fontes da leitura: o pedido 026 (Escopo e as linhas do Histórico de 2026-10-27 14:25 e 15:33), a especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (fichas O19 a O26 e os CA-1, CA-6 e CA-15), os schemas de `packages/contratos/src/tambem.ts` e as seções 1, 3, 4, 7, 8 e 9 de `docs/engineering/praticas.md`.

**Ferramentas (citadas, sem refazer):** o `praticas.md` não marca nenhuma regra como "decidida por: `<comando>`". As regras **[lint]** e **[CI]** ficam com a máquina. O autor relata `pnpm run pronto` verde na 2ª rodada, com 1.207 testes no web e 100% de cobertura (pedido 026, linha de 15:33). A CI do push de `b143858` (run 40563335529) deu sucesso em filtro, rápida, build, segurança, OpenAPI, imagem e banco. O job `testes` ainda rodava quando o parecer foi escrito. E2E e perf foram pulados no push da feature, como a CI faz. Não rodei nada local: o brief dispensa, e o dono pediu uma suíte por vez.

**Back em mock (E2):** o E2.1 não deixou commit. O node-backend confirmou que nada faltava em contratos, `packages/metricas` e rotas (PQ-3 = e342a2c). O diff confirma isso: nenhum arquivo em `server/` nem em `packages/metricas`. O único arquivo de `packages/` alterado é `contratos/src/cartoes.ts`, que é catálogo de cartão e não cálculo. A worktree sem uso `MetricasDSPD-026b` (`feature/026-lote3-back`, igual a e342a2c e contida na `origin/develop`) foi removida, junto com a branch local.

**Integração:** a `develop` andou até 16e2617 só com documentos do 042 (devops, fluxo de homologação, pareceres), sem nenhum arquivo em comum com esta branch. Por isso o merge fica para antes do PR e não muda o patch revisado.

## Pontos conferidos

| Ponto | Situação |
|---|---|
| Cálculo só pela biblioteca | **Conforme, com uma ressalva (A5).** Percentil, percentual, taxa, destaque e o limite de 20 vêm prontos do contrato (`status` de `taxaSchema` e `duracao`). A tela só ordena para exibir (O19 por dias, O21 e O26 na leitura), escolhe o tipo e calcula a escala de cor da matriz. A ressalva é a soma das células da matriz do O21. |
| Não publicar abaixo de 20 | **Conforme.** Os ramos `status !== 'ok'` mostram "k de n", "— amostra insuficiente" ou `AmostraInsuficiente`, nunca um número. Isso vale para O19 (percentual e P50/P85), O21, O22, O24, O25, O26 e o O23 no O2. A fronteira 19/20 é do contrato e da `core`, e os testes da tela cobrem os dois ramos de cada cartão. |
| Nenhuma visão por pessoa | **Conforme.** Não há campo, filtro, ordenação nem abertura por pessoa. O O26 tem o selo "Conta trocas, nunca quem." e um teste de ausência (`operacionais.test.tsx:520`): ele procura textos que existem nas outras telas e afirma que não há combobox. As notas dizem "não quem" em O19, O21, O22, O24 e O26. |
| BusinessMap × Acelerato | **Conforme.** As 8 métricas são só BusinessMap (catálogo e `fonteDaMetrica`). |
| Story/frente/projeto e classe | **Conforme.** As distribuições de tempo são por tipo, um tipo por vez (`PorTipo` sobre `SeletorLocal`). |
| Critério (T2.6) | **Conforme.** O O20, o O24 e o O25 listam as marcações em texto (`Marcacoes`). |
| `CATALOGO_CARTOES` | **Conforme.** O19, O20, O21, O24 e O25 entram como complementares, nas seções "Por que demora?", "Onde o trabalho acumula?" e "Onde se perde esforço?" do CA-1, junto com O22 e O26, que já existiam e agora têm seção. Os "leia junto" seguem as fichas. Os pares reversos saem do núcleo (BLOQUEADOS, O1, O3, O4, O7, O9, O10, T2), e o mapa de `cartoes.test.ts` afirma cada um. O status `mock` está só em O22 e O26. Os docs de contrato foram regenerados. |
| Exceção do O21 na alcançabilidade | **Aceita como está (A9).** O teste exclui `o21` por nome e com comentário. O O21 continua visível na seção "Onde se perde esforço?" (CA-1, `secao.test.tsx` com 14 cartões) e é citado pela página Métricas (CA-15). Ligar O13 ou O5 ao O21 é decisão de UX no E1.2. |
| O23 no O2 | **Conforme.** O bloco fica acima de "Itens para olhar primeiro", o destaque vem pronto do contrato (`parados.taxa`), a barra por etapa é só desenho (`aria-hidden`, com a lista em texto) e "Ver os parados" muda a ordenação. |
| Documentação (§7.7, §8.10) | **Falta (A1).** |

## Teto por PR (M14)

`git diff --numstat --no-renames origin/develop...HEAD`, sem `.md`: **2.023 linhas** (1.128 de código e 895 de teste). Os `docs/contratos/metricas/*.md` ficam fora da conta. O PR passa do teto de 400 por cinco vezes.

**A exceção vale para este PR, com uma condição.** Os sete cartões e o bloco O23 compartilham o catálogo (`cartoes.ts`, `catalogo-metricas.ts`), o registro e as contagens que vários testes afirmam: 65 linhas no catálogo, 33 complementares, "+14" nas preferências e a alcançabilidade. Para ficar abaixo de 400, seriam uns 5 PRs, cada um mexendo de novo nas mesmas contagens e passando outra vez por review, QA e UX. Isso custa mais que um review único e não dá para entregar uma seção de cartões sem as outras sem deixar o catálogo incoerente. O lote 2 (025) saiu num PR de 1.490 linhas pelo mesmo motivo. A condição é que o corpo do PR traga a linha `teto: excedido, <n> linhas, lote 3 indivisível: 7 cartões e o O23 sobre o mesmo catálogo e as mesmas contagens`, com o `<n>` recontado depois da volta.

## Achados

- A1 (bloqueante) docs/tecnica/arquitetura-front.md:298 · Falta a doc técnica do lote 3, e pela §7.7 e §8.10 a falta de doc bloqueia. Não há §13 sobre O19 a O26, O23 no O2, COM_TAMBEM com O22/O26 e a exceção do O21. A §12 ainda diz que o COM_TAMBEM lista só E6 e E8.
- A2 (bloqueante) web/src/features/complementares/operacionais.tsx:338 · O CA-6 manda dizer qual grupo do par com × sem tem menos de 20. O contrato traz `grupoAbaixoDoMinimo`, mas o O21 mostra só o menor n. O T13 já faz (`taticas.tsx:463`). Teste 'com', 'sem' e 'ambos'.
- A3 (bloqueante) web/src/features/complementares/operacionais.tsx:474 · "12 semanas" está escrito à mão no O22. A §3 e o comentário de `JANELA_PERCENTIS_PADRAO` (`contratos/src/comum.ts:241`) mandam partir dessa constante. Use `JANELA_PERCENTIS_PADRAO`.
- A4 (bloqueante) e2e/tests/complementares.spec.ts:81 · As E2E ainda afirmam 58 métricas, 26 complementares e "7 de 7" (também `intensivo-sistemico.spec.ts:70`, `lacuna-de-valor.spec.ts:210`, `preferencias.spec.ts:102`); os unitários afirmam 65, 33 e 14. A homolog quebra. Destino: QA, E1.3.
- A5 (recomendado) web/src/features/complementares/operacionais.tsx:417 · A matriz do O21 soma `retornos` com `filter().reduce()` na tela. O contrato dá uma célula por origem e destino, então use `find` e mostre o valor dela. Painel não agrega.
- A6 (recomendado) web/src/features/complementares/operacionais.tsx:708 · O texto do O25 é montado com `SEM_AMOSTRA.replace('— ', '')` e sai "P50 e P85 amostra insuficiente (menos de 20)". Escreva a frase inteira, por exemplo "P50 e P85 não publicados (menos de 20)".
- A7 (recomendado) web/src/features/complementares/operacionais.tsx:747 · A nota fixa "Nesta fase não há divisão por motivo" contradiz a tabela por motivo que aparece quando `porMotivo` vier preenchido. Condicione a frase a `porMotivo` nulo ou vazio.
- A8 (recomendado) web/src/features/complementares/operacionais.test.tsx:126 · O título "estado vazio e erro com 'tentar de novo'" testa só o vazio, e o erro está no teste seguinte. Renomeie para "estado vazio".
- A9 (recomendado) packages/contratos/src/cartoes.test.ts:145 · A exceção nominal do O21 na alcançabilidade é aceita, porque o O21 aparece pela seção (CA-1) e pela página Métricas (CA-15). Se a UX ligar O13 ou O5 ao O21 no E1.2, tire a exceção.
- A10 (recomendado) web/src/features/complementares/operacionais.tsx:759 · A leitura do O26 dá a faixa mais comum, não "x% com 2 ou mais" e o P85 de 3+ contra até 1 da ficha, que exigiria somar faixas na tela; o autor fez certo em não calcular. Leve à UX (E1.2) ou peça o campo ao contrato.

## Commits

Há um commit em Conventional Commits em português, com `Cartão: K-111` e as linhas de atribuição. O commit traz arquivos fora da lista literal do brief (`cartoes.ts`, docs de contrato, contagens de testes), mas eles são a decisão técnica de 14:25 e o efeito direto dela. Não há código morto, `console.log`, `eslint-disable` nem dependência nova.

## Volta

O `react-frontend` corrige A1 a A3 em commit novo `fix(...)` na mesma branch, e A5 a A8 se couberem. O `qa-engineer` atualiza as E2E do A4 no E1.3. A9 e A10 vão para a revisão de UX (E1.2). A revalidação sai por `forge-check delta --parecer docs/reviews/026-lote3-operacionais.md`.
