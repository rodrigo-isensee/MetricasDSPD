# Revisão de UX do D2 (S5, S6 e S7): pedido 105, etapa E6.7

parecer: aprovado com ajustes

Escopo: `web/src/features/sustentacao` (`comuns.tsx`, `notas.ts`, `CartaoMotivos.tsx`, `CartaoS5/S6/S7.tsx`) e os dois textos de nota em `packages/contratos/src/origem.ts`. Li os arquivos como estão na worktree `/home/rodrigoisensee/MetricasDSPD-056`. Não consegui rodar `git rev-parse` nesta sessão (sem shell), então não confirmei que o head é `7b4ddb00`; o brief pede revisão do `03ad3399`. Se o head for outro, confira se os trechos abaixo mudaram.

Todos os itens de acessibilidade abaixo são `lido` (pelo código). Nenhum foi `medido`: contraste e leitor de tela ficam para o QA (`@axe`).

## O que está bom
- A linha `NotaForaDoFluxo` fica logo acima do gráfico, tem ícone e texto (não depende de cor) e some quando o número é zero. Isso evita ruído. A posição é a certa: a pessoa lê o aviso antes de ler os números.
- O "Não informado" fica separado do "Outro" no S5 e no S6, como o dono decidiu. O texto de "Como se calcula" diz isso.
- As duas notas de cartão (`s5-risco-sla-sem-fonte` e `s7-nao-igual-vazio`) dizem o que não se sabe, sem culpar ninguém.

## Ajustes (cada um com o texto exato)

### U1 (médio) A1 do review: a frase "de outros fluxos" está errada
Onde: `web/src/features/sustentacao/components/comuns.tsx:24-26`. A contagem `foraDoFluxo` inclui chamados de outro fluxo, sem fluxo e com mais de um fluxo.

Texto novo, singular (n = 1):
`1 chamado ficou fora desta métrica: é de outro fluxo, não tem fluxo ou tem mais de um. Ela vale só para os cinco fluxos do PROC.`

Texto novo, plural (n > 1):
`{n} chamados ficaram fora desta métrica: são de outro fluxo, não têm fluxo ou têm mais de um. Ela vale só para os cinco fluxos do PROC.`

Isso mantém a ideia do texto sugerido no review ("fora dos cinco fluxos do PROC (outro fluxo, sem fluxo ou mais de um)"), com frase completa. Atualize o teste que checa o texto em `sustentacao.test.tsx` (linhas 316 a 323).

### U2 (médio) "cinco" quer dizer duas coisas no mesmo parágrafo
Onde: `notas.ts`, `comoSeCalcula` do S5 (linha 46) e do S6 (linha 55). "Sem par entre os cinco" e "(cinco valores)" aparecem junto de "cinco fluxos do PROC". A pessoa não sabe se são cinco fluxos ou cinco motivos.

S5, `comoSeCalcula`:
`Campo "Motivo da escalação" dos chamados dos cinco fluxos do PROC. Motivo preenchido que não está na lista vira "Outro"; campo vazio vira "Não informado". "Não informado" aparece só na tabela.`

S6, `comoSeCalcula`:
`Campo "Motivo de encerramento" dos chamados dos cinco fluxos do PROC. Motivo preenchido que não está na lista vira "Outro"; campo vazio vira "Não informado". "Não informado" aparece só na tabela.`

(O código mostra "Não informado" só como linha da tabela em `CartaoMotivos.tsx:101-103`; o gráfico e a evolução não o trazem. O texto acima diz isso, para ninguém procurar a faixa no gráfico.)

### U3 (médio) A4 do review: "o último" não aponta mais para um motivo
Onde: `notas.ts:48`, `comoLer` do S5. Com "Outro" na lista e a ordem por volume, "o último" pode ser o "Outro".

Texto novo:
`Cada motivo aponta para uma ação diferente; um motivo pequeno também merece leitura própria. "Outro" grande pede revisar a lista de motivos.`

(Se o dono não quiser a segunda frase, basta a primeira. A segunda é leitura de produto, então vale pergunta ao dono antes de entrar: ela afirma o que "Outro" grande significa.)

### U4 (baixo) S6, `cuidados`: acompanhar a regra do "Não informado"
Onde: `notas.ts:60`.

Texto novo:
`Um quinto a um terço por contorno significa causa raiz viva. "Outro" e "Não informado" são contados à parte e não entram na taxa de contorno.`

Atenção: só publique a segunda parte se for verdade no cálculo. Confirme com o `node-backend` se a taxa de contorno ignora "Outro" e "Não informado" no denominador; se não ignorar, mantenha o texto atual (`"Outro" e "Não informado" aparecem separados.`). Não decidi isso por inferência.

### U5 (baixo) Percentual "—" do "Não informado" sem explicação
Onde: `CartaoMotivos.tsx:102`. A linha "Não informado" sempre mostra "—" no percentual, mesmo com 20 chamados ou mais. A legenda da tabela só explica o "—" por falta de amostra.

Legenda nova (`CartaoMotivos.tsx:89`):
`Motivos (${sufixo}): contagem e percentual; o percentual some com menos de 20 chamados e nunca é publicado para "Não informado"`

### U6 (baixo) Tamanho do texto da linha de aviso
Onde: `comuns.tsx:22`. A linha usa `text-xs` (12 px) e `text-texto-2` e é um aviso que muda a leitura da métrica. Sugestão: `text-sm`. Contraste de `text-texto-2` sobre o fundo do cartão: `lido`, sem medição; o QA mede.

## Notas dos cartões

### Nota do S5 `s5-risco-sla-sem-fonte` (aprovada, com redação opcional)
Texto atual está correto. Versão mais direta, se quiser:
`Risco de estouro de SLA: sempre zero, porque o campo "Motivo da escalação" do Acelerato não tem esse valor.`

### Nota do S7 `s7-nao-igual-vazio` (aprovada)
Texto atual serve. Sem mudança.

### Nota do S3 (resposta ao A2 do review)
O S3 conta o mesmo campo, pela mesma regra do S7. Recomendo um texto neutro, para a mesma nota valer nos dois cartões (S3 e S7), com o prefixo no plural:
`Ajustes manuais de prioridade: a coleta não separa "Não" de campo vazio; só "Sim" conta como ajuste.`

Posição no S3: junto das outras notas do cartão (`notasDoCartao`), sem linha nova no corpo. Isso exige trocar o texto de `s7-nao-igual-vazio` em `origem.ts:215-216` e aceitar a nota no schema do S3 (A2 do review). Se o backend preferir manter o texto do S7 como está, o S3 usa o texto acima, em id próprio.

## Pontos que ficam como estão
- A faixa "Outro" no gráfico não precisa de rótulo extra: ela aparece com o nome e o número na tabela de dados.
- `NotaForaDoFluxo` no S6 só aparece quando a taxa de contorno existe (`t &&`, `CartaoS6.tsx:29`). É igual ao S5 e ao S7 na prática, porque `t` existe sempre que há dado. Sem ajuste.
- Leitor de tela (`lido`): a nota é um parágrafo com ícone; confirme que `Icone` é decorativo (`aria-hidden`). Não abri o componente `Icone`, então isso fica para o QA.

## Resumo para o node-backend
Aplicar U1, U2 e U3 (obrigatórios); U4 só depois de confirmar o cálculo; U5 e U6 são baixos. Depois da mudança, rodar os testes da tela (`sustentacao.test.tsx`) e atualizar os que leem o texto.
