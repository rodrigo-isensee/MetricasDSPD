# Revisão de interface, volta 3: selo Simulado (pedido 070, E1.7)

pedido: 070-simulado-por-cartao
branch: feature/070-gate-fronteiras
commit: bf3d1164825cb221575ce459a6a211ad5f2d0f76
revisor: ux-designer
data: 2026-11-05
base da revisão: especificação e protótipo validados pelo dono (K-221, decisão "A" de 2026-11-04), desenho 070 (R1 a R7, T-W1 a T-W8), revisão anterior (`revisao-v2.md`, commit e8c148b), heurísticas de Nielsen e WCAG 2.2 AA. Só leitura de `web/src/data/FonteComSimulado.ts` e `web/src/components/ui/SeloSimulado.tsx` na worktree; nada executado, nada escrito nela.

## Veredito
Aprovado. A volta 3 só tira o import estático do pacote mock da fonte com simulado (agora `import()` dinâmico em `criarMockPadrao`). Nada do que estava conforme na v2 mudou na interface, e não há achado novo.

## Conferência contra a v2

| Item | Resultado | Onde |
|---|---|---|
| Selo | igual: `role="img"`, nome completo, ícone, borda, texto "Simulado" | `SeloSimulado.tsx:33-45` |
| Faixa | igual: `role="note"`, aviso, motivo, botão "O que é simulado?" com `aria-expanded` e `aria-controls` | `SeloSimulado.tsx:51-85` |
| Botão | igual: `alvo-44` mantido | `SeloSimulado.tsx:71` |
| Marca d'água | igual: contêiner contido, `aria-hidden`, `pointer-events-none` | `SeloSimulado.tsx:88-103` |
| Textos | constantes iguais aos validados (selo, faixa, explicação, legenda da tabela, prefixo "Exemplo: ") | `SeloSimulado.tsx:7-15` |
| Selo antes do número (R4) | preservado: `registro.marcar(id, { motivo })` roda antes do retorno do dado | `FonteComSimulado.ts:96-98` |
| Falha fechada (R5, T-W4) | preservada: `podeSimular`, schema e falha do mock levam a `marcar(id, null)` e erro, ou seja "Sem dado real", nunca número | `FonteComSimulado.ts:85-103` |
| Real ganha (R2, T-W1) | preservado: `obter` nunca chama o mock; o simulado é caminho à parte | `FonteComSimulado.ts:62-76` |
| Troca sozinha (T-W7) | preservada: DTO real limpa a marca | `FonteComSimulado.ts:68-71` |

## Observação sobre a carga sob demanda
Com o `import()` dinâmico, o primeiro cartão simulado passa a esperar o chunk do mock. Isso já era o desenho (R-NFR de desempenho, T-W5) e o cartão segue no estado de carregamento padrão, sem selo nem número até o dado chegar. Sem efeito de interface.

## Achados
- A-12 (baixo) Herdado: "Sem dado real" usa `p.erro.motivo` cru (`CartaoMetrica.tsx:158`), que pode trazer sigla. Aplicar `motivoSemSigla` se o dono quiser; fora desta volta.

## Pendências herdadas, sem mudança
A-6 (nota "N cartões sem dado real") segue como decisão de microcopy do dono. A-8 é só observação.

## Limites desta revisão
Não executei a interface nem os testes. O delta foi conferido pela leitura dos dois arquivos, sem diff; a medida real de 44px e a marca d'água em 320px e no tema escuro continuam para o QA.
