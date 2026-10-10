# B12-001 - Leitura do O2 cita a etapa de outro item
- Severidade: média
- Responsável sugerido: react-frontend (texto de leitura do O2; se a regra vier da biblioteca de métricas, node-backend)
- Ambiente: 567e995 (K-006), Chromium 1280, `vite preview`, semente padrão

## Passos para reproduzir
1. Abrir `/operacional` (diária), sem filtros.
2. Ler a frase do O2 e comparar com a tabela "Itens para olhar primeiro".

## Resultado esperado
"1 item está acima do P95 do seu tipo. O mais velho tem N dias úteis e está em <etapa>" descreve o item acima do P95 (S-1697, Melhoria, Execução, 17 dias úteis, "Acima do P95 do tipo").
## Resultado obtido
A frase diz que o mais velho "está em Fila". O item em Fila com 17 dias é o S-0962 (Dívida técnica, "Sem referência: amostra insuficiente"), que não está acima do P95. O leitor é levado ao item errado; o rótulo "O mais velho" também fica ambíguo (mais velho de todos ou do grupo acima do P95).
## Evidência
Dump do `main` de `/operacional` (O2) e linhas S-0962 e S-1697 da tabela. Sem teste automático: a regra de redação não está no plano; UX deve decidir se a frase fala do item acima do P95 ou do mais velho geral.
