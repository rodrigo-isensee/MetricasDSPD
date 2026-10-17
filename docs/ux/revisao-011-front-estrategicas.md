---
pedido: 011-front-estrategicas
cartao: K-109 (pedido 021)
branch: feature/011-front-estrategicas (919554b)
revisor: ux-designer
data: 2026-10-16
---

# Revisão de UX · front do lote 1 do pedido 011 (Estratégico: E9, E6, E7 sem R$, E8)

Base: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3, §5, §6, §9, §10), protótipo `cartoes.html` (parte do Estratégico), `estrategicas.tsx`, `notas.ts`, `packages/contratos/src/cartoes.ts`. Revisão por leitura do código e do protótipo; a interface não foi executada no navegador (itens que dependem de execução estão marcados "verificar").

## Parecer: aprovado com ressalvas

Sem achado crítico. Decisões respeitadas: R-1 = B (E8 sem nome de sistema nem de pessoa) e D2 = A (E7 sem R$, nem como valor lido da API; há teste cobrindo). Nenhum cartão mostra, ordena ou compara pessoa ou time. O ressalvas abaixo são de severidade média ou baixa, mais um item alto que é de documentação, não de código.

## 1. Fidelidade à especificação e ao protótipo

| Cartão | Resultado | Observação |
|---|---|---|
| E9 | Fiel, com 3 desvios | Leitura, tabela, nota, "Sem referência", leia junto e base como no protótipo. Ver A-3, A-4, A-5. |
| E6 | Fiel, com 2 desvios | Leitura, forma por replanejamento, linha 0 "data comprometida", variante `lenta`, aviso de projetos sem data. Ver A-6, A-7. |
| E7 | Fiel à D2 = A | Sem R$, sem coluna de custo, sem o selo de rateio; texto "Nunca horas apontadas" e "Não inclui os chamados (S12)" mantidos. Ver A-8, A-9, A-10. |
| E8 | Fiel à R-1 = B | Três faixas, selo, recorte pequeno com o texto exato do CA-10, sem lista de sistemas. Ver A-1, A-11. |

## 2. Achados

Severidade: crítico, alto, médio, baixo.

### Alto

**A-1 · Especificação ainda manda listar sistemas no E8 (documentação, não código).** Onde: `02-especificacao.md` §5 E8 (Visual, "Abaixo, a lista dos sistemas na faixa 1 pessoa"), CA-18, CA-25, e a lista no protótipo (`cartoes.html` linhas 463-465). Por quê: o código está certo (R-1 = B: nenhum sistema nomeado), mas o QA que rastrear CA-18 contra o código vai reprovar uma implementação correta, e a especificação contradiz a decisão do usuário. Correção: revogar CA-18 e CA-25 (como o CA-35), e retirar a lista da §5 E8 e do protótipo. Não alterei o E8 na especificação porque o pedido de revisão limita a correção ao E7; é decisão a confirmar com o Jarvis. O `CA-10` (recorte menor que 5) continua válido e está implementado.

### Médio

**A-2 · Título da seção ainda fala em custo no código.** Onde: `packages/contratos/src/cartoes.ts` linha 245 ("O que custa manter o parque, e de quem depende?") e identificador `custo-do-parque` (linha 244). Por quê: o E7 não mostra mais custo; a pessoa procura valores que não existem. Correção: trocar pelo título da seção 3 e o identificador por `concentracao-do-parque` (confirmar se algum teste ou âncora de URL usa o identificador). Depende de o usuário aprovar o título (seção 3).

**A-3 · E9: gráfico, leitura e tabela contam coisas diferentes.** Onde: `estrategicas.tsx` linhas 65-87 vs 40-43 e 119-134. A leitura fala de todos os projetos (ex.: 7), o gráfico mostra só o tipo escolhido e o título de acessibilidade diz "dos N projetos" do tipo, enquanto a tabela lista todos. Por quê: com mais de um tipo, o total muda sem aviso (heurística: visibilidade do status). O contador do seletor ameniza. Correção: acima do gráfico, a linha "Mostrando N de M projetos (tipo X)"; ou a tabela mostrar o tipo (já mostra) e o gráfico dizer no `descricao` "de M no total". Observação: o seletor por tipo não está na especificação do E9 (vem das regras de percentil por classe, §3.7); registrar na especificação.

**A-4 · E9: tabela diz "do mais antigo para o mais novo" mas o front não ordena.** Onde: linhas 121-133. Por quê: depende da ordem da API; se mudar, a legenda mente. Correção: ordenar no front por `idadeDiasUteis` decrescente (cópia do vetor) ou tirar a promessa da legenda. Também no E6 o eixo X assume ordem cronológica de conclusão (linha 211); o protótipo diz "do mais antigo ao mais recente" e o código não diz nada: ordenar por data de conclusão ou, se o contrato já garante, registrar em teste.

**A-5 · E9: linha de referência sem unidade.** Onde: linha 60, rótulo "P85 do tempo antes do início (E1): 120". Correção: "P85 do tempo antes do início dos projetos concluídos do tipo (E1): 120 dias úteis". Sem a unidade e sem o "do tipo", a linha parece valer para todos.

**A-12 · E7: um gráfico com todos os sistemas pode ficar muito alto.** Onde: linha 314, `altura = 60 + 34 * n` (19 sistemas = 706 px), rótulos de 190 px de largura. A especificação pede os sistemas com menos de 20 entregas "agrupados no fim"; o protótipo resume o resto em "(mais 15 sistemas)". Por quê: em celular o rótulo "Fluig Processos · 9% (26)" pode truncar e o gráfico domina a seção. Correção: mostrar os maiores sistemas no gráfico e o restante só na tabela alternativa e numa linha "demais N sistemas · p% (k)"; ou limitar a altura com rolagem. Verificar no navegador a 360 px.

### Baixo

**A-6 · E6: frase de leitura incorreta com um só projeto ou com todos atrasados.** Onde: `leituraE6`, linhas 159-165. Caso: 0 na data e 1 atrasado gera "0 de 1 projeto concluído no período saiu na data comprometida. O outro atrasou 8 dias úteis". "O outro/Os demais" pressupõem que alguém saiu na data. Correção: quando `naData === 0`, usar "Todos atrasaram" ou "O projeto atrasou"; testar os casos 0, 1 e vários.

**A-7 · E6: linha de estatística sem sujeito.** Onde: linhas 185-190, `{textoTaxa} na data comprometida (k de n)`. Se `textoTaxa` devolve só "36%", a frase fica "36% na data comprometida (4 de 11)". Correção: "36% dos projetos concluídos saíram na data comprometida (4 de 11)." (verificar a saída de `textoTaxa`).

**A-8 · E7: frase de leitura sem sujeito nem período.** Onde: linha 278. Protótipo e especificação: "O sistema Folha concentrou 22% das entregas do trimestre, 76% delas de sustentação." Código: "Folha: 22% das entregas do período, 76% delas de sustentação." Correção: "O sistema Folha ficou com 22% das entregas do período, 76% delas de sustentação." Quando `sist` não vem de sustentação (undefined), a frase omite a segunda parte: correto.

**A-9 · E7: faltam os links no "Não inclui os chamados ... S12".** Onde: linhas 349-353. A especificação pede o link. Correção: reutilizar o mecanismo de "Leia junto" ou colocar o link no texto.

**A-10 · E7: nome da métrica e pergunta ainda sugerem capacidade/custo.** "Capacidade por sistema" mede participação nas entregas. Sugestão (decisão do usuário, não bloqueia): chamar de "Entregas por sistema". Mantive o nome na especificação e anotei a pergunta ("capacidade medida pelas entregas, não por custo").

**A-11 · E8: rótulo de gráfico com unidade conflitante.** Onde: linhas 417-438, `modo="percentual"` com `unidade="sistemas"`. Verificar se o eixo mostra % ou contagem; os números grandes acima mostram a contagem e o gráfico repete a informação. Correção: coerência entre modo e unidade, ou retirar o gráfico (a barra 100% do protótipo é redundante com os três números). Também: com `sistemasComEntrega = 0` o cartão fala "Há 0 sistemas com entregas; as faixas ficam ocultas" com o título de "recorte pequeno"; melhor o estado vazio padrão ("Sem dados para estes filtros.").

**A-13 · E9: "Sem referência" sem o padrão `lenta`.** Onde: linhas 88-97. A especificação §6 diz que E9 usa AmostraInsuficiente `lenta`; o protótipo explica "É esperado concluir poucos projetos". O código usa um parágrafo simples, sem essa explicação. Correção: acrescentar "É esperado concluir poucos projetos." ou usar o componente.

**A-14 · E8: `dl` em três colunas fixas.** Linha 405, `grid-cols-3` sem quebra: em 360 px o rótulo "Sistemas com entregas de 1 pessoa" quebra em 4 linhas e os outros dois ficam curtos. Correção: `grid-cols-1 sm:grid-cols-3` ou rótulos paralelos ("1 pessoa", "2 pessoas", "3 ou mais") com o prefixo "Sistemas com entregas de" no título. O protótipo escreve "Entregas de 1 pessoa / de 2 pessoas / de 3 ou mais" com "sistemas" embaixo.

**A-15 · E6: números negativos com hífen.** `fmtInteiro(-3)` no eixo e na tabela. Preferir o sinal de menos (U+2212) ou a palavra "antes"; a legenda da tabela já explica o sinal. Aceitável como está.

## 3. Estados

| Estado | E9 | E6 | E7 | E8 |
|---|---|---|---|---|
| Carregando, erro, vazio | Pelo `CartaoComplementar` (padrão); verificar a altura reservada | idem | idem | idem |
| Abaixo de 20 | Referência P85 ausente com texto (A-13) | `AmostraInsuficiente` `lenta`, pontos e k de n visíveis (fiel) | `AmostraInsuficiente`, barras com "k de n" e percentual não publicado (fiel) | Censo; abaixo de 5 sistemas, recorte pequeno com o texto do CA-10 (fiel) |
| Dados fictícios | selo do cabeçalho pelo componente padrão | idem; nota E6 diz "Dado fictício até a coleta real" | idem | idem; nota diz o mesmo |
| Sem pessoa | n/a | n/a | n/a | Sem nome de sistema nem de pessoa (R-1 = B) |

Verificar no navegador: que o chip "Não afetado por: Período" aparece no E9 (retrato do dia) e que E8 mostra a janela fixa de 12 meses (a especificação cita o filtro Período com mínimo 12 meses; o código usa `aplicaveis={[]}`, janela fixa, e a nota diz isso; coerente com a razão de não filtrar por sistema, mas a §5 E8 deveria dizer "janela fixa de 12 meses").

## 4. Microcopy

Português claro, sem culpar. Pontos a ajustar: A-5, A-6, A-7, A-8, A-13. Selo do E8 exato ao especificado. Termos "espera", "deslize", "replanejamento" coerentes com as notas. A nota do E7 ("É participação nas entregas, não esforço medido nem valor em dinheiro") está boa e não cita custo como métrica.

## 5. Acessibilidade (WCAG 2.2 AA)

- Gráficos têm `descricao` e tabela alternativa ("Ver como tabela") em E9, E6, E7; o E8 não tem tabela (`semTabela`), mas os três números em `dl` cumprem o papel de texto equivalente. Aprovado.
- Forma + cor + legenda no E9 e no E6; padrão de preenchimento (hachura, pontos) nas séries do E7 e do E8: não depende só da cor. Aprovado.
- O selo do E8 usa ícone + texto; verificar que o ícone tem `aria-hidden` (decorativo).
- O `SeletorLocal` do E9 é rótulo + controle padrão do sistema; verificar o foco visível e o anúncio da troca de tipo (região `aria-live` ou o gráfico com nome que muda).
- Alvos de toque e contraste (4.5:1) herdam dos tokens; verificar o texto `text-texto-2` sobre `bg-superficie-2` na caixa de "Sem referência" e do recorte pequeno.
- A-12 e A-14: reflow a 360 px (WCAG 1.4.10) a verificar.

## 6. Proposta de título da seção nova (sem a ideia de custo)

Contexto: D2 = A faz o E7 mostrar a participação percentual de cada sistema pelas entregas, sem R$. O E8 mostra quantos sistemas dependem de 1, 2 ou 3 ou mais pessoas, sem nomes (R-1 = B). A seção deixa de ser sobre "o que custa" e passa a ser sobre concentração (das entregas e do conhecimento) e continuidade. Isso muda o sentido da seção, então **o título novo precisa da confirmação do usuário**.

| Opção | Título | Prós | Contras |
|---|---|---|---|
| A (recomendada) | "Onde o parque se concentra, e qual o risco de continuidade?" | Cobre o E7 (onde as entregas se concentram) e o E8 (risco de continuidade, a mesma expressão do selo do E8); segue o padrão de pergunta das outras seções; não evoca custo nem pessoas | Longa (59 caracteres, o antigo tinha 47) |
| B | "Onde as entregas se concentram, e de quem depende o parque?" | Próxima do título antigo ("de quem depende") | "de quem depende" lembra pessoa, o que o E8 evita; ainda dá a impressão de nomes |
| C | "Onde o parque se concentra?" | Curta | Perde o E8: o risco de continuidade fica sem título |

Aplicado na especificação (§4, E7 da §5, CA-3, CA-13, CA-35, §9). No código: `cartoes.ts` linhas 244-245 (A-2).

## 7. Mudanças feitas na especificação (`02-especificacao.md`)

- §4: linha da seção renomeada e nota de revisão de 2026-10-16.
- §5 E7: painel/seção com o título novo; D2 = A registrada no lugar da regra de custo e do selo de rateio; custo total deixa de ser dado de entrada; pergunta anotada.
- Consequentes: CA-3 (título), CA-13 (sem R$ com ou sem custo configurado), CA-35 revogado, §9 (selo do E7 retirado).
- **Atualização de 2026-10-17 (E3.2): o A-1 foi resolvido na especificação.** O E8 deixou de listar sistemas (§5 E8, §3 item 8; CA-18 e CA-25 revogados; CA-46 novo). Os trechos que ainda citavam o custo do E7 (§3 itens 2 e 13, §7, §8 item 13) também foram alinhados à D2 = A. Foram acrescentados T14-M1 = B (CA-45), a refinação do CA-42 pela R-1 = B, e os CA-47 a CA-51 (O20, O19, O25, T10). Quadro de rastreio na §11 da especificação. O protótipo (fora do repositório) também perdeu a lista do E8 e o custo do E7. Resta só o A-1 no protótipo da linha de código: nada, o código já estava correto.

## 8. Decisão pendente do usuário

Confirmar o título da seção (opção A recomendada) e, se quiser, o nome "Entregas por sistema" para o E7 (A-10).

## 9. Reconferência (2026-10-16, branch ae3ea92, K-109)

Por leitura do código; interface não executada no navegador.

| Achado | Veredito | Evidência |
|---|---|---|
| A-2 | Resolvido | `cartoes.ts` 244-245: id `concentracao-do-parque`, título da opção A |
| A-3 | Resolvido | `estrategicas.tsx` 72-75 "Mostrando N de M projetos (tipo X)" e `descricao` com "de M no total" |
| A-4 (E9) | Resolvido | cópia ordenada por idade decrescente (55-57) |
| A-4 (E6) | Aceito como provisório | ordem por deslize, empate por código (183-187), legenda coerente ("do menor para o maior"); voltar à ordem cronológica quando o contrato trouxer a data de conclusão |
| A-5 | Resolvido | rótulo com "do tipo (E1)" e "dias úteis" (65) |
| A-6 | Resolvido | casos 0 na data, 1 projeto e vários tratados (159-181) |
| A-7 | Resolvido | frase com sujeito "dos projetos concluídos saíram na data comprometida (k de n)" (209-210) |
| A-8 | Resolvido | "O sistema X ficou com p% das entregas do período" (304) |
| A-12 | Resolvido | máx. 10 sistemas no gráfico, linha "Demais N sistemas", tabela lista todos (308, 331-369) |
| A-13 | Resolvido | "É esperado concluir poucos projetos." (104); sem o componente, aceitável |
| A-14 | Resolvido | `grid-cols-1 sm:grid-cols-3` (443) |

Pendências sem bloqueio: A-9 (links do S12 no E7) segue sem link, baixo; A-11 (modo percentual com unidade "sistemas" no E8 e estado de zero sistemas) não alterado, baixo, verificar no navegador; ícone `info` sem `aria-hidden` explícito no código visto (verificar no componente `Icone`); A-10 segue com o usuário.

**Veredito final: aprovado com ressalvas** (apenas itens baixos e verificações em navegador). Pode ir ao QA.
