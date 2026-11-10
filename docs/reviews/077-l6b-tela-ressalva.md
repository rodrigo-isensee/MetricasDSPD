---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l6b-tela-ressalva
commit: 832583168c7c0247bd0a9093c73649b7a31b5417
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 6b, ressalva do S2 na tendência de SLA (K-211, E2.2)

Diff lido: `git diff 0236c717...1335576d` (só o intervalo do 6b; a branch é empilhada sobre o 4b, cujos arquivos têm parecer próprio em `docs/reviews/077-l4b-tela-janela-sust.md`). 3 arquivos em `web/`. Referências: seção "Lote 6b" do desenho (`docs/analises/077-desenho.md`), seção 2 e os CA-8 a CA-11 e CA-13 da especificação (`docs/ux/077-tendencias.md`).

## Revalidação (2026-11-10, após o merge da develop)
Delta lido (`forge-check parecer delta`, intervalo `1335576d..83258316`, sem o que veio da base): nenhum arquivo do domínio mudou. Conferido à mão contra `origin/develop` (528ae770): o diff em `web/` é só `SerieMensal.tsx`, `TendenciaSustentacao.tsx` e `componentes.test.tsx` (+86/-3; as 3 linhas removidas são imports reescritos). Em `TendenciaSustentacao.tsx`, `vazioJanela` (4b) e `notas`/`notasTestid` (6b) valem juntos na série de SLA. `componentes.test.tsx` traz os dois `describe` (janela incompleta, CA-1 a CA-14; ressalva do S2, CA-8 a CA-13), sem caso enfraquecido. Fora de `web/` e `docs/`, nada difere da develop. Testes do arquivo: 30 verdes. CI do head: run 42812260743 em andamento ao gravar; o do commit anterior estava verde.

## Parecer
**Aprovado.** O lote faz o que o desenho pede, nem mais nem menos.

- **CA-8 (nota só com o id e ponto publicado):** `TendenciaSustentacao.tsx:37` liga a nota quando `t.notas` traz `excecao-sla-sem-fonte` e a série de SLA tem algum ponto com valor; a decisão vem do contrato, a web só lê a marca.
- **Posição entre o subtítulo e o gráfico (CA-8):** a lista sai em `SerieMensal.tsx:102-114`, depois do bloco de título e subtítulo e antes do ramo vazio/gráfico/tabela; fica visível também na tabela alternativa, sem repetição. O teste confere a ordem no DOM com `compareDocumentPosition`.
- **CA-9:** sem a nota no resultado, a lista não renderiza (teste próprio).
- **CA-10:** a série de volume não recebe `notas`; o teste afirma a ausência no volume e uma única ocorrência do texto na tela.
- **CA-11:** com `estaOculto('s2')` a série inteira não renderiza, e a lista é filha dela; o teste usa o `ContextoPreferenciasPainel` e afirma que o volume segue.
- **Série de SLA vazia:** com `prioridades: []` o ponto sai `valor: null`, `comNota` é falso e só o vazio aparece. O teste reprova o que diz: sem a condição `sla.some(...)`, a lista apareceria acima do vazio.
- **CA-13 (texto do contrato sem duplicar):** a tela lê `TEXTO_NOTA_QUALQUER['excecao-sla-sem-fonte']`; o teste compara com `TEXTO_NOTA_SUSTENTACAO`, a fonte que a especificação cita. Nenhum literal da nota em `web/`.
- **Prop `notas` em `SerieMensal`:** opcional, com padrão `[]` e `notasTestid` opcional; os outros usos não passam a prop e não mudam de saída.
- **T2.5:** nenhuma conta na tela; o lote só decide exibir um texto.
- **Fora do diff:** nada em `server`, `packages` ou `docs/contratos` difere da develop além do que ela trouxe.
- **Revisão de interface do 6b** (`docs/ux/077-revisao-l6b.md`, aprovada, dois achados baixos): citada, não refeita. O A1 coincide com o primeiro achado baixo dela.

## Ferramentas
- Testes dos arquivos tocados (D-5): `vitest run --maxWorkers=2 src/features/operacional/resumo/componentes.test.tsx`: 1 arquivo, 30 testes verdes no head `83258316`. Suíte inteira: no CI do PR.

## Teto M14
`git diff --numstat --no-renames origin/develop...HEAD -- web e2e`: 20+1, 8+1, 58+1 = 89 linhas, dentro do teto de 150. Um comportamento só (ressalva do S2 na série de SLA da tendência).

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:103 · `ul` com `list-none` sem `role="list"` perde a semântica de lista no VoiceOver/Safari; mesmo padrão do `CartaoMetrica`, cabe num lote de consistência. Segue valendo.
