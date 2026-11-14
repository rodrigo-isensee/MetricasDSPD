# Revisão de UX do 097, lote L1 (busca digitando nos filtros de lista)

Revisor: ux-designer. Código: branch `feature/097-l1-busca`, worktree `/home/rodrigoisensee/MetricasDSPD-052c` (só leitura), arquivos `web/src/features/filtros/FiltroMulti.tsx` e `BarraFiltros.tsx`. Referência: `docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16) e `docs/ux/prototipos/097-filtros.html`.

Método: `lido` = pelo código e pelos nomes dos testes em `filtros-componentes.test.tsx` (linhas 425 a 560, um teste por CA-10 a CA-16). Nada foi executado nem medido; contraste, leitor de tela e teclado real ficam para o QA (`@axe`). Estado das especificações: o protótipo ainda está "aguardando o usuário"; os CA-10 a CA-16 são hipótese de especificação até o dono validar.

## Veredito: aprovado com ressalvas
Os CA-10 a CA-16 estão atendidos. Nenhum achado crítico ou alto. Há 2 médios e 6 baixos, nenhum bloqueia o PR do L1; os médios merecem decisão do dono ou do tech-lead antes da validação manual.

## Aderência aos critérios (lido)
| CA | Resultado | Onde |
|---|---|---|
| CA-10 campo "Buscar", rótulo visível, foco ao abrir | Atende (popover). Na folha o foco não é controlado, ver A1 | FiltroMulti.tsx:138-152, 294-297 |
| CA-11 filtra sem acento/maiúscula, em qualquer parte do nome; contagem em `aria-live="polite"` | Atende; a contagem não traz "de N" (A3) | FiltroMulti.tsx:35-37, 95-105, 154-156 |
| CA-12 "Nenhuma opção com “x”." e anúncio "Nenhuma opção encontrada." | Atende | FiltroMulti.tsx:103-104, 162-164 |
| CA-13 seleção fora da busca continua e é contada | Atende; a frase não é anunciada (A4) | FiltroMulti.tsx:97-100, 157-161 |
| CA-14 teclado: seta baixo para a lista, setas, Espaço, Enter com 1 opção, Esc em duas etapas | Atende | FiltroMulti.tsx:43-47, 109-133, 298-301; BarraFiltros.tsx:212-215 |
| CA-15 fechar zera o texto; fora da URL | Atende (estado local, zerado em `onOpenChange`) | FiltroMulti.tsx:206, 272-276 |
| CA-16 mesma busca na folha mobile | Atende (`variante="lista"` reusa `Lista`) | FiltroMulti.tsx:249-267; BarraFiltros.tsx:221 |

Nome acessível: o rótulo visível "Buscar" mais o trecho `sr-only` "em {rótulo}" produz "Buscar em Equipe", que começa com o texto visível (WCAG 2.5.3 atendido, `lido`), e há `legend` `sr-only` no grupo. O teste A4 (linha 346) cobre nomes distintos na folha. Alvo do campo e dos itens usa `.alvo` (24 px, 44 px em tela estreita; `tokens.css:134-141`), `lido`. Sem jargão nos textos novos.

## Achados

### A1. Médio: abertura da folha mobile foca o primeiro campo de busca e abre o teclado virtual
- Onde: `web/src/features/filtros/BarraFiltros.tsx:209-216` (`Dialog.Content` sem `onOpenAutoFocus`) com o campo em `FiltroMulti.tsx:141-152`.
- Por quê: o Radix foca o primeiro elemento focável, que agora é o campo Buscar do primeiro filtro. Em celular isso abre o teclado e cobre a folha (altura 90dvh) antes de a pessoa escolher o filtro. O CA-16 pede "mesmas regras" da CA-10 mas o foco automático faz sentido no popover (um filtro só) e não na folha (vários filtros). Heurística: controle e liberdade, design minimalista. Não foi medido em aparelho.
- Correção: na folha, focar o título ou o contêiner (`onOpenAutoFocus` com `preventDefault` e foco em `Dialog.Content`) e deixar a busca focar só por toque. Se o dono preferir o foco na busca, registrar a decisão no CA-16.

### A2. Médio: o `Popover.Content` (role dialog) segue sem nome acessível próprio
- Onde: `FiltroMulti.tsx:291-303` (botão tem `aria-haspopup="dialog"`).
- Por quê: ao abrir, leitores de tela anunciam "caixa de diálogo" sem nome; o foco cai direto no campo e o contexto vem só do rótulo "Buscar em Equipe". Pré-existente, mas a busca torna a abertura mais ruidosa. `lido`; o QA mede com leitor de tela.
- Correção: `aria-label={rotulo}` no `Popover.Content`.

### A3. Baixo: contagem sem o total e sem o aviso de "N opções" em listas longas
- Onde: `FiltroMulti.tsx:101-105`, microcopy da especificação ("3 opções encontradas de 60.", "N opções" sob o campo com mais de 12 opções).
- Por quê: o "de 60" dá a escala do filtro; hoje a pessoa só ouve o número filtrado. Não é exigido por CA-10 a CA-16, é da microcopy.
- Correção: `${n} ${…} de ${opcoes.length}.` e, sem busca, "N opções" quando `opcoes.length > 12`.

### A4. Baixo: a frase "selecionadas fora da busca" não é anunciada
- Onde: `FiltroMulti.tsx:157-161` (fora da região `aria-live` da linha 154).
- Por quê: quem usa leitor de tela é informado da contagem de resultados, mas não de que há marcações escondidas (o CA-13 fala em "informar", e a especificação previa a frase junto ao anúncio). `lido`.
- Correção: incluir a frase no texto de `anuncio` ou envolvê-la em `role="status"`. O texto atual, "mantida", difere de "(continua aplicada)" da especificação; escolher um e alinhar a microcopy.

### A5. Baixo: Enter com uma opção alterna (marca ou desmarca) sem aviso
- Onde: `FiltroMulti.tsx:117-122`.
- Por quê: a especificação diz "a marca"; o código inverte o estado. Se a opção única já estava marcada, o Enter a desmarca sem texto de retorno além do botão do filtro. Aceitável, mas imprevisível.
- Correção: manter a alternância e anunciar "Marcada: X." ou "Desmarcada: X.", ou só marcar (nunca desmarcar) e ajustar o CA-14.

### A6. Baixo: o Esc se comporta de modo diferente no popover e na folha
- Onde: `FiltroMulti.tsx:298-301` (popover limpa o texto com o foco em qualquer ponto) e `BarraFiltros.tsx:212-215` com `FiltroMulti.tsx:53-59` (folha só limpa se o foco está na lista com texto).
- Por quê: no popover, Esc em "Fechar" com texto na busca limpa o texto em vez de fechar; na folha fecha. Decisão consciente (testes S1, S2), mas é inconsistência de padrão. Só afeta quem tem texto digitado e foco nos botões do rodapé.
- Correção: aceitar e documentar; ou alinhar o popover para limpar só com o foco dentro do `fieldset`.

### A7. Baixo: o botão do rodapé diz "Limpar", a especificação diz "Limpar seleção"
- Onde: `FiltroMulti.tsx:315-323`.
- Por quê: com o campo Buscar no mesmo painel, "Limpar" pode ser lido como "limpar a busca". O comportamento está certo (limpa a seleção e mantém o texto), mas o rótulo é ambíguo.
- Correção: "Limpar seleção" (microcopy da especificação).

### A8. Baixo: sem texto de ajuda e sem como limpar o campo senão pelo Esc
- Onde: `FiltroMulti.tsx:141-152`.
- Por quê: a especificação previa "Digite para buscar" e não há botão "x" no campo; no celular, quem não tem Esc precisa apagar à mão (reconhecer em vez de lembrar). Sem estado vazio quando a lista de opções chega vazia: o campo aparece e a mensagem "Nenhuma opção encontrada." sai ao digitar (escopo de E4, CA-20, fora do L1).
- Correção: `placeholder` ou `aria-describedby` com "Digite para buscar" e, se o dono aprovar, um botão "Limpar busca" (alvo 24 px) visível com texto no campo.

## Fora do L1 (anotado, sem achado)
- O rótulo ainda é "Equipe" e o Tipo ainda usa a lista fixa `TIPOS_FILTRO` (`BarraFiltros.tsx:27`): são Q-2 e E4, de outros lotes.
- Aviso consolidado continua "N equipes" (`BarraFiltros.tsx:247`), igual ao CA-4 só após Q-2.

## Para o QA medir (`@axe` e leitor de tela)
Foco inicial e devolução ao botão no popover e na folha; anúncio da contagem e do "Nenhuma opção encontrada."; contraste 4,5:1 do rótulo `text-texto-2` e do texto da frase "fora da busca"; alvos de 24 px na largura 640 px; ausência de rolagem horizontal com nomes longos.
