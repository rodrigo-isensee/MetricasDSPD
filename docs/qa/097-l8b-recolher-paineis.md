---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l8b-recolher-paineis
commit: 50561b925cd3c9a4f5cc7623c68c5dfcfc46d910
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---
# QA: 097 L8b, recolher cartão ligado nos painéis (E4.54)

**Veredito: aprovado**, com um achado recomendado (mutante sobrevivente, lacuna de teste) e as ressalvas B2 e B3 da UX, que já estão no cartão K-324. Classe N com interface. Código em `50561b92`; o teste novo de E2E está no commit `31b49295` (só `e2e/tests/recolher-097-qa.spec.ts`, fora do domínio do review). Os CA-25 a CA-32 vêm de `docs/ux/097-filtros-time-busca.md`.

## Execução
- Vitest (`VITEST_MAX_WORKERS=2`, `--maxWorkers=2`): `recolhidos.test.tsx`, `apontamento/recolher.test.tsx`, `painel/painel.test.tsx`: `Test Files 3 passed (3)`, `Tests 38 passed (38)`. A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha); não a rodei.
- E2E novo, chromium, `--workers=1`: `9 passed (48.4s)` (o primeiro rodar teve 1 falha minha: usei O5 e O6, que são complementares sem botão de recolher; troquei por O3 e O9, que têm. Não é defeito do produto).
- Nota: nenhum E2E existente cobria o recolher, e o CI pula `e2e` neste head; por isso o spec novo.

## Tabela critério, teste e resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-25/26/27 botão, resumo, expandir | E2E RC-01 (Enter e Espaço, `aria-expanded`); `recolhidos.test.tsx` CA-25, CA-26 e CA-27 | teclado | passou |
| CA-28 foco no mesmo botão | E2E RC-01 (`toBeFocused` nas duas direções) | teclado | passou |
| CA-29 memória por cartão e painel, sem URL, só códigos | E2E RC-01 (URL igual, chave `{versao:1,paineis:{operacional:["O4"]}}`), RC-02 (reload), RC-06 (Apontamento não vaza no Operacional) | painel vizinho, URL | passou |
| CA-30 Restaurar | E2E RC-02 (some sem recolhido, expande, apaga, foco em `tabindex=-1`), RC-05 | vazio | passou |
| CA-31 erro no resumo | `recolhidos.test.tsx` CA-31 (E2E não forçou erro neste painel) | estado de erro | passou |
| CA-32 resumo neutro | E2E RC-05 (resumo do AP-PROJETO sem nenhum nome de projeto da fixture); `recolher.test.tsx` e "Ana fez 40 h" | sem dado por pessoa | passou |
| AP-KPIS não recolhe | E2E RC-05 (sem botão); `recolher.test.tsx` | cartão de número único | passou |
| Memória corrompida | E2E RC-03 (`{lixo`); `recolhidos.test.tsx` (5 casos) | entrada inválida | passou |
| Ressalvas M1, M2, B1, B2, A1, A2 do L8a | `recolhidos.test.tsx` (nomes M1, M2, B1, B2, A1, A2) | estados, segunda restauração | passou |
| Quatro painéis recolhem e restauram | `painel.test.tsx` | Operacional, Tático, Estratégico, Sustentação | passou |

## Acessibilidade (axe, tags WCAG 2.2 AA, zero bloqueantes)
| Estado | Claro | Escuro |
|---|---|---|
| Operacional semanal, O4 recolhido e Restaurar visível (RC-04) | passou | passou |
| Apontamento, AP-PROJETO recolhido e Restaurar visível (RC-07) | passou | passou |

Teclado: Enter e Espaço alternam e o foco fica no botão (RC-01). Não ouvi o anúncio com leitor de tela real (limite declarado pela UX).

## Mutação à mão (um mutante por vez, restaurado com `git show HEAD:<arquivo>`, árvore limpa depois; mesmo conjunto de 3 arquivos de teste)
| Mutante | Resultado |
|---|---|
| `Recolhidos.tsx`: aviso sem a condição `recolhidos.size === 0` (B1) | morreu: `1 failed`, teste B1 |
| `Recolhidos.tsx`: `filter(() => true)` no lugar de `montados.has` (B2) | morreu: `3 failed` (B1 e dois B2) |
| `Recolhidos.tsx`: tira o `useEffect(registrar)` | morreu: `10 failed` |
| `CartaoMetrica.tsx`: tira o ramo `sem-dado-real` (M1) | morreu: teste M1 sem-dado-real |
| `CartaoMetrica.tsx`: tira o ramo `vazio` (M1) | morreu: teste M1 vazio |
| `CartaoMetrica.tsx`: tira o ramo `carregando` (M2) | morreu: teste M2 |
| `CartaoMetrica.tsx`: tira o sufixo "Atualizando..." (M2) | morreu: teste M2 |
| `CartaoDistribuicao.tsx`: sempre "projetos" (singular) | morreu: teste do singular |
| `CartaoMetrica.tsx`: tira `{calibrando && !semDadoReal && <SeloCalibracao />}` | **sobreviveu** (`38 passed`), ver A1 |

## Vermelho antes do verde
Os testes do L8b dependem de `montados`, `registrar` e `resumoDoRecolhido`, que a base `develop` não tem. A prova de que caem sem a regra são os oito mutantes mortos acima; não rodei a base em separado (`forge-testes --vermelho` é do Forge, não deste projeto).

## Achados
- A1 (recomendado) web/src/components/ui/recolhidos.test.tsx:1 · O selo de calibração recolhido (`CartaoMetrica.tsx` `{calibrando && !semDadoReal && <SeloCalibracao />}`) não tem teste: tirar a linha não derruba nada, embora o comentário do código o prometa visível recolhido (M1). Afirmar o selo no teste M1 com `calibrando`.
- A2 (recomendado) web/src/components/ui/CartaoMetrica.tsx:152 · B2 da UX e A1 do review: `useRecolhido` registra o código mesmo com `recolhivel={false}`; com `AP-KPIS` na memória o Restaurar aparece sem efeito visível. Já no cartão K-324; não bloqueia.
- A3 (recomendado) web/src/features/apontamento/components/CartaoDistribuicao.tsx:173 · A2 do review e B1 da UX: "N projetos" conta a linha sem projeto identificado; decisão do dono (R-DECISAO), já no K-324.
