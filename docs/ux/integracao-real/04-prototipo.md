# Integração real: protótipo (wireframe textual, baixa fidelidade)

Protótipo descartável, aguardando validação do usuário. Dados fictícios. Alternativa A (ver 03-ideacao.md).

## W1. Cabeçalho do painel com frescor (substitui "Dados até" do mock)
```
Operacional                              Fonte: BusinessMap · Atualizado em 09/10/2026 06:10   [Atual ✓]
O trabalho está fluindo? ...                                                        [Copiar link]
```
Estados do selo (ícone + texto, nunca só cor):
| Estado | Regra (H) | Texto |
|---|---|---|
| Atual ✓ | última coleta bem-sucedida dentro do ciclo esperado | "Atual" |
| Atrasado ⏱ | passou 1 ciclo sem coleta ok | "Atrasado: última coleta há 26 h" |
| Falha ⚠ | coleta falhou no último ciclo | "Coleta falhou em 09/10 06:00. Mostrando dados de 08/10 06:10." |
Sempre mostra a data da última coleta ok; os dados continuam visíveis (controle e liberdade). A Visão geral mostra um selo por fonte, em linhas separadas.

## W2. Faixa de calibração (por fonte, por painel)
```
[i] Dados de calibração (BusinessMap, 15/09 a 14/11/2026). Servem para ajustar o processo,
    não para cobrar pessoas ou times. Metas não são avaliadas neste período.   [Saiba mais]
```
Cartão afetado: selo "Em calibração" no rodapé; no lugar de "Dentro/Fora da meta": "Em calibração: sem avaliação de meta". "Pede atenção" não lista violações de meta de cartões em calibração. Número, base e gráfico seguem visíveis. Na Visão geral, o cartão de nível traz o mesmo selo.

## W3. Dado parcial dentro do cartão
```
O3 Tempo de ciclo                                  [Em calibração]
Cobertura: 14 de 62 cards com marco de início registrado (23%).
[i] Cards sem o marco não entram. A amostra pode mudar quando a configuração terminar.
```
Se cobertura insuficiente ou n < 20: "Amostra insuficiente" (6.3), já existente.

## W4. Mudança de critério (T2.6), como o mock
Linha tracejada "Mudança de critério em 02/03/2026" + AvisoCriterio; lista em `/ajuda#criterios`. Novo: a data e a descrição vêm do registro oficial (não do código); durante calibração, a faixa W2 e o marcador podem coexistir (marcador no gráfico, faixa no topo).

## W5. Falha de coleta: três estados distintos de cartão
| Situação | Título | Texto | Ação |
|---|---|---|---|
| Coleta atrasada/falhou, há dado anterior | (cartão normal) + selo W1 | "Mostrando dados de 08/10 06:10." | nenhuma; link "Entenda" |
| Nunca houve coleta bem-sucedida | "Ainda não há dados desta fonte" | "A primeira coleta do BusinessMap ainda não terminou. Volte mais tarde." | "Voltar à Visão geral" |
| Falha de leitura da API do painel | "Não foi possível carregar este gráfico" (6.4) | "Tivemos um problema ao ler os dados. Seus filtros foram mantidos." | "Tentar de novo" |
| Filtro sem dados | "Sem dados para estes filtros" (6.2) | existente | "Limpar filtros" |
Falha do BusinessMap nunca altera os painéis do Acelerato, e vice-versa.

## W6. Visão geral com duas fontes
```
Dados:  BusinessMap  Atual ✓ 06:10     |  Acelerato  Atrasado ⏱ há 26 h
[Cartões de nível com selos Em calibração / Atrasado quando aplicável]
```

## Microcopy proposta
"Dados de calibração. Servem para ajustar o processo, não para cobrar." · "Em calibração: sem avaliação de meta." · "Atualizado em {data}." · "Atrasado: última coleta há {n} h." · "Coleta falhou em {data}. Mostrando dados de {data}." · "Ainda não há dados desta fonte."

## Acessibilidade
Selos com ícone + texto; faixa de calibração `role="status"` (não alerta); contraste 4,5:1; atualização do selo não rouba foco; `aria-label` "Fonte BusinessMap, atualizado em ...".

## Roteiro de validação (para o usuário, quando puder)
1. Mostre W1 e W6: dá para saber a idade de cada fonte sem clicar? 2. Mostre W2: entende "não cobrar"? Concorda que o painel permaneça visível e sem status de meta? (H3) 3. W5: distingue os quatro casos? 4. Quem define início e fim da calibração e onde isso é registrado? 5. Quer a tela `/dados` já, depois, ou nunca?
Decisão: (pendente, aguardando o usuário.)

## Perguntas para o arquiteto
1. **Frescor:** existe, por fonte, o registro da última coleta bem-sucedida (timestamp) e da última tentativa (com resultado)? Pode vir no mesmo payload dos painéis, sem consulta extra?
2. **Ciclo esperado:** qual a cadência de coleta (BusinessMap, Acelerato) para definir "Atrasado" (1 ciclo? tolerância)? Quem configura o limite?
3. **Eventos de coleta:** modelo mínimo de `evento_coleta` (fonte, início, fim, resultado ok/parcial/falha, tipo de erro sem detalhe sensível, contagens). Retenção? Dá para expor um recorte seguro para a interface?
4. **Calibração:** onde se registra janela de calibração por fonte (início, fim, motivo)? É dado manual versionado (como T2.6) ou derivado? Por fonte ou por métrica?
5. **Cobertura:** a API pode devolver, por cartão, "n usados de N elegíveis" (cards sem marco, cards sem tipo) para o W3?
6. **Mudança de critério (T2.6):** o registro oficial (data, descrição, métricas afetadas) é entidade servida pela API? Reprocessamento retroativo muda dados antigos, e como isso se sinaliza?
7. **Falhas parciais:** com carga incremental sem sobrescrever histórico, coleta parcial deixa dados inconsistentes? Como a API distingue "parcial" de "ok"?
8. **Isolamento:** falha de uma fonte garante que os endpoints da outra seguem respondendo?
9. **Mock:** o parâmetro `mock` (6.6) ainda existe em produção para simular os estados W1 a W5? Recomendo manter para teste/E2E.
10. **Pedido 002 (MySQL, coletores):** o acesso somente leitura ao Acelerato tem janela/latência própria que mude o frescor esperado?
