### Alterado

- CI: o tempo limite do job testes (cobertura) sobe de 15 para 25 minutos e o do e2e-parte de 30 para 45, porque estouravam sem falha de teste; nenhum teste foi pulado (pedido 105, E7.533).
- CI: a espera das buscas assíncronas dos testes do web (findBy e waitFor) sobe de 5 para 15 s só no job de cobertura do CI e do homolog, pela variável METRICAS_DSPD_ESPERA_ASYNC_MS; na estação segue em 5 s, para a lentidão local continuar aparecendo. Motivo: no runner os arquivos do web levam de 100 a 110 s e 7 testes falharam por espera de 5,2 a 8,5 s, sem erro de valor; nenhum teste pulado, sem retry nem continue-on-error (pedido 105, E7.541).
