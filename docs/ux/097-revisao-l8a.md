# Revisão de UX do L8a (pedido 097, E5): Recolher, Expandir e Restaurar

Etapa E3.5. Branch `feature/097-l8a-recolher`, head `78c80ecee71ea6361578bf97e9d53015bfe132b3`. Base: QA (ce0f0648) e review (d74df87c) aprovados.

Método: leitura de `web/src/components/ui/CartaoMetrica.tsx`, `Recolhidos.tsx`, `recolhidos.test.tsx` e `styles/tokens.css` (worktree 052d). Itens de acessibilidade marcados `lido` (pelo código); nada foi `medido` (sem ferramenta rodada aqui; o `@axe` é do QA).
Limite da revisão: a especificação (`docs/ux/097-filtros-time-busca.md` na branch `docs/097-ux-recolher-setor`) só é legível por `git show`, que não está disponível a este papel. Conferi os CA-25 a CA-32 pelo que o plano (`docs/analises/097-plano-e5-e7.md`, seções do L8a e R6) e os nomes dos testes citam. Se algum texto literal da spec diferir, o achado é do texto da spec, não deste parecer.

## Veredito

**Aprovado com ressalvas.** Nenhum achado crítico ou alto. Dois achados médios (M1, M2) e três baixos. O R6 (Recolher e Ocultar lado a lado) **não se materializa**: não há achado médio ou maior sobre os dois botões. M1 e M2 podem entrar como cartão de ajuste depois do L8a, sem bloquear o merge, a critério do dono (R-DECISAO).

## Conferências pedidas

| Item | Resultado | Base |
|---|---|---|
| Texto visível distinto de Ocultar | Conforme. "Recolher"/"Expandir" com chevron e borda de botão; "Ocultar" é texto sublinhado, sem borda | `lido`: CartaoMetrica.tsx 241-265 |
| Alvo de 24 px | Conforme. Classe `alvo`: mínimo 1,5 rem (24 px) e 2,75 rem (44 px) abaixo de 48 rem | `lido`: tokens.css 134-143 |
| Estado anunciado | Conforme. `aria-expanded`, `aria-controls` ao corpo (que existe nos dois estados) e nome acessível "Recolher cartão: título", que começa pelo texto visível (WCAG 2.5.3) | `lido`: linhas 252-264; teste CA-25 |
| Foco no próprio botão ao alternar | Conforme. O botão não é remontado | `lido`; teste CA-28 |
| O que some e o que fica | Ficam código, título (foco programático mantido), botão e resumo. Somem Como ler, ações, tabela, selos, nota, pergunta, notas fixas, estados, corpo e rodapé | `lido`: linhas 226-234, 269-293, 297-300, 393 |
| Resumo neutro | Conforme ao CA-32: `Recolhido. {n} {unidade}.` ou `resumoRecolhido`; nunca usa `leitura` (que pode citar pessoa); teste com "Ana fez 40 h" prova | `lido`; teste CA-32 |
| Restaurar: anúncio | Parcial, ver B1 | `lido`: Recolhidos.tsx 103-119 |
| Restaurar: foco | Conforme. Vai ao primeiro `[data-cartao-titulo]` (h3 com `tabIndex=-1`, presente nos dois estados, então o foco não se perde); o botão some e o foco não cai no `body` | `lido`; teste CA-30 |
| Cobertura de testes | CA-25 a CA-32, memória corrompida, teto e armazenamento indisponível cobertos. Sem teste de alvo de 24 px nem de contraste | `lido` |

## R6: Recolher e Ocultar lado a lado

Mitigado. As duas ações diferem em forma (botão com borda e chevron × link sublinhado), em texto e em nome acessível ("Ocultar esta métrica O3" × "Recolher cartão: título"), e o Recolher vem por último, longe do Como ler. O que cada uma faz continua só implícito (Ocultar tira a métrica do painel; Recolher guarda o corpo). Se o dono relatar confusão na homologação, a saída é uma dica curta no Ocultar, sem mudar o layout.

## Achados

### Médio

**M1. Recolhido, o cartão esconde o estado "sem dado real" e a origem da métrica** (Nielsen: visibilidade do status; regra do pedido 099, nenhuma métrica simulada sem aviso). Ocorre em `CartaoMetrica.tsx` 160-164 e 269-284. O resumo trata só o erro. Nos estados `sem-dado-real` e `vazio`, o cartão recolhido diz "Recolhido." (com a base, se houver), e `SeloOrigem`, `SeloCalibracao` e o selo de base insuficiente somem. A pessoa lê um cartão calmo onde o expandido diria "sem dado real" ou "em calibração". Correção: no resumo, tratar os dois estados ("Recolhido. Sem dado real nesta fonte.", "Recolhido. Sem dados no período."), manter `SeloOrigem` e o selo de calibração visíveis quando recolhido (são curtos), e cobrir com teste dos dois estados.

**M2. Os dois estados, `carregando` e `atualizando`, recolhidos não têm sinal** (Nielsen: visibilidade do status). Recolhido durante o carregamento mostra "Recolhido.", sem indicar que a base ainda chega, e o `aria-busy` segue no cartão sem texto equivalente. Correção: usar "Recolhido. Carregando..." no resumo quando `estado` for `carregando`; o `aria-busy` já cobre o leitor de tela.

### Baixo

**B1. O anúncio "Cartões restaurados." não repete na segunda vez.** `RestaurarRecolhidos` guarda o aviso em estado e nunca o limpa; a segunda restauração grava o mesmo texto, o DOM não muda e a região `role="status"` não anuncia. Em paralelo, o foco programático no título disputa a fala com o anúncio. Correção: limpar o aviso quando algum cartão for recolhido de novo (ou alternar um sufixo invisível), e conferir com o leitor de tela real no QA.

**B2. O Restaurar pode aparecer sem nada visivelmente recolhido.** A memória guarda códigos de cartões que a tela não mostra (cartão ocultado por "Ocultar", código que saiu do painel). O botão surge, e a pessoa não vê o que restaurar. Correção: contar só os códigos dos cartões renderizados, ou aceitar e registrar. Raro, sem dano.

**B3. Nome acessível e estado dizem a mesma coisa duas vezes.** `aria-label` troca entre Recolher/Expandir e o `aria-expanded` também muda; alguns leitores falam "Expandir cartão, recolhido", que é legível, só redundante. É o que a spec pede (CA-25); sem ação, anotado para o QA ouvir uma vez.

## Acessibilidade (WCAG 2.2 AA), resumo

- 2.1.1 Teclado, 2.4.3 Ordem do foco, 2.4.7 Foco visível, 4.1.2 Nome, função e valor: `lido`, conforme (botão nativo; foco preservado).
- 2.5.8 Tamanho do alvo (24 px): `lido`, conforme.
- 2.5.3 Rótulo no nome: `lido`, conforme.
- 1.4.1 Cor não é o único sinal: `lido`, conforme (texto e chevron; o chevron é decorativo, e a direção segue o texto).
- 1.4.3 / 1.4.11 Contraste: `lido`, usa os tokens `text-texto` e `border-borda-controle` do sistema; não medido. O QA mede.
- 2.3.3 Movimento: o chevron só gira, sem animação.
- 4.1.3 Mensagens de status: parcial (B1).

## O que não deve mudar

O resumo nunca traz número por pessoa, equipe ou setor (CA-32); a memória guarda só códigos de cartão (CA-29); o foco volta ao mesmo botão ao alternar (CA-28).
