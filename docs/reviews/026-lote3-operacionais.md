---
tipo: review
contrato: 1
pedido: 026-front-do-011-lote3
branch: feature/026-lote3-operacionais
commit: eedcafcb114f62d26f8b9252f8735ddb5f1160dd
parecer: aprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review: front do lote 3 (O19 a O26) no /operacional (pedido 026, K-111)

## Revalidação (E1.4): eedcafc

**Veredito: aprovado.** A1 a A3 (bloqueantes) e A5 a A8 (recomendados) estão resolvidos em `eedcafc` (`fix(web)`, 3 arquivos, +57 -13). A4 continua com o QA (E1.3), e A9 e A10 continuam com a UX (E1.2). Não há bloqueante novo. Fica um recomendado novo (A11), que vai para a UX.

**Delta lido:** `forge-check delta --parecer docs/reviews/026-lote3-operacionais.md` (intervalo `b143858..eedcafc`, que é o `0a03c4b..eedcafc` sem o parecer) listou `docs/tecnica/arquitetura-front.md` 259, 268, 271, 281, 284 e 307-317; `operacionais.test.tsx` 126, 250-267, 454-458 e 742; `operacionais.tsx` 3, 34-38, 343-348, 426, 483, 717 e 754-755. Li só essas linhas. Fica como "já lido" o resto de `e342a2c..b143858`, revisado na 1ª rodada. Não rodei nada local: o brief dispensa, e o dono pediu uma suíte por vez. O autor relata `pnpm run pronto` com rc=0 na 3ª execução (pedido 026, linha de 17:31). O timeout de `plataforma2.test.ts` sob carga virou o K-150 e fica fora daqui.

| Achado | Situação | Evidência |
|---|---|---|
| A1 | resolvido | `arquitetura-front.md` §13 (307-317) cobre onde fica, O23 no O2, COM_TAMBEM com E6, E8, O22 e O26 (a §12 marcada como superada), a exceção do O21, O22, O24/O25, O26 e a proteção de pessoa. As linhas 259 a 284 são só reformatação do prettier (linha em branco antes das listas, `_seções_`) e não mudam o conteúdo. |
| A2 | resolvido | `operacionais.tsx:343-348`: `AvisoInfo` `o21-grupo-abaixo` com `GRUPO_ABAIXO[comp.grupoAbaixoDoMinimo ?? 'ambos']`, no mesmo padrão do T13 (`taticas.tsx:463`). Os testes (`operacionais.test.tsx:250-267`) cobrem com, sem, ambos e nulo. |
| A3 | resolvido | `operacionais.tsx:483` usa `JANELA_PERCENTIS_PADRAO`, importado em 3. |
| A5 | resolvido | `operacionais.tsx:426`: `find(...)?.retornos ?? 0`. A tela não soma mais. |
| A6 | resolvido | `operacionais.tsx:717`: "P50 e P85 não publicados (menos de 20)." O teste em 454 afirma a frase inteira. |
| A7 | resolvido | `operacionais.tsx:754-755`: a frase só aparece com `porMotivo` nulo ou vazio. Os testes cobrem os dois lados (458 afirma a frase presente, 742 afirma a frase ausente com a tabela "Duplicado"). |
| A8 | resolvido | `operacionais.test.tsx:126`: o teste agora se chama "estado vazio". |

**Nota do O25 em `notas.ts:251` (ficha, "cuidados"):** o autor a deixou como estava. O texto ("Nesta fase não há divisão por motivo: ela só entra quando a integração ler o catálogo de motivos do BusinessMap") está correto hoje. O `o25.ts:130` de `packages/metricas` devolve `porMotivo: null` até ler `/discardReasons` (CA-44, `regras.ts:628`), então a ficha não contradiz nenhum estado que a fase produz. A frase do cartão já é condicional (A7). **Destino recomendado:** manter. A troca do texto da ficha entra na mesma entrega da integração que preencher `porMotivo` (fase das integrações reais), e quem escreve o texto novo é a UX. Não é achado e não pede volta ao autor. Se a UX quiser antecipar uma redação neutra no E1.2 (por exemplo "A divisão por motivo só aparece quando os motivos de descarte forem lidos do BusinessMap"), ela pode.

**Teto (M14):** a recontagem sobre `origin/develop...HEAD`, sem `.md`, deu **2.053 linhas**. A exceção continua aceita, e a linha do PR passa a ser `teto: excedido, 2053 linhas, lote 3 indivisível: 7 cartões e o O23 sobre o mesmo catálogo e as mesmas contagens` (recontar se o E1.3 mexer nas E2E).

**Commit da volta:** está em Conventional Commits em português, é um commit só e não tem código morto nem dependência nova.

## 1ª rodada (b143858)

**Veredito da 1ª rodada: reprovado.** Há quatro achados bloqueantes. A1 a A3 voltam ao `react-frontend`. A4 é das E2E, que pertencem ao `qa-engineer` (§9 do `praticas.md`), e entra no E1.3. Ficam ainda seis recomendados (A5 a A10).

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
- A11 (recomendado) web/src/features/complementares/operacionais.tsx:346 · Com 'ambos' ou nulo, o aviso do O21 diz "o grupo com e sem retorno tem menos de 20" (singular para dois grupos). O texto vem do T13 (taticas.tsx:463). Leve à UX (E1.2) e, se mudar, ajuste os dois cartões.

## Commits

Há um commit em Conventional Commits em português, com `Cartão: K-111` e as linhas de atribuição. O commit traz arquivos fora da lista literal do brief (`cartoes.ts`, docs de contrato, contagens de testes), mas eles são a decisão técnica de 14:25 e o efeito direto dela. Não há código morto, `console.log`, `eslint-disable` nem dependência nova.

## Volta

O `react-frontend` corrige A1 a A3 em commit novo `fix(...)` na mesma branch, e A5 a A8 se couberem. O `qa-engineer` atualiza as E2E do A4 no E1.3. A9 e A10 vão para a revisão de UX (E1.2). A revalidação sai por `forge-check delta --parecer docs/reviews/026-lote3-operacionais.md`. Ela foi feita no E1.4 (seção "Revalidação", acima), e a situação de A1 a A3 e A5 a A8 está lá: resolvidos.
