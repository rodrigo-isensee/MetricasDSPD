---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l8b-tela-contagem-parcial
commit: aa137dd451a22454409ccd833ecd0d11925590a1
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 8b, tela da contagem parcial (E2.3, K-211)

Código testado: `aa137dd4` (o HEAD `f3f99eab` só soma o review). Escopo: `origin/feature/077-l6b-tela-ressalva..aa137dd4`, 3 arquivos em `web/src/features/operacional/resumo/` (`modelo.ts`, `SerieMensal.tsx`, `componentes.test.tsx`). Obrigação: P-077-5 = A (decisão do dono) e "Lote 8b" de `docs/analises/077-desenho.md`: o número do mês marcado com `contagemParcial` não aparece em gráfico, tabela, `figcaption`, lista de sem-valor nem frase; o motivo "histórico incompleto" aparece. Não há `CA-n` próprio do 8b na especificação de UX; a obrigação é a decisão P-077-5 e o desenho.

## Critério, teste, resultado
| Obrigação | Teste (`componentes.test.tsx`, bloco "contagem parcial") | Fronteira protegida | Resultado |
|---|---|---|---|
| Fluxo: 777 do mês marcado não aparece no resumo, no `figcaption` nem na tabela; o motivo sim (lista sem-valor com data, `figcaption` "julho: Histórico incompleto", situação na tabela) | "fluxo: o número do mês marcado não aparece..." | superfície inteira da série (4 superfícies) | passou |
| Mês sem marca ao lado mostra o número (31, na lista, na tabela e no `figcaption`) | mesmo teste | mês vizinho não marcado | passou |
| Sustentação: 888 do volume não aparece; o motivo sim | "sustentação: o volume do mês marcado não aparece..." | volume (série diferente do fluxo) | passou |
| A série de SLA do mesmo mês não muda (sem "Histórico incompleto") | mesmo teste | série de SLA | passou |
| Sem nenhum mês marcado a série fica como antes (sem motivo, sem lista) | "sem nenhum mês marcado a série não muda" | ausência da marca | passou |
| Acessibilidade: situação "não publicado · histórico incompleto" | mesmo teste do fluxo e da sustentação (célula da tabela) | texto, sem cor | passou; ver abaixo |

## Execução
- `vitest run --maxWorkers=2 src/features/operacional/resumo` (TZ=UTC) em `aa137dd4`: 3 arquivos, 75 testes verdes (3 novos do 8b).
- Vermelho antes do verde: com `modelo.ts` e `SerieMensal.tsx` trazidos de `origin/feature/077-l6b-tela-ressalva` (8b revertido, testes mantidos): 2 falhas, "fluxo: o número do mês marcado..." e "sustentação: o volume do mês marcado..."; 73 passam. O terceiro teste (sem marca) passa sem o 8b, como esperado: guarda regressão, não o 8b. Árvore restaurada por `git checkout HEAD -- web/src`; `git status` limpo.
- Mutação (cada uma numa cópia da árvore, restaurada depois; 75 testes por rodada):

| Mutante | Resultado |
|---|---|
| M1 `serieConcluidos` ignora a marca | morreu (fluxo) |
| M2 `serieVolume` ignora a marca | morreu (sustentação) |
| M3 `contagemIncompleta` devolve `valor: 777` | morreu (2 testes) |
| M4 `situacaoDoPonto` sem o ramo `contagemParcial` | morreu (2 testes) |
| M5 `contagemIncompleta` sem o campo `contagemParcial` | morreu (2 testes) |
| M6 `contagemIncompleta` com `n: 5` | **sobreviveu** (ver A1) |
| M7 `contagemIncompleta` com `n` = número do mês (777) | morreu (fluxo: coluna "Base (n)") |

- Acessibilidade: a situação sai como texto na coluna "Situação" da tabela (`situacaoDoPonto`), lida por leitor de tela e sem depender de cor; na lista sem-valor o marcador "○" é `aria-hidden` e o motivo está em texto; o gráfico mantém `role="img"` com `aria-label` e o resumo no `figcaption` `sr-only`. Verificação automática (axe) e contraste não rodados aqui: jsdom não mede contraste, e o 8b não cria classe, cor nem componente novo.
- Fora do ar e sem rodar: E2E e suíte inteira, no CI do PR (check-run `bateria` do mesmo sha). `forge-check` do PATH quebrado (cópia do Windows); não usado.
- Segurança: sem gatilho (sem dado de pessoa, dependência ou escrita externa); não declaro "seguro".

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/componentes.test.tsx:517 · o teste do fluxo checa só que "777" não aparece; não afirma que a coluna "Base (n)" do mês marcado é "—". Mutante M6 (n: 5 no ponto marcado) sobrevive: um n parcial que não seja o número do mês passaria.
