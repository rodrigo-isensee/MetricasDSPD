# 097 - Revisão de UX do L3 (Equipe no lugar de Pessoa no Apontamento)

Data: 2026-11-12. Papel: ux-designer (E3.5). Branch `feature/097-l3-apontamento-equipe-web`, head `e6d98fb8` (QA `f1435184` e review `cfabc41f` aprovados).
Base de comparação: `docs/ux/097-filtros-time-busca.md` (CA-7 a CA-9, Q-3). Método: leitura do código e dos testes em `web/src/features/apontamento/` da worktree `MetricasDSPD-052h` (o `git diff` não pôde ser executado por este papel; li os arquivos no head). Nada foi medido: todos os itens abaixo são `lido`. Contraste e leitor de tela seguem para o QA (`@axe`).

## Veredito

Aprovado com ressalvas. Nenhum achado crítico ou alto; os médios (A1, A2) e os baixos podem ir em cartão de correção, sem barrar o PR do L3. Decisão sobre texto visível ao dono: ver A1 (R-DECISAO).

## Conferência do que foi pedido

| Item | Resultado | Evidência (lido) |
|---|---|---|
| CA-7 Equipe no lugar de Pessoa, logo após o período; sem filtro Pessoa | Cumpre | `BarraFiltrosApontamento.tsx` 64-98 (período, depois `FiltroMulti id="equipe"`); teste `apontamento.test.tsx` "CA-7" confere a primeira posição e a ausência de "Pessoa que apontou" |
| Rótulo "Equipe" (e não "Time") | Cumpre com a decisão posterior do pedido (rótulo "Equipe"); a spec de 1ª rodada dizia "Time" (Q-2) | `textos.ts` 46 |
| CA-8 formato do cartão de capacidade igual, equipe só recorta | Cumpre no cliente | colunas idênticas, teste "CA-8" confere os 7 cabeçalhos; o recorte em si é do servidor (L2), o teste do cliente não prova o recorte |
| CA-9 `pessoa=` ignorado, aviso, página funcional | Cumpre | `filtros.ts` 82-83 (nunca entra na consulta); `unidades.test.ts` 106, `apontamento.test.tsx` 337, `ligacao.test.tsx` 41 (a rota nunca recebe `pessoa`); o aviso não ecoa o valor |
| Chip e remoção | Cumpre | "Remover filtro Equipe: Portal"; `limpar` não deixa `equipe` na URL |
| "Sem equipe" | Cumpre | `filtros.ts` 99-106 troca o rótulo do id `sem-time`; teste 301 confirma que "Sem time" não aparece |
| Nota "Outra área" junto da capacidade (Q-3) | Cumpre a letra, com problema de sentido (A2) | `CartoesCapacidade.tsx` 117 |
| Linha de nomes ocultos junto da capacidade (Q-3) | Cumpre a letra, com cobertura curta (A3) | `CartoesCapacidade.tsx` 112-116; some com `nomesReais` |
| Rodapé do mapa diário | Cumpre | `CartaoDiario.tsx` 336 (`aplicaveis={[]}`); o cartão mostra "Não afetado por: Equipe, Tipo" (teste 355); o "Como ler" já diz "Este cartão não responde aos filtros da barra" (`textos.ts` 188) |

## Achados

### A1 (médio) - Aviso de link antigo mostra a chave crua: "Valor inválido ignorado em: pessoa."
- Onde: `filtros.ts` 83 (`invalidos.push('pessoa')`) e `BarraFiltrosApontamento.tsx` 170.
- Por quê: todos os outros avisos usam o rótulo da tela, com maiúscula ("Equipe", "Tipo", "Período"). "pessoa" em minúscula é nome de parâmetro de URL, vocabulário interno, e não explica que o filtro foi retirado nem o que fazer. Fere "correspondência com o mundo real" e "ajudar a recuperar de erros" (Nielsen).
- Opinião sobre o A1 do review: o CA-9 da especificação fixou essa frase porque eu a escrevi para reaproveitar o aviso existente; foi uma escolha de custo, não uma exigência de produto. O código cumpre o CA-9 e **não deve ser reprovado por isso**. Recomendo manter o L3 como está e tratar a melhoria em cartão pequeno, depois que o dono responder.
- Correção proposta (precisa do ok do dono, pois muda texto que ele viu no protótipo): rótulo "Pessoa" com maiúscula, ou frase própria do tipo "O filtro Pessoa foi retirado; este link foi aberto sem ele. Use o filtro Equipe." (`role="status"`, sem ecoar o valor recebido). Se aprovada, o CA-9 passa a citar o novo texto e o teste muda junto.

### A2 (médio) - A nota "Outra área" aparece no cartão de capacidade, que não mostra a linha "Outra área"
- Onde: `CartoesCapacidade.tsx` 106 (a linha é filtrada da tabela, regra A-4) e 117 (a nota é exibida quando `porPessoa` a contém); teste `revisao-ux.test.tsx` 61 espera 3 notas (matriz, qualidade por pessoa e capacidade).
- Por quê: a nota explica uma linha que a pessoa não vê naquele cartão. Gera dúvida ("onde está Outra área?") e contradiz a nota seguinte do próprio cartão, que diz que capacidade só vale por pessoa. A Q-3 pedia mover a nota para junto de quem a usa; a capacidade não a usa.
- Correção: no cartão de capacidade, tirar a nota (ela já está na matriz e na qualidade, onde a linha existe) ou trocá-la por "Outra área soma várias pessoas e por isso não entra na capacidade por pessoa." Ajustar o teste de 3 para o novo número. Preferência: a frase de exclusão, que também preenche o vazio do mapa diário.

### A3 (baixo) - Linha de nomes ocultos só no cartão de capacidade
- Onde: `CartoesCapacidade.tsx` 112-116.
- Por quê: "Pessoa 1, Pessoa 2..." também aparece na matriz, na qualidade por pessoa e no mapa diário. Antes a explicação ficava na barra de filtros, visível em toda a aba. Agora quem chega à matriz, ou ocultou o cartão de capacidade por preferência, vê "Pessoa 3" sem explicação.
- Correção (aceitável para o L3, sem ação imediata): repetir a linha curta na matriz e na qualidade, como a nota de Outra área, ou registrar a escolha como decisão. Mantenho a Q-3 como validada.

### A4 (baixo) - Título "Capacidade mensal (equipe)" ficou ambíguo
- Onde: `CartoesCapacidade.tsx` 89 e legenda 51, 76.
- Por quê: "equipe" minúsculo no título significa "todo o time", mas agora existe o filtro "Equipe" que recorta. Com o filtro ativo, a pessoa pode ler que o cartão trata de outra equipe que não a escolhida.
- Correção: "Capacidade mensal (total do recorte)" ou "Capacidade mensal", e "do recorte" na frase de leitura. Decisão de texto, baixa urgência.

### A5 (baixo) - Chip "Equipe: Sem equipe" é redundante
- Onde: `unidades.test.ts` 119 mostra o valor composto; ocorre no chip e em "Filtros aplicados: Equipe Sem equipe".
- Correção: nenhuma obrigatória. Se incomodar, o rótulo poderia ser "Sem equipe definida". Não mudar sem pedido.

### A6 (baixo) - A ordem alfabética (CA-18) depende do servidor
- Onde: `filtros.ts` 103-105 só troca o rótulo; o servidor ordena por "Sem time".
- Por quê: com o rótulo "Sem equipe" a posição pode destoar da ordem alfabética se houver equipes cujo nome comece entre "Sem e" e "Sem t". Improvável. Registrar; sem correção agora.

### Nota sobre o A2 do review (teste da fonte fictícia que encolhe o mapa diário)
Fora do escopo de UX (não muda o que a pessoa vê em produção). Sem opinião além de que o rodapé do mapa deve continuar sendo provado por um teste com a fonte completa.

## Acessibilidade e heurísticas do que mudou (todos `lido`)
- Foco e teclado: reaproveita o `FiltroMulti` (sem componente novo); nenhuma regressão visível no diff lido. O QA mede com `@axe`.
- Rótulo visível do filtro e `aria-label` com o nome completo: herdados do `FiltroMulti`.
- Linha de nomes ocultos e nota de Outra área: `text-xs text-texto-2`; contraste é `lido`, sem medição (QA).
- O aviso de link antigo tem `role="status"` e ícone com texto, sem depender de cor: cumpre.
- Privacidade: o aviso e os chips não ecoam valor digitado na URL (teste "descartado sem eco"): cumpre.
- Mapa diário: sem recorte por Equipe, com o aviso no rodapé, até a resposta do dono (K-286); o texto de rodapé é suficiente nesse intervalo. Quando o dono responder, a cópia do "Como ler" do mapa precisa mudar junto.

## Próximos passos
1. Tech-lead: L3 pode seguir ao PR; A1 a A6 não bloqueiam.
2. Cartão de correção pequeno para A2 (e A4 se o dono quiser), com teste ajustado.
3. Pergunta ao dono (uma, R-DECISAO), a trazer pelo Jarvis quando conveniente: trocar o aviso de link antigo para "O filtro Pessoa foi retirado; ..." (A1). Recomendação: sim.
