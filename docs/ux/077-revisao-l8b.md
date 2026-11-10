# 077 · Revisão de interface do Lote 8b (tela da contagem parcial)

pedido: 077-tendencias-dado-real
branch: feature/077-l8b-tela-contagem-parcial
commit: aa137dd451a22454409ccd833ecd0d11925590a1
revisor: ux-designer, 2026-11-10
etapa: E2.6 (só o Lote 8b, P-077-5 = A)

## Veredito
Aprovado, com 3 achados baixos (nenhum bloqueia). Todos os itens de acessibilidade abaixo são `lido` (pelo código); nada foi `medido`, o QA mede com `@axe`.

## Conferido
- Número do mês marcado não aparece: `serieConcluidos` e `serieVolume` trocam o ponto inteiro por `contagemIncompleta` (valor `null`, n `null`, texto sem número); o `concluidos`/`volume` do contrato não é lido nesse ramo. Gráfico (barra sem valor), tabela ("—" em valor e base), `figcaption` (usa `p.texto`), lista de sem-valor e frase (`Em julho: <texto>`) só trazem o texto do motivo (lido).
- Motivo no padrão do 4a: rótulo "histórico incompleto" no eixo (`motivo`), linha "○ jul/2026 · Histórico incompleto..." na lista `-sem-valor`, situação "não publicado · histórico incompleto" na tabela (lido; CA-14).
- Texto por leitor de tela: `figcaption.sr-only`, lista e tabela são texto estático; o "○" é `aria-hidden`; nada depende de cor ou hover (lido; WCAG 1.4.1).
- Meses sem a marca não mudam: ramo antigo idêntico; teste "sem nenhum mês marcado a série não muda" cobre (lido).
- A série de SLA do mesmo mês não herda a marca (teste cobre); fluxo e sustentação seguem separados.

## Achados
- (baixo) Lista de sem-valor usa o texto longo do ponto ("o histórico carregado começa em ..., depois do início do mês"); a janela incompleta usa forma curta na lista. Inconsistência leve com a seção 6; unificar em "Histórico incompleto: o histórico começa em {data}. Contagem não publicada."
- (baixo) Todos os meses marcados em série de barras: não há texto de vazio (CA-7 vale só para linha); sai gráfico sem barras, com motivo no eixo e na lista. Entendível, mas um vazio próprio seria mais claro.
- (baixo) O subtítulo não ganha frase fixa para o mês de contagem parcial (CA-6 cobre só a janela incompleta); o motivo fica só no eixo e na lista. Sugerir à próxima revisão da spec; não é defeito do lote.

## Observações
- O contrato ainda traz o número do mês marcado (a tela só o omite); se a P-077-5 pedir omissão na API, é do back-end (8a), fora desta revisão.
- Rótulo do eixo em 11px (`TickMes`) já existia no 4a; contraste e tamanho ficam para a medição do QA.
