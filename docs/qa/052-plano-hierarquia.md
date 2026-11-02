---
tipo: qa
contrato: 0
pedido: 052-integracao-businessmap
branch: docs/052-plano-hierarquia
commit: d6998859a9a2b6b71a1a068544ad211d2fc84958
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-30
---
# QA: 052-integracao-businessmap (E1.25, plano revisto da hierarquia)

Veredito: aprovado, com 1 recomendação que não devolve. Testado o head `d699885` (4 documentos: plano 052, data-model, configuração da API do BusinessMap e ADR 0015; mais o parecer de review). Só documentos: sem suíte de teste, sem código, sem chamada ao BusinessMap, sem leitura do `.env`.

Método: conferência por leitura e por busca textual contra as decisões do dono do brief (H-1 a H-17, a lista de times no banco de 16:44, H-20 a H-26, H-4 e a lista de exceções, o recorte de 2026-11-02). O delta entre `485df6a` (E1.28) e `d699885` é só o parecer de review.

## Ferramentas
`pnpm run docs:check` na worktree 052, em `d699885`:
```
docs:check: ok (802 páginas Markdown, 69 métricas, 2 eventos).
```

## Critério → conferência → resultado
| Obrigação | Conferência | Resultado | Fronteira protegida |
|---|---|---|---|
| H-1, H-2, H-4: nível pelo workflow, Sprint fora, agrupadores como story | plano §F2 (linha 174), §11 (H-4, linha 330), tabela de decisões (linha 294) | confere | n/a |
| H-6 e a decisão de 16:44: times no banco (`ref_time`, `ref_time_workflow`), com histórico e T2.6, superando o arquivo | plano linhas 27, 106, 113, 126 | confere | n/a |
| H-6 (ii) = C: 3 times próprios (224, 265, 229) e 6 fora do painel (200, 207, 198, 313, 203, 234) | plano §Tabela de times (linhas 118 a 121) | confere (3 + 6 + 6 + 47 + 1 = 63 de time mais 15 de iniciativa = 78) | n/a |
| H-7: 6 workflows fora de todo cálculo | plano linha 118 | confere | n/a |
| H-8 a H-12: papel da coluna pelas seções, flow_type, Descartado, limite de WIP por coluna | plano F2 (linha 148), §10 | confere | n/a |
| H-13, H-15, H-16, H-17: 7 métricas fictícias com selo, O6 sem classe, sustentação do BusinessMap só no operacional, mapa de tipos | plano linhas 188 a 190, 174; `origemDaMetrica` | confere | fonte BusinessMap sem cruzar com Acelerato |
| H-20 a H-26, H-4 e lista de exceções: sentido igual ao do dono | plano linhas 294 a 316, 330 a 338 | confere | n/a |
| Recorte de 2026-11-02: só operacional do BusinessMap, FL2 e FL3 em mock, Acelerato no 056 | plano linhas 27 a 33 | confere | n/a |
| Nenhum nome de pessoa nem endereço de servidor | busca por URL, IP, localhost e arroba nos 4 documentos: só prefixos genéricos (`<conta>.kanbanize.com`, demo pública da especificação) e escopos de pacote; nenhum nome de pessoa nas linhas lidas | confere | n/a |
| Nenhuma métrica individual nem comparação entre times | plano linhas 35, 106, 192: tabela de times é filtro; teste de `view_column_usage`; nomes só em `COLUNAS_PESSOA`, fora do GRANT do `dspd_api` | confere | agrupar por time para comparar |
| Frontmatter do plano em `estado: vigente` | plano linha 5 | confere | n/a |
| ADR 0015, Revisão 1: critério de reversão traz os dois controles da segurança (redirect não seguido e erro sem `cause`) | ADR linha 106: `redirect: 'manual'` com 3xx como erro e erro sem `cause` nem corpo; cita o parecer ffa261f; "Não adotar" (linha 50) coerente com o `fetch` nativo | confere | n/a |
| `pnpm run docs:check` verde | saída acima | verde | n/a |

## Achados
- A1 (recomendado) docs/integracao/businessmap-api-configuracao.md:100 · O requisito de rede do webhook ainda diz "suficiente: coleta diária às 06:00"; pela H-20 = C a coleta roda por comando; é o A6 do review, aberto e sem efeito no recorte (webhook fica na F7), ajustar na próxima passada do documento.

## Parecer
Aprovado: as decisões do dono aparecem no plano com o mesmo sentido, o plano está `vigente`, a Revisão 1 da ADR 0015 traz os dois controles pedidos pela segurança (não vira achado para o arquiteto) e o `docs:check` está verde. O plano pode seguir para o PR (E1.26).
