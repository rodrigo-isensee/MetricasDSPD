# Métricas fora do núcleo · 01 Empatizar

Fonte: briefing seção 06 (catálogo), 7.1 a 7.3, proposta de métricas e `docs/ux/preferencias-metricas/`. Nada aqui veio de entrevista; o que não está documentado é hipótese (H).

## Escopo (17 métricas catalogadas, sem "•")
| Painel | Métricas | Status no briefing |
|---|---|---|
| Operacional (FL1) | O5, O6, O8, O11, O13, O14, O16, O17 | catalogadas, "sob demanda" |
| Tático (FL2) | T6 Previsão probabilística, T8 Sprint | idem |
| Estratégico (FL3) | E4 Iniciadas x concluídas, E5 Previsão de término | idem |
| Sustentação | S8 a S12 | idem |

## Personas (hipóteses H1 a H3)
- **Coordenador/líder de equipe** (semanal, desktop): usa o núcleo no ritual; vai às complementares quando uma métrica do núcleo levanta uma pergunta ("por que o P85 subiu?" leva a O5/O8). Dor: painel longo, com cartões que não usa agora.
- **Gerente/gestão** (mensal/trimestral): quer T6, E4, E5 para conversar prazo e capacidade. Dor: achar a previsão sem ler 12 cartões. Compromisso externo sempre no P85.
- **Analista de sustentação / coordenação de sustentação** (diário/semanal): S8 a S12 explicam o que o S1/S2 mostram (reabertura, pendência, fila). Dor: só precisa quando S1/S2 foge da meta.
- **Quem mantém as métricas (DSPD)**: precisa saber o que existe, o que está implementado e o que não. Dor: catálogo só no briefing.

## Mapa de empatia (síntese)
Pensa: "Isso é para mim ou é detalhe?". Sente: sobrecarga se tudo aparece; frustração se não acha. Vê: painéis com seções por pergunta, "Pede atenção", seletor "Métricas". Ouve: "poucas métricas, bem lidas" (proposta: núcleo bem menor que o inventário). Faz: abre o painel, lê a faixa, desce até a pergunta. Dores: poluição, descoberta, métricas que se leem sozinhas e viram meta (7.2). Ganhos: aprofundar sob demanda sem perder foco.

## Jornada atual
Pergunta surge no núcleo -> não há onde aprofundar -> pede ao DSPD uma consulta (atrito 1) -> não sabe se a métrica existe (atrito 2) -> tabela fora do app (atrito 3).

## Restrições que moldam a solução
- Não implementadas hoje: mostrar como "catalogada, ainda não disponível", nunca cartão vazio que pareça erro.
- Cada métrica herda suas regras: amostra < 20 não publica; percentis 50/85/95 em 12 semanas; BusinessMap e Acelerato nunca misturados; story/frente/projeto nunca no mesmo histograma (O8, E4, E5 seguem a granularidade do painel).
- Metas proibidas (7.2): sem meta em volume de bugs (O13, O16), tamanho médio isolado (O8), aderência de sprint 100% (T8). O cartão mostra a leitura "ao lado de" (O8 com O4 e O3; T8 com entrada não planejada).
- Nada por pessoa: O14 agrega por área/cliente/sistema, nunca por pessoa; T8 sem divisão por pessoa nem entre equipes.

## Hipóteses e perguntas abertas
H1: complementares são consultadas por pergunta, não por rotina. H2: 3 a 8 cartões extras por painel são toleráveis se recolhidos. H3: alerta de complementar não deve entrar em "Pede atenção" (sem meta do núcleo). Perguntas em "Decisões para o usuário" (03).
