# 069 · L9-a: decisão de contrato do S3 (e do S2) pela política de mudança (E1.9)

Pedido 069, cartão K-220, lote L9-a (`feature/069-l9a-sem-zero`, ainda não criada; base `develop` em `d2ec79d`). Autor: software-architect. Data: 2026-11-04. Estado: **proposta**, aguarda a assinatura do tech-lead (política §5) **antes do código**.
Origem: desenho `docs/analises/069-desenho.md`, seção "Lote L9-a", item "Contrato da API". Molde: `docs/analises/065-decisao-contrato.md` (aceite na v1 do O1 e do O3).
O código citado foi lido no estado do 065 já mesclado (worktree `/home/rodrigoisensee/MetricasDSPD-052f`); como a branch do lote ainda não existe, as linhas são de antes da mudança e o node-backend as confere na branch.

## Decisão proposta

| Contrato | Diferença que o gate vai acusar | Classe (política §2) | Decisão proposta |
|---|---|---|---|
| `resultados/S3` | `meses[].ajustesManuais`: `number` passa a `number \| null` (hoje `z.number()`, `packages/contratos/src/schemas.ts:656`) | troca de tipo: **incompatível** | **aceite na v1** |
| `resultados/S3` | `notas` opcional novo | campo opcional novo: **compatível** | entra no mesmo aceite (o hash é do par fotografia antiga + schema novo do contrato) |
| `resultados/S2` | `notas` opcional novo (hoje `resultadoS2` não tem `notas`, `schemas.ts:634-637`) | campo opcional novo: **compatível** | sem aceite: `pnpm run docs:fotografar` |

Nenhum dos dois vai para `/api/v2`. **Em aberto (não decidido aqui):** onde vivem os ids das duas notas novas; ver "Ponto em aberto" no fim, que muda a lista de contratos afetados.

## Motivo, pela política

1. **O que a política manda.** O §1 e a tabela do §2 classificam troca de tipo como incompatível, com ação `/api/v2`; a seção "Como o gate funciona" dá a segunda saída, o aceite por mudança concreta em `docs/contratos/snapshots/aceitas.json`, com a aprovação do arquiteto e do tech-lead ("Fluxo para uma mudança incompatível aceita", §5). A ratificação do tech-lead de 2026-10-11 (§2) diz por que o aceite existe: o classificador não conhece o consumidor, e quem conhece confirma que nada quebra. É o mesmo caminho do 065, com a mesma leitura da contradição entre o §2 e a saída 2 já assinada pelo tech-lead ali.
2. **O `/api/v2` não tem quem proteger.** O único consumidor do S3 é o `web` do mesmo repositório, que valida a resposta com o mesmo pacote `@metricas-dspd/contratos` (`validacao.ts:81`) e sai no mesmo commit e no mesmo `docker-compose`. Não há consumidor antigo, então não há prazo de convivência a combinar com o usuário.
3. **O `/api/v2` custaria mais que a mudança.** O gerador não fotografa `resultados/<id>.v2` ("Lacuna conhecida" da política): o primeiro v2 obriga a estender `tools/docs-contratos` e manter duas rotas, para um estado provisório. O `null` dura até a constante `AJUSTE_PRIORIDADE_COM_FONTE` virar `true`, num PR próprio, depois de a coluna vir da fonte (L9-c) e o dono ver a contagem (desenho, L9-c).
4. **A troca tem produtor e tem leitor**, ao contrário do O5 do 065 (desfeito por não ter produtor). Produtor: a função irmã de `semParteDeBloqueio` em `server/src/modulos/metricas/parte-sem-dado.ts`, na base real com a constante falsa. Leitor: `CartaoS3.tsx:114`, que passa a mostrar "sem dado" no `null`. Por isso aceite, não desfazer.
5. **Não é mudança de critério.** O cálculo não muda (só a publicação, desenho "Cálculo"); sem versão de critério. Vale só a tabela do §2 (política §4, última frase).
6. **Segue a ADR 0026:** sem dado real, não publica número. Hoje `prioridade_ajustada_manualmente` é `boolean NOT NULL DEFAULT false` e o S3 publica "ajustes manuais = 0" como se fosse real (`packages/metricas/src/acelerato/s3.ts:39`); o `null` com nota tira o zero falso.

## Consumidores encontrados e risco de cada um

Busca por `ajustesManuais`, `resultadoS3` e `ResultadoS3` em `web/src`, `server/src`, `packages`, `e2e` e `docs/api/`.

| Consumidor | O que lê | Risco | Nível |
|---|---|---|---|
| `web`, `CartaoS3.tsx:114` (tabela `S3-resumo`) | `ajustesManuais` por mês, via `fmtInteiro` | O lote muda a linha para "sem dado" quando `null` (E1.3). Janela de troca de versão: aba aberta com o bundle anterior recebe `null`, o Zod da fonte recusa e o cartão S3 mostra `RESPOSTA_INVALIDA` até recarregar (`HttpFonteMetricas.ts`, como no O1 do 065). Mostra erro, nunca número errado. Na ordem inversa (web nova, server antigo) o schema novo aceita o número. | baixo, transitório |
| `web`, cartão do S2 | `notas` opcional novo | Bundle antigo descarta campo desconhecido (`z.object` padrão). | nulo |
| `web`, exportação (`features/exportar/`) e `TabelaDados` | a mesma `FonteMetricas` e as linhas já formatadas | Não lê `ajustesManuais` por conta própria (busca: nada); exporta o texto da célula, que passa a ser "sem dado". | nulo |
| `packages/metricas`, `s3.ts:39` | produz o número | Não muda: a biblioteca continua calculando; a troca por `null` é na publicação, no server. O tipo `ResultadoS3` aceita o número. | nulo |
| Modo mock | gerador do S3 | Mantém o número (teste do desenho: "modo mock mantém o número"). | nulo |
| Tendência da sustentação (`resultadoTendenciaSust`) | — | Não contém `ajustesManuais` (busca: nada). | nulo |
| `e2e` e testes do server | respostas novas | Mesmo repositório, escritos para o contrato novo (E2E no molde de `bloqueio-sem-dado-065.spec.ts`). | nulo |
| Consumidor externo da API | — | Nenhum encontrado em `docs/api/`; as automações da T4.3 não leem esta API (mesma conclusão do 065). | nulo |

Documentação que acompanha: `docs/api/openapi.json` (regerado do schema; `openapi:verificar`) e `docs/contratos/metricas/S3.md` (`:130-132` traz `"type":"number"` e o exemplo `:191`, `:199`), atualizados no mesmo PR.

## Texto do aceite (só descrito; o snapshot não é editado nesta etapa)

O `mudanca` é o sha256 que o `pnpm run docs:check` imprime para `resultados/S3` (`fotografias.ts:197-201`); o node-backend copia da saída da ferramenta, nunca calcula à mão. A entrada só é gravada depois da assinatura abaixo.

```json
{
  "contrato": "resultados/S3",
  "mudanca": "<hash impresso pelo docs:check para resultados/S3>",
  "motivo": "Pedido 069, L9-a (K-220): na base real ajustesManuais sai null, nunca 0, porque prioridade_ajustada_manualmente ainda não vem da fonte (ADR 0026). Único consumidor é o web do mesmo commit, que mostra sem dado; volta a número quando AJUSTE_PRIORIDADE_COM_FONTE virar true.",
  "data": "AAAA-MM-DD do PR"
}
```

Sequência (política, "Fluxo para uma mudança incompatível aceita"): alterar o schema; `docs:check` imprime o hash; a entrada vai para `aceitas.json`; `pnpm run docs:fotografar` (grava S3 e S2); a entrada é removida (aceite de uso único); `docs:check` verde; schema, fotografias e remoção no mesmo PR. Como a entrada sai do arquivo, o motivo vai também na descrição do PR (E1.6), na linha do checklist do §6:

`contrato: incompatível (aceite na v1, docs/analises/069-l9a-contrato.md): S3 ajustesManuais number -> number | null; S3 e S2 notas opcional (compatível)`

## Riscos

- **Aba com bundle antigo** mostra `RESPOSTA_INVALIDA` no S3 até recarregar (acima). Aceito no 065 para o O1 nas mesmas condições.
- **Virada esquecida:** se o L9-c projetar a coluna e a constante não virar, o S3 segue `null` com dado real disponível. Mitigação já no desenho: a virada é um PR próprio, depois da contagem vista pelo dono, com versão de critério `afeta = ['S3', 'S7']`.
- **`null` vazando para o modo mock:** o teste do server confere que o mock mantém o número.
- **Hash fora da ferramenta:** condição de que o hash sai da saída do `docs:check`.

## Ponto em aberto (pergunta, não decisão desta proposta)

O desenho diz que o S3 e o S2 "acrescentam a nota", sem dizer onde ficam os ids. Hoje as notas são o enum único `NOTA_CARTAO_IDS` (`packages/contratos/src/origem.ts:126-131`), usado em `notas` de O1, O2 e O3 (`schemas.ts:90`, `:143`, `:151`). Se os ids novos entrarem nesse enum, `resultados/O1`, `resultados/O2` e `resultados/O3` também passam a ter **valor novo de enum na resposta** (incompatível, política §2), como o O3 no 065, e cada um precisaria de aceite próprio. Se ficarem num enum à parte só da sustentação, só S3 e S2 mudam. A escolha vai ao tech-lead e ao Jarvis no relatório desta etapa; a tabela de decisão acima vale para S3 e S2 nos dois casos.

## Assinatura do tech-lead

Parecer: **aceito com ressalvas** (aprovado com condições): aceite na v1 de `resultados/S3` (`ajustesManuais` `number` → `number | null` mais `notas` opcional) e `resultados/S2` como compatível (`notas` opcional, só `docs:fotografar`).
tech-lead, data: 2026-11-04, política §5 e "Fluxo para uma mudança incompatível aceita".
Motivos: (1) a classe está certa: troca de tipo é incompatível pelo §1 e pelo §2, e campo opcional novo é compatível; conferi na base `d2ec79d`: `schemas.ts:656` (`z.number()`), `schemas.ts:634-637` (S2 sem `notas`), `CartaoS3.tsx:114` (`fmtInteiro`) e `s3.ts:39`, que são os únicos leitores e produtores de `ajustesManuais` em `web/src`, `server/src`, `packages` e `e2e`. (2) Usa a saída 2 do gate, a mesma do 065 com a mesma leitura: o único consumidor é o `web` do mesmo commit e do mesmo pacote de contratos, então o `/api/v2` não protege ninguém e obrigaria a estender o gerador ("Lacuna conhecida"). (3) A troca tem produtor (base real com a constante falsa) e leitor ("sem dado"), e segue a ADR 0026. (4) Não muda critério (§4): sem versão de critério neste lote; a virada da constante, no L9-c, registra a versão como já diz o desenho.
Ponto em aberto (enum das notas): fecho com a DECISÃO TÉCNICA do Jarvis (2026-11-04 21:51): os ids das duas notas ficam num **enum só da sustentação**, usado só em `notas` do S3 e do S2. Motivo técnico: pôr os ids no `NOTA_CARTAO_IDS` acrescentaria valor novo de enum na resposta de O1, O2 e O3 (incompatível, §2), três aceites sem consumidor que precise dos ids novos; o enum à parte deixa a mudança incompatível só no S3.
Condições: (a) os textos das duas notas ficam em `packages/contratos/src/origem.ts`, ao lado de `TEXTO_NOTA_CARTAO` (fonte única, sem texto repetido no `web`); se o tipo aceito pelo `CartaoMetrica` precisar alargar para a união dos dois enums, a mudança é só de tipo TypeScript, e `notaCartaoIdSchema` de O1, O2 e O3 não muda; (b) o `docs:check` do PR acusa diferença **só** em `resultados/S3` (incompatível) e `resultados/S2` (compatível); qualquer diferença em outro contrato invalida este aceite e volta para cá; (c) o `mudanca` vem copiado da saída do `docs:check`, e a entrada é gravada, fotografada e removida no mesmo PR, com a linha do checklist §6 no corpo; (d) testes do desenho: S3 real com a constante falsa sai `null` com a nota, o mock mantém o número, o S2 traz a nota, o cartão S3 mostra "sem dado", o E2E segue o molde do 065; `S3.md` e `openapi.json` atualizados no mesmo PR; (e) o lote obedece ao teto da decisão M14 (o desenho estima cerca de 200 linhas): passou de 150 linhas de código e teste, divide, sem separar o schema do S3 do `CartaoS3.tsx` (o tipo novo quebra a compilação do `web` sem o leitor), ou traz a linha `teto: excedido, <n> linhas, <motivo>` para o review.
