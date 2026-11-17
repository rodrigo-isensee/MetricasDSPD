# Revisão de UX: T7 sem limite de frentes (E7.507)

parecer: aprovado com ressalvas (nenhum achado crítico ou alto). Head 7626f762, lido em `web/src/features/tatico/components/CartaoT7.tsx` e `notas.ts`. Tudo `lido` (sem ferramenta); o pronto completo não fechou verde por timeout de testes alheios (relato do autor), e não afirmo CI verde.

## Conferido
- Sem comparação nem selo de limite: o cartão não calcula nem exibe frentes versus teto; `statusMeta="sem-meta"` e `textoStatus="Sem limite de frentes"` (linhas 41-42). Cumpre a decisão do dono (17/11).
- Texto completo "Não há limite de frentes simultâneas, por decisão do dono" (linha 61) é claro, em pt-BR, voz direta; o status não depende só de cor (tem texto).
- WIP, ciclo e envelhecimento preservados (barras por projeto, dispersão com P50/P85/P95, tabela equivalente, histograma, amostra insuficiente). Barras e dispersão têm tabela de dados como alternativa (heurística: reconhecer, WCAG 1.1/1.3).
- Nota `meta` em `notas.ts:53` consistente com o cartão. Nada leva a avaliação individual nem a comparação entre times.

## Achados
- Baixo: o terceiro KPI ("sem limite" em NumeroGrande, linhas 58-62) repete o `textoStatus` e ocupa o lugar de um número; o rótulo fica no mesmo peso dos números reais. Correção sugerida: remover o terceiro tile e deixar só o status do cartão (design minimalista), ou manter se o dono quiser o aviso em destaque. Não bloqueia.
- Baixo: o rótulo "projetos com frentes ao mesmo tempo" pode induzir leitura de "excesso" sem limite definido; considerar "projetos com frentes em andamento", igual ao texto da leitura (linha 26). Consistência de vocabulário.
- Baixo (lido, não medido): `textoCompleto` só é exposto se o NumeroGrande o usar como rótulo acessível; confirmar com o QA (@axe) que o leitor de tela anuncia a frase inteira.
