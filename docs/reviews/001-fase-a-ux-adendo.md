# Adendo ao parecer de UX da fase A (001)

Registrado pelo Jarvis em 2026-10-09 20:30. Duas instâncias do `ux-designer` revisaram a fase A em paralelo (a segunda foi relançada por engano, achando que a primeira tinha falhado). A segunda sobrescreveu `001-fase-a-ux.md`. Os itens abaixo constavam **só na primeira versão** (0 críticos, 8 altos, 12 médios, 10 baixos) e continuam valendo. O conjunto a corrigir é a **união** dos dois.

| Id (v1) | Severidade | Achado | Correção esperada |
|---|---|---|---|
| v1-A4 | alto | O erro de rota substitui o `AppShell`: somem o selo "Dados fictícios", a navegação e o rodapé | `errorElement` dentro do layout, preservando shell e aviso |
| v1-A6 | alto | Séries por tipo no O4 empilhado distinguidas só por cor | Padrões SVG / rótulos diretos além da cor |
| v1-A7 | alto | `?mock=`: sem `erro-uma-vez`, sem ids com hífen e lista por vírgula; `mock=erro` vira erro em todos os cartões (deveria ser erro de painel); links e "Copiar link" propagam `mock` | Seguir a spec 6.6 |
| v1-M | médio | Anatomia do cartão fora da ordem da spec (4.0) | Reordenar conforme 4.0 |
| v1-M | médio | Faixa do O4 desenhada como três linhas, não como faixa sombreada | Faixa sombreada P50–P85 conforme spec |
| v1-M | médio | `Dica` (tooltip) não abre por toque | Abrir por toque/clique e fechar com Esc |
| v1-M8 | médio | `data-testid` faltando (`tabela-*`, `aviso-filtros-nao-aplicaveis`) | Seguir a convenção da spec |
| v1-M10 | médio | Aplicabilidade divergente em EI_FL2 e T9 (`contracts/metricas.ts`) | Conforme tabela 2.2 da spec |
| v1-M | médio | "Ver todos os alertas" não faz nada | Âncora para a faixa completa ou remover |
| v1-M | médio | Ajuda (`/ajuda`) incompleta | Completar conforme spec |
| v1-M9 | decisão | Seletor de tema como `select` **aceito** pela UX (no lugar de `radiogroup`); spec 8.2 e testes do QA a atualizar | — |
