---
tipo: revisao-seguranca
contrato: 1
pedido: 025-front-do-011-lote2
branch: feature/025-front-taticas
commit: 32a509f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-21
---
# Review de segurança: tela da T14 (reidentificação) e fornecedor do T10, front do lote 2 do pedido 011

Propósito: portão de segurança (R-SEGURANCA, gatilho de dado pessoal e de comparação entre times) para o front da T14 e do T10 (E2, E3, E4 do pedido 025). Público: tech-lead, react-frontend, qa-engineer, Jarvis.

**Veredito: aprovado.** Com "outros times" oculto (R-1 = B), a tela da T14 mostra só a fatia do meu time, sem `n`, sem total do projeto, sem total do recorte e sem percentual, em texto, leitura, base, tabela e DOM. Não nomeia nem ranqueia outros times. O fornecedor do T10 é dado de empresa. Dois pontos recomendados (A1, A2) e uma dependência da fase 3 (a API ainda envia os números; ver "Fora do front").

Escopo: leitura estática de `web/src/features/complementares/taticas.tsx` (T10 `:43-135`, T14 `:524-703`), `CartaoComplementar.tsx`, `notas.ts` (T14, `:228-237`), dos testes da T14 em `taticas.test.tsx:470-520` e do contrato `docs/contratos/metricas/T14.md`. Base: R-1 = B, T14-M1 = B (pedido 011), `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §5 T14, CA-27 a CA-34 e CA-45, ADR 0020, meu parecer `docs/security/011-fase2-taticas.md`.

## Verificações (E2, E3): T14 com "outros times" oculto
| Item | Resultado | Evidência |
|---|---|---|
| Linha do projeto oculto | ok: só "Meu time: k demandas"; sem barra, sem "k de n", sem percentual, sem "sem time informado" | `taticas.tsx:610-614` |
| Tabela alternativa | ok: `Outros times`, `Sem time informado` e `Participação` saem como "não exibido"; só `k` | `taticas.tsx:663-671` |
| Leitura (texto de resumo) | ok: some se algum projeto da granularidade está oculto; nenhum total é escrito | `taticas.tsx:531-535` |
| Base ("n itens") | ok: `semBase` quando há oculto em qualquer granularidade (o `n` e o complemento de frentes não aparecem) | `taticas.tsx:553-565`; `CartaoComplementar.tsx:80` |
| Tooltip, `title`, `aria-label` | ok: não há `title` nem `aria-label` com valor; o único `aria-label` é o da legenda, estático (`:594`). A barra dos projetos visíveis é `aria-hidden` | `taticas.tsx:594,621-624` |
| Dados no DOM | ok: sem `data-*` com valor, sem JSON oculto, sem estilo com número para o projeto oculto (o `flexGrow` só existe no ramo visível). Só `data-testid` | `taticas.tsx:604-660` |
| Nome de outro time | ok: nenhum nome de time é lido nem exibido; só "meu time", "outros times (somados)" e "sem time informado". O seletor é de granularidade (Histórias/Frentes), não de time | `taticas.tsx:595-598,673-682` |
| Pessoa | ok: nenhum campo de pessoa no contrato da T14 nem no componente | `T14.md` (schema); `taticas.tsx` |
| Ranking | ok: sem ordenação no front; a ordem vem da API (CA-30, por total do projeto). Selo "Não compara times" presente | `taticas.tsx:583-588` |
| Teste que trava a regra | ok: o teste confere que 47, 41 e 213 (total, `n`, total do recorte) não aparecem em lugar nenhum do cartão, nem na base, nem na leitura, nem na tabela; e o mesmo para frentes | `taticas.test.tsx:474-520` |

## Verificação (E4): fornecedor no T10
**ok.** O fornecedor é unidade organizacional (empresa), dimensão permitida. O coletor aplica a allow-list e o campo é de domínio fechado (`ref_dominio`; fora do domínio vira `desconhecido`), conforme ADR 0020, 4d, e o meu parecer anterior (B11-001: o agrupamento ignora maiúsculas, minúsculas e espaços e só exibe uma grafia já existente no dado). O contrato do T10 traz `fornecedor` como string de empresa, ao lado de contagem e duração, sem campo de pessoa; a tela exibe só esse texto, em ordem alfabética, sem ranking (`taticas.tsx:55-135`; `t10.ts:24-52`). Ressalva de proporcionalidade: a grafia vem de campo do BusinessMap preenchido por pessoas, e um fornecedor que seja pessoa física individual (autônomo) seria nome de pessoa. Não há caminho comprovado hoje; vale a checagem do domínio fechado na coleta real (fase 3, já pré-condição 3 do parecer 011-fase2-taticas).

## Achados
- A1 (recomendado) web/src/features/complementares/taticas.tsx:663 · a legenda da tabela diz "em ordem de volume do projeto" e a ordem (CA-30) posiciona o projeto oculto entre os visíveis, o que dá uma faixa do total dele (baixa; já registrada como T14-ordem no parecer 011). Fechar é decisão do usuário (ordenar o oculto por código); o front não ordena. Dono: Jarvis e ux-designer.
- A2 (recomendado) web/src/features/complementares/taticas.tsx:610 · a especificação (§5 T14) prevê "Sem time informado, se houver" na fatia oculta; o código não mostra, e isso é mais restritivo e seguro (a soma `k + semTime` não vira total). Manter assim e alinhar o CA-45 ao código, em vez de acrescentar a contagem. Dono: ux-designer.

Nenhum achado bloqueante.

## Fora do front (pré-condição da fase 3, sem efeito hoje)
O front só esconde: a resposta da API da T14 ainda traz, para o projeto oculto, `total`, `semTime`, `meuTime.n` e o agregado `total` e a `base.n` do bloco (`packages/metricas/src/businessmap/t14.ts:99-132`, fora do escopo deste pedido). Quem abrir a aba de rede obtém `n − k`. Hoje a métrica é mock ("Dados fictícios", `packages/contratos/src/cartoes.ts:56`), e por isso não bloqueia; fica valendo, sem mudança, o M-1/M-1a do parecer `docs/security/011-fase2-taticas.md` como condição antes de a T14 receber dado real (a API precisa deixar de enviar esses campos para o projeto oculto, com teste de propriedade). Este aprovado cobre a tela, não a API.

## Ferramentas
Leitura estática; sem varredura de dependências (nenhuma dependência nova no diff). `gitleaks` e `osv-scanner` não rodados: nenhum segredo nem manifesto no escopo; lacuna registrada.

## Riscos aceitos
Nenhum pedido.
