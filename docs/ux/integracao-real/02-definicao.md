# Integração real: definição

## Declaração do problema
Gerentes, coordenadores e times precisam **saber, em qualquer cartão, quão atual e quão maduro é o dado que estão lendo** porque, com dados reais, um número velho, incompleto ou ainda em calibração é lido como verdade e vira cobrança, o que o briefing proíbe (7.4) e destrói a credibilidade do conjunto.

## Como podemos...?
1. ...mostrar a idade do dado por fonte (BusinessMap, Acelerato) sem misturá-las e sem ruído?
2. ...sinalizar "dados de calibração, não cobrar" sem esconder o painel nem desqualificar o que já é confiável?
3. ...explicar uma lacuna ou quebra de série (mudança de critério, coleta falha) em uma frase, com o próximo passo?
4. ...distinguir "coleta atrasada/falhou" de "filtro sem dados" e de "amostra insuficiente"?
5. ...mudar o mínimo da especificação atual (mock) ao trocar a fonte?

## Critérios de sucesso (hipóteses de meta, ajustáveis)
- Em 100% dos cartões, o frescor da fonte é visível sem clique (selo ou rodapé).
- Em teste com 5 pessoas, 5/5 explicam o que "dados de calibração" significa e que não se cobra, sem ajuda.
- Em teste, 5/5 distinguem "dado atrasado" de "sem dados nos filtros" de "amostra insuficiente".
- Nenhum estado novo mostra pessoas, compara equipes ou mistura fontes.
- Falha de uma fonte não afeta os painéis da outra (verificável por E2E).
