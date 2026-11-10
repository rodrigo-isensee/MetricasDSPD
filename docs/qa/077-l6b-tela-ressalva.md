---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l6b-tela-ressalva
commit: 832583168c7c0247bd0a9093c73649b7a31b5417
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 6b, ressalva do S2 na tendência de SLA (E2.3, K-211), revalidação após o merge da develop

Código testado: `83258316` (merge da develop em `feature/077-l6b-tela-ressalva`). O HEAD `af4d6697` só soma o review. Obrigação: `docs/ux/077-tendencias.md` (CA-8 a CA-11 e CA-13; o CA-12 é do lote 7). O parecer anterior (`1335576d`, 2026-11-07) fica desatualizado só porque o merge da develop (4b já mesclado) mexeu em `componentes.test.tsx`; os critérios e a tabela abaixo valem para o novo head.

## Conferência da resolução do merge
- Diff `528ae770` (base) `..83258316` em `web/src/features/operacional/resumo/`: 3 arquivos, +86/-3, e só o que é do 6b: `SerieMensal.tsx` (lista de notas), `TendenciaSustentacao.tsx` (`comNota`, `notas`, `notasTestid`, import de `TEXTO_NOTA_QUALQUER`) e `componentes.test.tsx` (bloco do S2 e import de `ContextoPreferenciasPainel` e `TEXTO_NOTA_SUSTENTACAO`). Nenhuma linha removida além do import reescrito de `@/components/ui`.
- `TendenciaSustentacao.tsx`: a janela incompleta (4b: `vazioJanela`, `serieSla`, frase da série) e a ressalva (6b: nota junto de `sla.some(valor !== null)`) valem juntas, lado a lado.
- `componentes.test.tsx`: os dois blocos existem, "Sustentação: ressalva do S2 (CA-8 a CA-11, CA-13)" com 4 testes e "Sustentação: janela incompleta (CA-1, CA-2, CA-4, CA-5, CA-14)" com 2, além de "janela incompleta" em `SerieMensal` com 4. Nenhum caso do 4b foi enfraquecido (diff sem linha removida de teste) e nenhum caso do 6b foi perdido.
- `git diff 1335576d..83258316` nesse diretório: só o que a develop trouxe; fora de `web/` o merge traz o resto da develop, sem relação com o 6b.

## Critério, teste, resultado
| Critério | Teste (`componentes.test.tsx`) | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-8 nota com o id e ponto publicado, entre subtítulo e gráfico | "CA-8 e CA-13..." | posição no DOM; ponto publicado | passou |
| CA-9 sem nota no resultado, nada aparece | "CA-9: sem a nota..." | `notas` ausente | passou |
| CA-10 nunca na série de abertos | mesmo teste do CA-8 | outra série | passou |
| CA-11 S2 oculto, série e nota somem juntas | "CA-11..." | permissão/preferência | passou |
| CA-13 texto do contrato, sem duplicar | mesmo teste do CA-8 (`TEXTO_NOTA_SUSTENTACAO`) | texto exato | passou |
| Série de SLA vazia: sem nota | "série de SLA vazia..." | vazio | passou |
| Janela incompleta (4b) segue valendo junto | bloco "janela incompleta" (Sustentação e `SerieMensal`) | janela de 12 semanas | passou |

## Execução
- `vitest run --maxWorkers=2 src/features/operacional/resumo` na worktree em `83258316`: 3 arquivos, 72 testes verdes (mesma contagem do parecer anterior; o 4b já estava nela).
- Vermelho antes do verde e mutantes M1 a M9: do parecer de `1335576d`, sem mudança no código do 6b entre os dois heads (`SerieMensal.tsx` e `TendenciaSustentacao.tsx` só diferem pelo que a develop trouxe); não repeti.
- E2E e suíte inteira: no CI do PR (check-run `bateria` do mesmo sha); não rodei de novo.
- `forge-check` do PATH quebrado (cópia do Windows): usei a saída do `parecer delta` rodada pelo Jarvis.

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:103 · o mock do E2E não serve `notas` em TENDENCIA_SUST, então o contraste da nota não é medido em navegador; jsdom não mede contraste; classes iguais às do CartaoMetrica.
