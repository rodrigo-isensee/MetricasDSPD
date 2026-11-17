# Revisão de UX: espaço da nota do cartão vazio (K-400, E7.470)

parecer: aprovado com ressalva (1 achado baixo). Head 5bdb0a25. Lido pelo código; nada medido (sem navegador nem axe aqui). A suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

## O que foi conferido (lido)
- `CartaoMetrica.tsx:395`: `{p.complementoVazio && <div className="mt-2">{p.complementoVazio}</div>}`, dentro do estado vazio, logo após `EstadoVazio`. O espaço de 8px (múltiplo de 4) agora vem de um só lugar.
- Produtores sem margem própria: `NotaForaDoFluxo` (S5, S6, S7, S11), `notaForaDaMatriz` (S1), `Leia` (E6), `AvisoInfo` (O19), S8 (`sustentacao.tsx:96`) e T9 (`CartaoT9.tsx:46`) usam só `text-sm`/`text-texto-2`. Nenhum `mt-2` residual nas notas. Espaço igual em todos os cartões vazios com nota: confirmado pelo código.
- Só espaçamento; sem mudança de texto, cor, foco ou semântica. WCAG 2.2 AA: sem impacto (lido).

## Achados
### Baixo: S11 gera div com margem vazia quando não há nota
- Onde: `sustentacao.tsx:286-288` passa sempre um elemento `<NotaForaDoFluxo>`; o componente devolve `null` quando `n <= 0`, mas o elemento React é truthy. Em `CartaoMetrica.tsx:395` o `&&` não o filtra e renderiza `<div class="mt-2">` vazio: 8px a mais abaixo do estado vazio do S11 quando `semFluxo` é 0. É o oposto do objetivo (mesmo espaço), embora pequeno e invisível (sem texto).
- Contraste: S5, S6, S7 (ternário) e S8, E6, O19 (`false`/`null`) não sofrem disso.
- Correção: em S11, `complementoVazio={(r) => r.semFluxo > 0 ? <NotaForaDoFluxo .../> : null}` (como o S5), ou o cartão só renderizar o div quando o conteúdo existir. Não bloqueia a entrega.

## Provas do autor
PQ do autor (pronto rc=0) citado como informado no brief; não reexecutado aqui.
