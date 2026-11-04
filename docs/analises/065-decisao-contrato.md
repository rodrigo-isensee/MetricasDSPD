# 065: decisão de contrato do O1, O3 e O5 pela política de mudança (E1.8)

Pedido 065, cartão K-205. Autor: software-architect. Data: 2026-11-04. Estado: proposta, aguarda a aprovação do tech-lead (E1.9, política §5).
Código lido na worktree `/home/rodrigoisensee/MetricasDSPD-052d` (branch `feature/065-bloqueados`, revisada em `a629434`). As linhas citadas são dessa worktree.

## Decisão

| Contrato | Diferença que o gate acusa | Classe (política §2) | Decisão |
|---|---|---|---|
| `resultados/O1` | `hoje.bloqueados`, `porColuna[].bloqueados`, `porTipoColuna[].bloqueados`, `serie[].bloqueados`: `number` passa a `number \| null` (`schemas.ts:65`, `:74`, `:82`); `notas` opcional novo (`:90`) | troca de tipo: incompatível; `notas`: compatível | **aceite na v1** |
| `resultados/O3` | `notas[]` ganha o valor `bloqueio-sem-dado-real` no enum (`origem.ts:123-131`, usado em `schemas.ts:151`) | valor novo de enum na resposta: incompatível | **aceite na v1** |
| `resultados/O5` | `horasBloqueio`: `number` passa a `number \| null` (`schemas.ts:860`); `notas` opcional novo (`:866`) | troca de tipo: incompatível; `notas`: compatível | **desfazer a troca de tipo** (preferido); se o tech-lead não quiser reabrir a branch, **aceite na v1** |
| `resultados/O2` | `notas` opcional novo (`schemas.ts:143`) | compatível | sem aceite: `docs:fotografar` |

Nenhum dos três vai para `/api/v2`.

## Motivo, pela política

1. **O que a política manda.** O §1 e a tabela do §2 classificam troca de tipo e valor novo de enum na resposta como incompatíveis, com ação `/api/v2`. Mas a mesma página, em "Como o gate funciona", dá duas saídas para a diferença incompatível: (1) contrato novo em paralelo ou (2) aceite em `aceitas.json`, por mudança concreta, com motivo e data, e o "Fluxo para uma mudança incompatível aceita" exige só a aprovação do arquiteto e do tech-lead (§5). A ratificação do tech-lead (§2, 2026-10-11) explica por que a saída 2 existe: o classificador "lê só o JSON Schema e não conhece o consumidor; falso alarme custa uma linha de aceite, falso negativo quebra o painel em produção". O aceite é para o caso em que quem conhece o consumidor confirma que nada quebra. É o caso aqui (seção seguinte).
2. **O `/api/v2` não tem quem proteger.** O único consumidor da API é o `web` do mesmo repositório, que valida a resposta com o mesmo pacote `@metricas-dspd/contratos` e sai no mesmo commit, com o mesmo `docker-compose` (`docker/web/Dockerfile:11` constrói a SPA a partir da raiz do repositório). Não há prazo de convivência a combinar com o usuário porque não há consumidor antigo que precise conviver.
3. **O `/api/v2` custaria mais que a própria mudança.** A política registra a lacuna: o gerador não fotografa `resultados/<id>.v2` (seção "Lacuna conhecida"). O primeiro v2 obriga a estender `tools/docs-contratos`, congelar o v1 do O1, do O3 e do O5 e manter duas rotas por métrica, tudo para uma situação provisória que o K-204 desfaz quando a coleta gravar bloqueios (desenho, §5).
4. **O5: a troca não tem uso.** Pela decisão B do dono (Q-065-1), o O5 saiu inteiro do mapa real e responde `SemDadoReal` na base real (`origem.ts:79`; desenho §8). `semParteDeBloqueio` não trata mais o O5 (`METRICAS_COM_PARTE_DE_BLOQUEIO = ['O1', 'O2']`, `origem.ts:53`), então nada produz `horasBloqueio: null`, nem no modo mock. Quando o K-204 devolver o O5 ao mapa real, o campo volta com número. Uma mudança incompatível sem produtor não precisa de aceite: precisa sair. Desfazer custa voltar `horasBloqueio` a `z.number()` (e, se quiser, tirar o `notas` sem uso, que é compatível tanto para entrar como, por ser opcional, para não entrar) e ajustar o teste C3 da O5. O desenho §8 dizia "contrato `resultadoO5` não muda"; o código o mudou. Esta decisão corrige o desenho nesse ponto. Se o tech-lead preferir não reabrir uma branch aprovada (review `docs/reviews/065-bloqueados.md`, veredito aprovado), o aceite abaixo vale, porque o risco é nulo (seção seguinte).
5. **Não é mudança de critério só.** O §4 manda seguir a T2.6 quando muda o cálculo; aqui também muda a forma do DTO, então vale a tabela do §2 além da T2.6. A versão `criterio-2026-11-04-bloqueio-sem-dado-real` já está na biblioteca (review, "T2.6").

## Consumidores encontrados e risco de cada um

Busca feita em `web/src`, `server/src`, `packages`, `e2e`, `docs/api/` e no `CLAUDE.md`.

| Consumidor | O que lê | Risco | Nível |
|---|---|---|---|
| `web`, `CartaoO1.tsx` (`:12-13`, `:35`, `:38`, `:77`, `:101`, `:108`) | `bloqueados` e `notas` do O1 | Já trata `null` e a nota (`valoresBarra` sem a série de bloqueados; frase "bloqueados: sem dado real"). Risco só na janela de troca de versão: uma aba aberta com o bundle anterior recebe `bloqueados: null`, o Zod da fonte recusa e o cartão O1 mostra erro `RESPOSTA_INVALIDA` (`HttpFonteMetricas.ts:88-93`) até recarregar. Mostra erro, não número errado. Na ordem inversa (web nova com server antigo) o schema novo aceita o número. | baixo, transitório |
| `web`, `CartaoMetrica.tsx:114-121` e `:276` (notas de O1, O2, O3) | `notas` como id e texto por `TEXTO_NOTA_CARTAO[n]` | Não há `switch` exaustivo sobre `NotaCartaoId` (busca por `case 'sle-nao-definido'` etc. e por `Record<NotaCartaoId`: nada). O3: o server nunca envia a nota nova no O3 (S5 confere; lista só O1 e O2). Por isso um bundle antigo também não quebra no O3. | nulo |
| `web`, `CartaoO2.tsx:63`, `:82` | `notas` do O2 | Campo novo opcional; bundle antigo descarta campo desconhecido (`z.object` padrão, comentário em `HttpFonteMetricas.ts:38-39`). | nulo |
| `web`, cartão do O5 (`complementares/fluxo.tsx`) | estado `SemDadoReal` | Nenhum código do web lê `horasBloqueio` (busca em `web/src`: nada). Na base real o O5 responde `SemDadoReal`, que o web já trata. | nulo |
| `web`, exportação (`features/exportar/`) | a mesma `FonteMetricas` | Não chama a API por conta própria nem lê os campos de bloqueio (busca: nada). Herda o comportamento dos cartões. | nulo |
| `web`, faixa de atenção (`atencao.ts:25-30`) | itens da BLOQUEADOS | BLOQUEADOS não muda de schema; passa a responder `SemDadoReal`, já aceito pela rota e tratado como `parcial`. Fora desta decisão. | nulo |
| `e2e/tests-api/bloqueio-sem-dado-065.spec.ts` e testes do server | respostas novas | Mesmo repositório, escritos para o contrato novo. | nulo |
| Consumidor externo da API | — | Nenhum encontrado. `docs/api/` não lista consumidor fora do web (`metricas.md:300` registra até "nenhum consumidor lê estes contratos" para os mais novos). As "automações externas da T4.3" do `CLAUDE.md` são alertas e regras sobre o chamado (briefing, T4.3), não leem esta API. | nulo |

## Texto dos aceites

Data: 2026-11-04. O `mudanca` é o sha256 que o `pnpm run docs:check` imprime para cada contrato (`fotografias.ts:197-201`); o node-backend copia o valor da saída da ferramenta, sem calcular à mão. As entradas só são gravadas depois da aprovação do tech-lead abaixo.

```json
[
  {
    "contrato": "resultados/O1",
    "mudanca": "<hash impresso pelo docs:check para resultados/O1>",
    "motivo": "Pedido 065 (K-205): na base real a parte de bloqueio sai null, nunca 0, porque a coleta ainda não grava fato_bloqueio (decisão do dono de 2026-11-04). Único consumidor é o web do mesmo commit, que já trata null; volta a número no K-204.",
    "data": "2026-11-04"
  },
  {
    "contrato": "resultados/O3",
    "mudanca": "<hash impresso pelo docs:check para resultados/O3>",
    "motivo": "Pedido 065 (K-205): o enum compartilhado de notas ganha bloqueio-sem-dado-real, que o server nunca envia no O3. O web lê a nota por tabela de texto, sem switch exaustivo.",
    "data": "2026-11-04"
  }
]
```

Só se o O5 não for desfeito:

```json
{
  "contrato": "resultados/O5",
  "mudanca": "<hash impresso pelo docs:check para resultados/O5>",
  "motivo": "Pedido 065 (K-205): horasBloqueio passa a nullable sem produtor; o O5 responde SemDadoReal na base real até o K-204 (decisão B do dono, Q-065-1), e o web não lê o campo.",
  "data": "2026-11-04"
}
```

Sequência (política, "Fluxo para uma mudança incompatível aceita"): `docs:check` imprime os hashes, as entradas vão para `docs/contratos/snapshots/aceitas.json`, `pnpm run docs:fotografar`, as entradas são removidas (aceite de uso único), `docs:check` verde, e schema, fotografias e remoção vão no mesmo PR. Como a entrada sai do arquivo, o motivo acima vai também na descrição do PR (E1.6), na linha `contrato: incompatível (aceite na v1, docs/analises/065-decisao-contrato.md)` do checklist do §6.

## Contradição da política (§2 contra a saída 2 do gate)

- O §1 diz que mudança incompatível "exige `/api/v2`", e a tabela do §2 põe `/api/v2` como **única** ação para troca de tipo e para valor novo de enum na resposta. A única linha da tabela que fala em aceite é "campo opcional que passa a obrigatório na resposta".
- "Como o gate funciona", saída 2, e o "Fluxo para uma mudança incompatível aceita" permitem aceite para **qualquer** diferença incompatível, com aprovação do arquiteto e do tech-lead, sem dizer em que casos.
- O §5 tem uma linha "Incompatível, `/api/v2`, ..." e nenhuma para "incompatível com aceite".

Lidas ao pé da letra, as duas partes dão respostas opostas para o mesmo diff: o §2 manda O1 e O3 para o `/api/v2`, e o gate os deixa passar com aceite. Esta decisão segue a saída 2 pelo motivo da ratificação: o gate é conservador porque não conhece o consumidor, e o aceite existe para quando quem conhece confirma que nada quebra. Mas a política não diz isso, e o próximo caso vai repetir a dúvida. Proposta para um cartão próprio (sem mudar a política nesta etapa): pôr no §2 uma coluna "aceite na v1 permitido quando", com a condição verificável "todos os consumidores estão neste repositório, validam com o mesmo pacote de contratos e saem no mesmo release". Dar ao §5 a linha "incompatível com aceite: software-architect + tech-lead, com a decisão escrita em `docs/analises/`".

## Aprovação do tech-lead

**Parecer: aprovado** (tech-lead, 2026-11-04, política §5 e "Fluxo para uma mudança incompatível aceita"), lido na worktree `MetricasDSPD-052d`, branch `feature/065-bloqueados`, HEAD `e6ae9cc`.

- **O1 e O3: aceite na v1.** Motivo: a saída 2 do gate existe para o caso em que quem conhece o consumidor confirma que nada quebra (ratificação de 2026-10-11, §2); o único consumidor é o `web` do mesmo repositório, que valida com o mesmo `@metricas-dspd/contratos` e sai no mesmo release; o `/api/v2` exigiria estender o gerador (lacuna conhecida) para um estado provisório que o K-204 desfaz. Conferi que `semParteDeBloqueio` (`server/src/modulos/metricas/parte-sem-dado.ts:20-28`) só toca O1 e O2 e que o O3 nunca recebe a nota nova. O risco aceito é o da aba com bundle antigo, que mostra `RESPOSTA_INVALIDA` no O1 até recarregar: erro visível, nunca número errado.
- **O2: compatível**, só `docs:fotografar`.
- **O5: desfazer o nullable** (não o aceite). Motivo: mudança incompatível sem produtor. `METRICAS_COM_PARTE_DE_BLOQUEIO = ['O1', 'O2']` (`packages/contratos/src/origem.ts:53`), o O5 responde `SemDadoReal` na base real (`origem.ts:79`) e nenhum código do server ou do web produz ou lê `horasBloqueio: null` (busca por `horasBloqueio` em `server/src`, `web/src`, `packages`, `e2e`: só `schemas.ts:860`, `o5.ts:71` e o teste). Aceitar seria gravar no contrato uma forma que ninguém usa. O node-backend volta `horasBloqueio` a `z.number()` (`schemas.ts:860`), **tira também o `notas` do O5** (`schemas.ts:865-866`, sem produtor; com isso a fotografia do O5 fica sem diferença e não entra no PR), tira o cast de `packages/metricas/src/complementares.test.ts:167` e ajusta o teste C3 da O5. Reabrir a branch aprovada é aceitável: a mudança é pequena e o review da volta se faz por delta.
- **Condições:** os hashes dos aceites saem da saída do `docs:check`, nunca calculados à mão; as entradas saem de `aceitas.json` no mesmo PR (uso único); a descrição do PR traz a linha `contrato: incompatível (aceite na v1, docs/analises/065-decisao-contrato.md)` com o motivo de cada aceite.
- **Contradição da política (§2 contra a saída 2):** concordo com a leitura e com o cartão de melhoria proposto (coluna "aceite na v1 permitido quando" no §2 e linha "incompatível com aceite" no §5); a política não muda nesta etapa.

