---
pedido: 048-o-que-falta-em-mock
cartao: K-112 e K-130 (etapa E4.3, parte do E1.4)
branch: docs/048-t14-desenho (código de interface em 792489f)
head: f9c22a673bdfd4df7f0118a9c56a47395e677b2c
revisor: ux-designer
data: 2026-10-28
---

# Revisão de UX · T14 lendo a união por `oculto` (pedido 048)

Base: plano `docs/architecture/features/048-t14-mock.md` (§2), ficha da T14 e CA-27 a CA-34, CA-42 e CA-45 em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, `web/src/features/complementares/taticas.tsx` (linhas 531 a 708), `notas.ts` (T14) e o parecer de QA `docs/qa/048-t14-desenho.md`. Revisão por leitura do código e do parecer de QA (TT-11 a TT-13 e TT-20 a TT-23); a interface não foi executada no navegador por este revisor. Modelo de forma: `docs/ux/revisao-025-front-taticas.md`.

## Parecer: aprovado com ressalvas

Nenhum achado crítico nem alto. A tela cumpre T14-M1 = B e Q-T14-12 = B: o projeto oculto mostra só a fatia do meu time, sem total, sem "k de n", sem percentual, sem "outros times" e sem "Sem time informado", e vem depois dos visíveis (a ordem é do servidor, a tela não reordena). Nenhuma forma de nomear, ordenar ou comparar times ou pessoas. As ressalvas são de texto e de consistência com a ficha, nenhuma impede o PR.

## 1. Fidelidade às decisões

| Ponto | Onde na tela | Resultado |
|---|---|---|
| Oculto só com a fatia do meu time | linhas 612 a 618: "Meu time: k demanda(s)/frente(s)", singular com k = 1 | Cumpre T14-M1 = B |
| Sem "outros times", total, "k de n" ou percentual no oculto | mesmo trecho; tabela alternativa (659 a 667) traz "não exibido" em Outros times, Sem time informado e Participação | Cumpre |
| Sem "Sem time informado" no oculto | removido da linha e da barra (o oculto não tem barra) | Cumpre; ficha ainda diz o contrário (achado M-1) |
| Oculto depois dos visíveis, por código (Q-T14-12 = B) | a tela usa a ordem da API, sem `sort`; a legenda da tabela diz "projetos com outros times ocultos ao fim" | Cumpre (QA TT-22 e TT-11) |
| Total e base só dos visíveis (M-1a) | `leituraT14` lê `b.total`, que já vem sem ocultos; o exemplo de menor participação filtra `!p.oculto`; `semBase` só em "sem equipe" | Cumpre; o texto de leitura precisa de qualificação (M-2) |
| Aviso de que o total não inclui ocultos | `AvisoInfo` `t14-oculto`, só quando há oculto | Presente (M-2 e B-1 sobre onde e como) |
| Nenhum time ou pessoa nomeado, filtrado ou ordenado | selo, legenda de três itens, tabela de cinco colunas fixas; nenhum dado de pessoa na resposta (QA TT-21) | Cumpre |

Nota sobre o texto do estado oculto: dizer o motivo ("menos de 2 pessoas") revelaria o tamanho do time, então o texto atual, que só diz que a parte dos outros times não é mostrada, é o certo. Não acrescentar o motivo.

## 2. Achados

### Médio

**M-1 · Ficha e CA da T14 divergem da tela e da API.** Onde: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, ficha T14 (linha 239: "barra só com essa fatia e, se houver, 'Sem time informado'"; "o destaque e a ordenação por total seguem usando o total internamente") e CA-30, CA-45 e CA-27. Por quê: o código e o contrato novo não têm barra, `semTime` nem `total` no oculto, e a ordem do oculto é por código (Q-T14-12 = B); quem testar contra a ficha vê defeito onde não há. O plano §3 (UX, E4.3) já previa este ajuste (A2 do parecer 025). Correção: ajustar a ficha e o CA-45 ("só 'Meu time: k', sem barra, sem 'Sem time informado'"), o CA-30 ("visíveis pelo total, ocultos ao fim por código") e acrescentar um CA para o aviso de total sem ocultos. Edição de especificação, fora desta delegação; vai como cartão de UX.

**M-2 · A frase de leitura do cartão afirma um total sem dizer que ele deixa de fora os ocultos.** Onde: `leituraT14` (linhas 533 a 550), exibida no cabeçalho do cartão, longe do aviso `t14-oculto` (que fica dentro do corpo, abaixo do selo). Por quê: "61 de 173 demandas com time informado (35%) são do meu time" soa como o total da equipe; com projeto oculto ele é o total só dos visíveis. Quem lê só o destaque tira conclusão errada (heurística: visibilidade do status). Correção: quando houver oculto, acrescentar à frase "nos projetos com outros times exibidos" (sem o motivo), ou ligar o aviso ao destaque. Ressalva: se TODOS os projetos forem ocultos, `total.n` é 0, a leitura some e o aviso "O total não inclui..." fala de um total que não existe; nesse caso trocar por "Em todos os projetos só a parte do meu time é mostrada." (ver B-2).

**M-3 · A nota "Como se calcula" ainda diz que os projetos são ordenados pelo total.** Onde: `notas.ts` linha 305 ("Projetos ordenados pelo total de demandas."). Por quê: deixou de ser verdade para os ocultos, que vêm depois, por código (Q-T14-12 = B). A tabela já diz a regra certa, a nota e a tabela se contradizem (heurística: consistência). Correção: "Projetos ordenados pelo total de demandas; os que têm outros times ocultos vêm depois, por código." A dica de que a posição do oculto não informa o total já está no texto "ao fim".

### Baixo

**B-1 · A linha oculta não explica a si mesma.** Onde: linhas 612 a 618. Por quê: a linha mostra só "Meu time: 5 demandas", sem barra, e o único aviso é um parágrafo acima da lista; em lista longa ou para leitor de tela navegando por itens, a linha parece incompleta, e quem chega nela direto não recebe o aviso. A leitura por tecla de seta lê "BM-1 Título Meu time: 5 demandas", sem sinal de que o resto foi omitido de propósito (WCAG 1.3.1 e 3.3.2, informação de contexto). Correção: sufixo na própria linha, "Meu time: 5 demandas (parte dos outros times não exibida)", sem motivo e sem número. A tabela alternativa já diz "não exibido" por célula e está correta.

**B-2 · Estado "todos os projetos ocultos".** Onde: linhas 590 a 595 e `leituraT14`. Por quê: o QA provou o mock com no máximo 1 oculto por bloco; com todos ocultos, o cartão mostra só linhas "Meu time: k" sem destaque, o que é seguro, mas o aviso fala de "o total" inexistente. Correção: ver M-2. Pedir ao QA um caso na suíte de tela (dado construído, não do mock).

**B-3 · Contraste e foco a verificar no navegador.** Onde: `text-texto-2` da linha oculta sobre a superfície do cartão e do aviso (`bg-superficie-2`); aviso `AvisoInfo` é `<p>` sem papel de status, adequado por ser estático (não anuncia, e não precisa). Por quê: 4.5:1 para texto pequeno (WCAG 1.4.3); o axe passou (QA TT-17) mas a linha oculta só existe com dado oculto, e o QA não informa que o axe rodou nesse estado. Correção: rodar o axe com projeto oculto na tela (TT-11) ou registrar a verificação; nenhuma mudança de código esperada.

**B-4 · Rótulo "Meu time" repetido.** Onde: legenda e linha oculta. Por quê: só observação; o texto está claro, "sólido" na legenda não se aplica à linha oculta, que não tem barra, e ninguém confunde. Sem ação.

## 3. Acessibilidade (WCAG 2.2 AA), o que foi lido

- Rótulos: todo texto é escrito; a barra é `aria-hidden` e o texto equivalente vem logo depois; cor sempre acompanhada de hachura ou contorno (1.4.1). A linha oculta não usa cor.
- Lista semântica (`ul` e `li`), legenda com `aria-label`, tabela alternativa com cabeçalhos e legenda que descreve a ordem.
- Seletor Demandas/Frentes com anúncio ("Contando ...") e operável por teclado (herdado; QA TT-18).
- Leitor de tela na linha oculta: lê código, título e "Meu time: k demandas", sem total ou percentual, sem pista falsa de dado ausente. Falta só o sufixo de B-1.

## 4. Perguntas ao dono

Nenhuma. Os achados são de texto e de alinhamento com decisões já tomadas (T14-M1 = B e Q-T14-12 = B). O texto de B-1 não acrescenta regra nova: só nomeia a omissão que a decisão já determina.

## 5. Veredito

Aprovado com ressalvas. T14 cumpre T14-M1 = B e Q-T14-12 = B e não nomeia, ordena nem compara times ou pessoas. Pode seguir para o PR (E5.1). Pendências sem bloqueio: M-1 (alinhar a ficha, cartão de UX), M-2 e M-3 (texto, no front), B-1 e B-2 (texto e caso de teste), B-3 (verificação no navegador).
