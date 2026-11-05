---
pedido: 069-lacunas-alta
commit: db7a8e19966d1d46963d81d01fa25465c0f56498
etapa: E1.7
revisor: ux-designer
veredito: aprovado com ressalvas (3 achados médios/baixos; nenhum bloqueia o merge, o texto final entra por ajuste do react-frontend)
---

# Revisão de interface: aviso de coleta parcial (069, lote M1-a)

Escopo: `FrescorEPeriodo` em `web/src/features/apontamento/components/CabecalhoApontamento.tsx` e os casos do aviso em `apontamento.test.tsx`, contra `docs/ux/059-aba-apontamento.md` (cabeçalho: selo, período, nada de dado velho escondido) e `059-aba-apontamento-textos.md`. Revisão por leitura de código; não rodei a tela no navegador nem leitor de tela (sem Bash), então contraste e leitura por leitor de tela estão avaliados pelo código e pelos tokens.

## O que está conforme

- Posição: o aviso fica logo depois do selo de frescor e antes do período, na mesma linha com quebra (`flex-wrap`), como o aviso de defasado que já existe. Coerente com a especificação (selo e aviso de dado velho no cabeçalho).
- Ícone mais texto: `Icone nome="alerta"` com texto; não depende só de cor (WCAG 1.4.1). O ícone é `aria-hidden` por padrão, então o leitor de tela lê só o texto, sem ruído.
- Contraste: `text-atencao` no claro é `#8a5a00`, cerca de 5,9:1 sobre branco (4,5:1 exigido); no escuro é `#e0b040`, alto sobre fundo escuro. Mesmo token do aviso de defasado e do selo "Atrasado". Conferir no navegador se o fundo da página é `superficie` e não `superficie-2` (a diferença não deve derrubar o 4,5:1).
- Regra de exibição: só aparece quando a parcial é mais nova que a última ok, ou não há ok; "falha", "ok", null e campo ausente não mostram. Cobre os casos do desenho e os testes os exercitam (6 casos).
- Hora: o servidor devolve `fim` em ISO local (-03:00), então `fmtDataHoraCurta` (que fatia a string) mostra a hora de Brasília corretamente.
- Texto não culpa a pessoa e não afirma número; honesto sobre a incerteza.

## Achados

1. **Médio, texto.** `CabecalhoApontamento.tsx:42-43`. "Última coleta parcial em 31/10 07:05: o período pode estar incompleto" lê "31/10 07:05" sem ligação entre data e hora ("trinta e um barra dez zero sete zero cinco") e "o período" é ambíguo ao lado de "Dados de X a Y". Correção para o react-frontend: texto final **"Última coleta parcial em 31/10 às 07:05: alguns apontamentos podem estar faltando."** (formato `dd/mm às hh:mm` só neste aviso, sem mudar `fmtDataHoraCurta` usada em outros lugares; ajustar o teste na linha 151 para o texto novo).
2. **Baixo, leitor de tela.** `CabecalhoApontamento.tsx:41`. O aviso é um `span` sem papel nem região; quem navega por leitor lê no fluxo, o que basta (estado estático do carregamento da aba, igual ao `aviso-defasado`). Se o aviso mudar com o filtro sem recarregar a página, não é anunciado; hoje a resposta da aba troca todo o conjunto e a região viva da página (`ApontamentoPage.tsx:141`) já anuncia o carregamento. Sem ação agora; reavaliar só se o cabeçalho passar a atualizar sozinho.
3. **Baixo, quando o selo é "Atual".** Selo "Atual" com ícone de check, seguido de aviso de parcial, pode soar contraditório (a última ok é recente, mas a coleta posterior ficou parcial). O texto do achado 1 já resolve ao dizer "última coleta parcial" explicitamente; não mexer no selo (a regra é do desenho: parcial não conta como ok). Sem ação além do achado 1.

## Texto final fechado

- Aviso: "Última coleta parcial em {dd/mm} às {hh:mm}: alguns apontamentos podem estar faltando."
- Difere do provisório ("... {dd/mm hh:mm}: o período pode estar incompleto."), portanto o achado 1 é a mudança pedida ao react-frontend.
- Atualizar também `docs/ux/059-aba-apontamento-textos.md` (tabela de textos do cabeçalho) com a linha acima, a cargo de quem fizer o ajuste de texto, para a especificação continuar sendo a fonte.

## Rastreabilidade

Sem mudança em critérios de aceite da 059 (CA-1 do cabeçalho continua válido). O aviso novo é aditivo; critério sugerido para a especificação: "QUANDO a última coleta do apontamento terminou parcial e é mais nova que a última ok (ou não há ok) O SISTEMA DEVE mostrar, ao lado do selo, ícone e o texto do aviso com data e hora da coleta." Já coberto pelos testes 'parcial mais nova...' e 'sem aviso: ...'.
