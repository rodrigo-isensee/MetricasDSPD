---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: 469ee8fd28171e9473a7f64d751b521ecedbd7da
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-integracao-businessmap (F6 do plano 052, painel operacional com dado real, E2.72, K-182)

**Veredito: reprovado** em `469ee8f`, só pelo A1. Com duas bases, a Visão geral continua na base do seed, mas a tela não tem selo e o arquivo exportado marca um bloco dela como dado real. O resto do delta confere com a seção F6, com as decisões técnicas da F6 e com a ADR 0024. A2 a A6 são recomendações e não devolvem.

## Escopo lido

O delta é `e1e5f86..469ee8f`, 5 commits:
- `23a66f1`, `5657819` e `09227e1`: front e contrato (E2.70);
- `ba802e3` e `469ee8f`: contrato, biblioteca e servidor (E2.69).

A ADR 0024 entrou em `c798755`, antes do `e1e5f86`, e já está na base do delta. Ela foi lida como referência.

São 97 arquivos. Li inteiros os de código:
- `packages/contratos`, `packages/metricas` e `packages/mock`;
- `server/src`;
- `web/src`.

Dos testes, li os nomes e as asserções principais de `painel-real-f6.test.ts`, `painel-real-f6.pg.test.ts`, `tipo-coluna.test.ts`, `o1.h12.test.ts`, `origem.test.ts` e `times-sem-comparacao.test.ts`.

A documentação gerada (`docs/api`, `docs/contratos`) foi conferida só por amostra, nos casos de O3 e O14.

Para ter contexto, li também:
- `noDia` e `vigenteEm` (`normalizador.ts:68`, `referencia.ts:361`);
- `o1.ts`, inteiro;
- `visaoGeral.ts`, nos indicadores e na Espera invisível;
- `VisaoGeralPage.tsx` e `AvisoDadosFicticios.tsx`;
- a restrição de `categoria` na `0018`.

## Conferência pedida no brief

- **Base real e base do seed nunca na mesma métrica:** confere nas métricas. `ServicoMetricas` escolhe os schemas por `origemDaMetrica` (`servico.ts:97`). As cargas e o cache são separados por base (`businessmap|real`, `businessmap|base`). As extensões mockadas não entram em métrica real (`!real`).
  - O teste `painel-real-f6.test.ts:74` prova que cada métrica lê uma base só.
  - O `(d)` do `.pg` prova que FL2, FL3 e Sustentação não mudam.
  - **Lacuna:** a `VISAO_GERAL` não está no mapa e lê o seed. O resultado é coerente, mas a interface não diz isso (A1).
- **Cálculos só pela biblioteca:** confere.
  - O1 com limite 0: a taxa sai por `taxa(0, 0)` e fica abaixo do mínimo.
  - Percentis do O3: biblioteca.
  - Frescor e calibração: constantes de `core`.
  - `limitesDosTimes` (`mapa.ts:92`) soma configuração do quadro e não calcula tempo, percentil nem previsão.
- **Abaixo de 20 não publica:** nenhum caminho novo publica estatística. O O1 sem limite não publica aderência e não marca status de meta.
- **Nenhum cartão compara times:**
  - `lerTimesAtivos` e `lerColunasReais` só listam e juntam o nome.
  - `limitesDosTimes` é usado só na soma das equipes selecionadas, sem ranking nem série por time.
  - O guard `times-sem-comparacao.test.ts:18` cobre os dois repositórios novos.
  - A permissão de a API ler `ref_time` é da segurança (E2.73), e cito sem refazer.
- **Soma do O1 (pergunta ao dono):** está isolada. A regra inferida vive numa função e numa constante: `limitesDosTimes` e `PAPEIS_COM_LIMITE`, em `mapa.ts:90`. O O1 só vê o resultado e a marca `limite_wip_por_coluna`.
  - Se o dono responder "só por coluna", basta `limitesDosTimes` devolver vazio. O O1 já mostra o WIP sem limite e não publica aderência (`o1.ts`, `semLimite`).
  - Se ele responder outra soma, muda só a constante ou a função, com o teste `painel-real-f6.test.ts:194`.
  - Não há retrabalho. Até a resposta, o efeito na tela é o do A2.
- **Filtro de equipe único também no FL2 e no FL3 em mock:** `opcoesFiltro` lista os times reais para o domínio inteiro (`referencia/servico.ts:25`). Não há mistura nem número falso: o filtro com nome real não acha card no seed, e o cartão fica "abaixo de 20". A consequência para quem usa está no A3.
- **`DSPD_SCHEMA_PREFIXO_SEED` no `.env.example`:**
  - Não conferi o arquivo, porque a leitura é barrada para mim também. O autor relatou que a linha falta.
  - A variável está documentada em `docs/api/metricas.md:382` e validada em `config.ts`, com teste em `plataforma2.test.ts:26`.
  - Falta em `docs/architecture/server.md:167` (A4).
- **Teto (decisão M14):** abaixo.

## Plano (decisões técnicas da F6, itens 1 a 7) e ADR 0024

1. **Contrato:** confere.
   - `Trabalho de produto` está no fim de `TIPOS_CARD` e de `TIPOS_FILTRO`, com `TIPO_ID` igual a `trabalho-produto`.
   - `CATEGORIAS_TIPO_CARD` e `TIPO_DA_CATEGORIA` trazem os seis códigos, os mesmos do `ENUM` da `0018`.
2. **Normalizador:** grava o rótulo, e Sprint fica `null`. O cast sem comentário é o A6.
3. **`mapa.ts`:** o cast cego saiu. O card fora do contrato sai do contexto, e o log leva só a contagem (`servico.ts`, `cardsForaDoContrato`).
4. **Função única do tipo da coluna:** `indiceTipoDaColuna` usa a mesma `noDia` e a mesma `vigenteEm` do normalizador, com memo por coluna e dia. O projetor não passou a usá-la (A5). A regra continua em um lugar só, a `vigenteEm`.
5. **Repositório:** `lerVersoesColuna` lê todas as versões. Com duas bases, `lerTransicoes` deixa de filtrar `tipo_coluna` no SQL. Nenhum `UPDATE` de fato. O GRANT fica com a segurança: o teste `.pg:115` mostra que o `dspd_api` lê sem coluna de pessoa.
6. **Testes `.pg`:** `(a)` a `(d)` presentes, com os nomes do plano.
7. **Primeira projeção real:** fica para a E2.58, fora deste código.

Os itens da seção F6 também conferem:
- O1 pela coluna (H-12);
- O3 com `notas: [sle-nao-definido]` sem SLE (H-24);
- nota fixa de classe no O6 e no T2 (H-15), só com métrica real;
- frescor de 6 h (Q-7b);
- calibração de 60 dias (Q-7a), só no comentário;
- selo por cartão e nota do cabeçalho com a contagem (P-1 = B);
- Exportar com fonte, "Atualizado em", frescor, calibração e fictício (P-4).

O mapa dá `mock` exatamente para O8, O12 e O14 a O18, com o motivo, e mais O19 a O26, que vão para a F6b. Isso confere com a H-13 (`origem.test.ts:13`).

## Observação (sem achado)

Na fonte `api` contra uma base única de seed, como a homologação, o front decide o selo pelo mapa estático. Por isso O1 a O13 aparecem sem selo, mesmo vindo do seed. Antes da F6 já era assim: nenhum cartão tinha selo na fonte `api`, e `AvisoDadosFicticios` some fora da fonte mock. Não é regressão. Fica para o UX (E2.74) e o QA saberem.

## Checklist (leitura)

- **Faz o que a fatia pede:** sim, menos o A1.
- **Arquitetura, ADRs e regras invioláveis:**
  - BusinessMap e Acelerato não se cruzam: a Sustentação lê o seed inteira.
  - Nenhuma métrica individual.
  - Histórico intacto: leitura só, sem escrita.
- **Legibilidade:**
  - O `servico.ts` cresceu, mas as funções `ehReal` e `esquemasDe` deixam a escolha da base explícita.
  - Ficou uma linha em branco dupla em `referencia/repositorio.ts`, depois de `lerTimesAtivos`. É trivial e não vira achado.
- **Tipos e erros:** um cast sem comentário (A6). O resto está tipado e o log não leva valor de card.
- **Segurança:** parecer próprio (E2.73), em paralelo. Cito e não refaço.
- **Performance:** `vigenteEm` reordena a cada chamada, mas o memo por coluna e dia limita isso a uma ordenação por par distinto. Isso fica dentro do item 4 do plano. A medição contra o orçamento da ADR 0003 com o volume real fica para o QA, depois da E2.58.
- **Testes:** cobrem o comportamento novo e as bordas: limite 0, base semeada com limite 0, tipo fora do contrato, coluna sem versão e correção que dá tipo. Não há teste de Visão geral com duas bases (A1).
- **Commits:** limpos, em Conventional Commits, um por camada.

## Execuções

`vitest run` em `painel-real-f6.test.ts`, `tipo-coluna.test.ts` e `times-sem-comparacao.test.ts`: 23 testes, todos passaram. Rodei com prioridade baixa e uma suíte por vez.

Ficam com o relatório do autor (E2.69 e E2.70) e com o QA (E2.75):
- o `pronto` verde;
- o `test:pg`, com 23 arquivos e 152 testes;
- a web, com 1250 testes e cobertura de 100%.

Cito e não refaço. O `praticas.md` continua sem regra "decidida por: `<comando>`".

## Teto de linhas (decisão M14)

Contei com `git diff --numstat --no-renames e1e5f86..469ee8f`, sem os `.md` e sem `docs/`, porque openapi e snapshots são gerados ou são fixture. O resultado é **1730 linhas**: 722 de código e 1008 de teste. Está acima do teto.

O comportamento é um só, a fatia F6 do plano validado: o painel operacional lido da base real, com a origem de cada cartão. As decisões técnicas da F6 (A3 e A4 da F4) fazem parte da própria seção do plano e são condição para a métrica real sair certa. Por isso, e seguindo o precedente da F2 e da F3, **aceito a exceção**.

O PR sai depois do merge da F4. O número é recontado contra a `develop` na hora, porque hoje o diff contra a `develop` ainda carrega a F4. A linha do PR fica assim: `teto: excedido, <n> linhas, F6 do plano 052: painel operacional lido da base real com a origem de cada cartão (duas bases, tipo do card e da coluna, O1 pela coluna, selo, nota e Exportar)`. Sem essa linha, ou com um número antigo, vira achado bloqueante quando o PR for aberto.

## Achados

- A1 (bloqueante) web/src/features/exportar/gerar.ts:93 · Com duas bases, VISAO_GERAL lê o seed (servico.ts:98), mas o bloco EI-FL1 exportado sai "Dados fictícios: não" e a tela da Visão geral fica sem selo na fonte api (P-1, P-4). Sugestão: a VG decide pela origem de VISAO_GERAL, com teste.
- A2 (recomendado) server/src/modulos/metricas/mapa.ts:92 · Soma do O1 isolada, troca sem retrabalho. Até a resposta, o O1 compara o WIP do time inteiro (fila e colunas sem limite) com a soma de poucas colunas e tende a "fora". Levar esse efeito junto da pergunta ao dono.
- A3 (recomendado) server/src/modulos/referencia/servico.ts:25 · O filtro lista times reais também para FL2, FL3 e as fictícias do FL1, que leem o seed com outros nomes: escolher um time deixa esses cartões em "abaixo de 20". Sem mistura nem número falso. Destino: ux-designer (E2.74) e Jarvis.
- A4 (recomendado) docs/architecture/server.md:167 · DSPD_SCHEMA_PREFIXO_SEED documentada só em docs/api/metricas.md:382. Falta na config por entrada do server.md (autor, na volta) e a linha do .env.example (Jarvis com o dono; autor e revisor não leem o arquivo).
- A5 (recomendado) server/src/modulos/businessmap/tipo-coluna.ts:29 · O item 4 do plano pede a mesma função também no projetor, mas ele segue com noDia direto (normalizador.ts:115). A regra é a mesma (vigenteEm), então não devolve. Unificar na F6b.
- A6 (recomendado) server/src/modulos/businessmap/normalizador.ts:199 · Cast "as CategoriaTipoCard" sem comentário. O ENUM da 0018 garante o valor; deixar isso dito em uma linha ao lado do cast.
