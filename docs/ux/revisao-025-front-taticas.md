---
pedido: 025-front-do-011-lote2
cartao: K-110 (etapa E1.6)
branch: feature/025-front-taticas (código de interface em 5108fcd; head 1062b91)
revisor: ux-designer
data: 2026-10-22
---

# Revisão de UX · front do lote 2 do pedido 011 (Tático: T10, T11, T12, T13, T14)

Base: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3, fichas T10 a T14 em §5, CA-27 a CA-34, CA-42, CA-45, CA-51, §11), `web/src/features/complementares/taticas.tsx`, `CartaoComplementar.tsx`, `notas.ts` e o parecer de QA `docs/qa/025-front-taticas.md`. Revisão por leitura do código e do parecer de QA (que provou por E2E, mutação e controle positivo o que aparece na tela); a interface não foi executada no navegador por este revisor.

## Parecer: aprovado com ressalvas

Nenhum achado bloqueante. As decisões do dono estão cumpridas na tela: R-1 = B, T14-M1 = B, B11-001 e a regra de n < 20. Nenhum cartão nomeia, ordena ou compara times ou pessoas. Os achados abaixo são recomendados ou baixos e não impedem o PR.

## 1. Fidelidade à ficha

| Cartão | Texto | Estados (sem dado, amostra < 20, oculto) | Hierarquia | Resultado |
|---|---|---|---|---|
| T10 | Leitura, "Prazo contratado não informado" e nota batem com a ficha | Sem fornecedor: aviso próprio e "Prazo contratado não informado". Fornecedor com < 20 bloqueios: "— amostra insuficiente", só contagem e soma. Oculto: n/a | Tabela por fornecedor com barra até o P85 e marca no P50; sem coluna de prazo contratado nem "dentro/acima" | Fiel (T10-1) |
| T11 | Leitura é a média mensal de referência; a ficha pede também o destaque de meses repetidos | Sem dado no mês: "—" com rótulo falado. Histórico curto: nota exata da ficha. Censo, sem percentil. Oculto: n/a | Seletor de tipo, depois o mapa mês × ano com número escrito e mês corrente listrado "em andamento" | Fiel, com 1 desvio aceito (T11-1) |
| T12 | Leitura e nota "Não é nota da área" batem | n < 20 por área: "k de n com ida e volta (percentual não publicado, menos de 20)" e a barra não aparece. Total < 20 usa "k de n" | Áreas por volume (ordem da API), barra sólido × hachura, "k de n" e percentual escritos | Fiel |
| T13 | Leitura, destaque e comparação batem; "outro quadro" não é identificado | Entregas < 20: "k de n entregas ... (percentual não publicado, menos de 20)". Par com grupo < 20: aviso nomeando o grupo abaixo. Sem tipo: aviso. Frentes: base com o n das frentes (L2T-001 corrigido) | Seletor Demandas/Frentes (uma por vez), destaque, par P50/P85 com × sem por tipo | Fiel (T13-1) |
| T14 | Selo, nota e legenda de três itens exatos | Sem equipe (ou várias): "Escolha uma equipe ...". Sem projeto: aviso. n < 20: "k de n meu time (percentual não publicado, menos de 20)", com barra. Oculto: ver seção 2 | Selo, legenda, uma linha por projeto na ordem do total (da API), tabela de cinco colunas fixas | Fiel (T14-1) |

## 2. Verificações pedidas

**E2 · "Outros times" some com menos de 2 pessoas.** Confirmado. O código decide só por `outrosTimes === null` (a API sinaliza que os outros times somam menos de 2 pessoas, Q-T14-10 = B); nesse caso a linha troca a barra e o rótulo "k de n" por uma linha de texto, e a tabela alternativa mostra "não exibido" em "Outros times", "Sem time informado" e "Participação". A prova de QA (TT-11, TT-12) mutou o detector e viu as duas falharem, e o controle positivo TT-13 mostra "1 de 73" com a barra quando a API publica. Cobre demandas e frentes.

**E3 · Oculto, sem o total exato do projeto.** Confirmado. Com algum projeto oculto: (a) a linha mostra só "Meu time: k demandas/frentes" (singular com k = 1, L2T-002 corrigido); (b) a frase de leitura e o destaque não são escritos (`leituraT14` retorna `undefined` se qualquer projeto estiver oculto, porque a soma revelaria o total); (c) o `n` da base do cartão é suprimido (`semBase`), em qualquer granularidade, para n − k não ser calculável; (d) a nota "Em alguns projetos só a parte do meu time é mostrada; a dos outros times não é exibida" explica a ausência (heurística: visibilidade do status). Não encontrei no texto, na tabela ou no rótulo de acessibilidade nenhum total, "k de n" ou percentual do projeto oculto.

**E4 · T10 mostra o nome como vem da API.** Confirmado. `f.fornecedor` é impresso sem `trim`, `toLowerCase` ou formatação; a normalização (B11-001) e a ordem alfabética são do back. O QA provou por mutação (três grafias viram uma linha só). A nota do cartão diz que maiúsculas, minúsculas e espaços não separam o mesmo nome.

## 3. Achados

Severidade: bloqueante, recomendado, baixo. Nenhum bloqueante.

### Recomendado

**T14-1 · Projeto oculto não mostra "Sem time informado" nem a barra da fatia.** Onde: `taticas.tsx` linhas 617 a 624 e a ficha (§5 T14, "barra só com essa fatia e, se houver, 'Sem time informado'"; CA-45 pede só "a fatia do meu time"). Por quê: o código mostra apenas "Meu time: k"; a ficha prevê a fatia em barra e a contagem sem time informado (que não revela o total, pois não inclui os outros times). Mostrar menos é o lado seguro e o QA validou (TT-11: "sem barra"), então não é bloqueante, mas a especificação e a tela divergem. Correção: ou o dono aceita a tela como está e a ficha é ajustada ("só o texto da fatia"), ou se acrescenta a barra só com a fatia e "· k sem time informado" (cuidado: a barra só pode usar `meuTime.k` e `semTime`, nunca `total`). Recomendo ajustar a ficha (menos superfície de reidentificação), o que depende de decisão do dono (R-DECISAO).

Resolvido em 2026-10-23: T14-1 = A, ficha ajustada (K-139)

**T14-2 · Posição na ordem revela uma faixa do total do projeto oculto.** Onde: `comoSeCalcula` da nota ("Projetos ordenados pelo total de demandas") e a ordem da lista. Por quê: o projeto oculto fica entre dois projetos visíveis com total exibido, então o leitor deduz que seu total está entre os dois. A ficha aceita ("posicionado sem mostrar o total", CA-30), então é risco residual conhecido e não defeito. Correção possível, se o dono quiser fechar: colocar os projetos ocultos no fim da lista. Fica como registro para o parecer de segurança; não alterei nada.

### Baixo

**T10-1 · Barra do P50/P85 depende de posição e tamanho.** Onde: linhas 103 a 120. A barra é `aria-hidden` e o texto "P50 x · P85 y dias úteis" ao lado carrega a informação, então não depende só de visual e está correto; a marca do P50 é uma linha de 2 px sem rótulo, em contraste 3:1 só se `--texto` sobre `--serie-1` o garantir. Verificar no navegador (axe AA passou segundo o QA, TT-17). Sem ação.

**T11-1 · Leitura sem a frase de repetição sazonal.** Onde: linha 170. A ficha dá o exemplo "Janeiro e julho trazem, nos dois anos, 30% a mais ...". O código escreve a média mensal e "O mapa mostra todos os meses", sem apontar meses. É uma escolha segura (a ficha diz que a média "nunca aparece sozinha"; aqui o mapa está logo abaixo) e foi o que o contrato `T11` entrega. Aceito; se o dono quiser a frase, é uma entrega nova com regra para "mais que a média" (decisão de produto, não inferir).

**T13-1 · Destaque diz "entregas" também em Frentes.** Onde: linhas 474 a 478. A leitura do cabeçalho usa "frentes" e o destaque usa "entregas" nos dois modos; com "Frentes" selecionado, "31 de 88 entregas" soa ambíguo. Correção: usar `SUBSTANTIVO_GRAN[gran]` ("frentes entregues") no destaque, como a leitura já faz. Cosmético.

**T14-3 · "Meu time" no singular do rótulo do selo de acessibilidade.** Onde: linhas 601 a 605. A legenda distingue as três partes por "sólido", "hachura" e "contorno" além da cor, como pede a WCAG 1.4.1; está correto. Só observação: o contorno de 1 px em `--texto-2` do "Sem time informado" é a marca mais fraca; verificar o contraste de 3:1 no navegador.

**Geral · Link para o O19.** A ficha do T10 e a do T13 pedem "Leia junto" com o O19, que é do lote 3 (pedido 026); já registrado no review e no QA. Fecha no lote 3.

## 4. Regras transversais (§3)

- Nenhuma nomeia, ordena ou compara pessoas ou times (item 8): T14 mostra só "meu time", "outros somados" e "sem time"; tabela de colunas fixas. Cumprido.
- Ordenação neutra (item 9): T10 alfabético, T12 por volume, T14 por total do projeto; sem pódio. Cumprido.
- Mínimo de 20 (item 6) e percentual só com n ≥ 20: T10, T12, T13, T14 cumprem; contagens publicadas como censo. Cumprido.
- Uma granularidade por vez (item 5): T13 e T14 com seletor local, nunca juntas. Cumprido.
- Fonte única BusinessMap, sem alertas, sem meta: nota, selo fictício só no T13 e no T14 (QA TT-02). Cumprido.

## 5. Microcopy e acessibilidade (WCAG 2.2 AA)

- Português claro, sem culpar; "Escolha uma equipe para ver a participação do meu time" diz o que fazer. Plurais corrigidos (L2T-002) e base coerente em Frentes (L2T-001).
- Barras com cor mais padrão (sólido, hachura, contorno) e texto equivalente; tabela alternativa em T10, T12, T13 e T14; no T11 o próprio mapa é tabela com cabeçalhos e região rolável com nome e `tabIndex`. Seletores operáveis por teclado (QA TT-18).
- Estados de vazio e aviso com ícone e texto, não só cor. Axe AA e reflow a 360 px passaram (QA TT-17 e TT-19).
- A verificar no navegador (não executado aqui): foco visível no mapa do T11, contraste do contorno do T14 e da marca do P50 do T10.

## 6. Veredito

Aprovado com ressalvas: T10 a T14 estão fiéis às fichas nos textos, estados e hierarquia; E2, E3 e E4 confirmados. Pode seguir para o PR (E1.7). Pendências sem bloqueio: T14-1 (alinhar ficha e tela, decisão do dono), T14-2 (registro de risco residual aceito pela ficha), T13-1 (cosmético, opcional) e os itens "a verificar no navegador". L2T-003 (CLS herdado) fica fora desta revisão, como pendência do PR.
