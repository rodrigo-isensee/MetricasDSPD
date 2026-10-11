# Política de mudança de contrato

- **Propósito:** definir o que é mudança compatível ou incompatível, como versionar, e quem aprova.
- **Público:** quem altera `packages/contratos`, rotas, eventos, chaves de armazenamento ou colunas expostas.
- **Revisão:** 2026-10-11. Base: ADR 0007 (versionamento e formato), ADR 0014 (stack).

## 1. Versionamento da API HTTP
- Prefixo `/api/v1` (`server/src/app.ts:61`). Saúde (`/health*`) e o webhook (`/webhooks/businessmap`) ficam fora do prefixo (`app.ts:55`, `:62`).
- Mudança **compatível** não muda a versão: campo novo **opcional** na resposta, rota nova, valor novo aceito na entrada.
- Mudança **incompatível** exige `/api/v2` em paralelo, com prazo de convivência combinado com o usuário: remover ou renomear campo, trocar tipo, tornar obrigatório um campo novo, remover valor de enum, endurecer a entrada.
- A saída é validada pelo schema Zod antes de serializar (fora do schema = 500, `server/src/plataforma/erros.ts:40`); por isso o schema é o contrato e o `openapi.json` é gerado dele.
- O OpenAPI gerado e o versionado precisam ser iguais: `pnpm --filter @metricas-dspd/server run openapi:verificar` (`server/package.json:30`).

## 2. Compatibilidade: tabela de decisão

| Mudança | Classe | Ação |
|---|---|---|
| Campo opcional novo na resposta | compatível | PR normal; atualizar `openapi.json` |
| Rota nova | compatível | PR normal |
| Remover ou renomear campo | incompatível | `/api/v2` |
| Trocar tipo ou formato (ex.: data) | incompatível | `/api/v2` |
| Campo obrigatório novo na resposta | incompatível | `/api/v2` |
| Valor de enum removido | incompatível | `/api/v2` |
| Parâmetro de entrada novo opcional | compatível | PR normal (entrada é `.strict()`: o antigo continua válido) |
| Valor novo de enum **na resposta** | incompatível | `/api/v2`: um consumidor exaustivo (por exemplo, um `switch` no `web`) quebra |
| Valor novo de enum **na entrada** | compatível | PR normal |
| Campo opcional que passa a obrigatório **na resposta** | incompatível **para o gate** | semanticamente compatível (o servidor sempre o envia), mas o classificador não distingue; passa com aceite da mudança (ver abaixo) |
| Campo opcional que passa a obrigatório **na entrada** | incompatível | `/api/v2` |
| Limite mais frouxo ou mais rígido (`minimum`, `maximum`, `pattern`, `format`, tamanho, `strict` para `passthrough`) | incompatível | `/api/v2`; afrouxar o mínimo de 20 itens também fere a regra de publicação |
| Campo de pessoa em qualquer lugar | recusado | não é versão: é violação de regra inviolável |

**Ratificação do `tech-lead` (2026-10-11): o classificador é conservador de propósito.** Só são compatíveis o **campo novo opcional** e as **anotações** (`description`, `title`, `examples`, `$comment`) (`tools/docs-contratos/src/fotografias.ts:36-49`, `:170-174`). Todo o resto é incompatível: `record` (tipo do valor), tupla (`prefixItems`), `pattern`, `format`, `minimum`/`maximum`, `maxItems`, `minLength`, `strict`/`passthrough`, valor novo de enum na saída e opcional que vira obrigatório (`:70-77`, `:100-107`, `:113-114`, `:138-148`, `:165-168`). Justificativa: o gate lê só o JSON Schema e não conhece o consumidor; falso alarme custa uma linha de aceite, falso negativo quebra o painel em produção. Não relaxamos nada agora; relaxar um caso (por exemplo, opcional que vira obrigatório na resposta) exige mudar o código e esta tabela no mesmo PR, com a decisão registrada aqui.

### Como o gate funciona
`pnpm run docs:check` (no `pronto` e no CI) compara o schema atual de cada contrato com a **fotografia** versionada em `docs/contratos/snapshots/resultados/<métrica>.json` (resultado de cada métrica) e `docs/contratos/snapshots/eventos/<tipo>.json` (payload de cada evento), geradas por `tools/docs-contratos` (`gerador.ts:116`, `:151`).
- **Sem diferença:** passa.
- **Diferença compatível** (campo novo opcional, anotação): falha com "fotografia desatualizada"; rode `pnpm run docs:fotografar` e inclua as fotografias novas no PR (`fotografias.ts:235-239`).
- **Diferença incompatível:** falha com "mudança INCOMPATÍVEL", lista cada diferença e traz o hash da mudança na mensagem (`fotografias.ts:225-230`). `docs:fotografar` também recusa gravar (`gerador.ts:160-168`). Saídas:
  1. **Contrato novo em paralelo** (`/api/v2` ou tipo `.v2`) com fotografia própria. O v2 é um contrato novo: **não isenta** o v1, que fica congelado durante a convivência (o código não procura v2 em lugar nenhum; só a mensagem de erro o sugere, `fotografias.ts:229`, e o comentário em `:260`).
  2. **Aceite** em `docs/contratos/snapshots/aceitas.json`, por **mudança concreta**: `contrato` (`resultados/O3`, `eventos/coleta.concluida`), `mudanca` (sha256 do par fotografia antiga + schema novo, `fotografias.ts:197-201`), `motivo` (mínimo de 10 caracteres) e `data` (AAAA-MM-DD) (`:249-258`, `:261-263`). Rode `pnpm run docs:fotografar`.
- **Aceite é de uso único:** depois do `docs:fotografar` a fotografia nova vira a referência, o hash deixa de corresponder a uma mudança pendente e o `docs:check` **exige remover a entrada** (`fotografias.ts:241-245`). A história do aceite fica no git e no PR, não no arquivo. Aceite por nome de contrato, permanente, não existe.
- **Remover contrato** (métrica ou evento) é incompatível: a fotografia sem contrato atual é lida como "contrato removido" (`gerador.ts:136-147`, `fotografias.ts:220-223`) e exige aceite do par (hash com `novo = null`). Ao fotografar, a fotografia do contrato removido é apagada (`gerador.ts:171`).
- **Apagar uma fotografia** e rodar `docs:fotografar` recria sem comparar; contrato sem fotografia falha no `docs:check` (`fotografias.ts:216-219`). Só o diff do PR denuncia apagamento manual; o revisor confere.

**Fluxo para uma mudança incompatível aceita:** (1) alterar o schema; (2) `pnpm run docs:check` falha e imprime o hash; (3) registrar a entrada em `aceitas.json` com motivo e data, após aprovação do arquiteto e do tech lead (§5); (4) `pnpm run docs:fotografar` (grava a fotografia nova); (5) remover a entrada de `aceitas.json`; (6) `pnpm run docs:check` verde; commit de schema, fotografia e remoção do aceite no mesmo PR.

**Lacuna conhecida:** uma rota `/api/v2/metricas/X` ainda sem fotografia própria não é detectada como contrato novo: as fotografias de resultado são por `MetricaId` (`resultados/<id>`), sem noção de versão. Enquanto não houver v2 de métrica, é aceitável; ao criar o primeiro, o PR precisa estender o gerador para fotografar `resultados/<id>.v2` e a regra do v1 congelado continua valendo. Registrar como cartão quando o primeiro v2 for planejado.

## 3. Preferências, cartões e eventos
- **Preferências:** formato incompatível troca a chave (`metricas-dspd:preferencias:v1` -> `:v2`), com leitura migrada da `:v1` (`packages/contratos/src/cartoes.ts:150`). Preferência ausente ou inválida vira o padrão (`web/src/features/preferencias/fonte.ts:42`).
- **Cartão retirado ou renomeado:** entra em `CARTOES_RETIRADOS` (`cartoes.ts:127`), aplicado na leitura, sem aviso ao usuário.
- **Eventos da outbox:** mudança incompatível de payload = **tipo novo** (ex.: `coleta.concluida.v2`, entrada nova em `catalogo.ts`, com fotografia própria); o tipo antigo e o consumidor antigo continuam até a outbox esvaziar. Remover um tipo do catálogo é mudança incompatível (ver "Como o gate funciona"). Ver [eventos.md](eventos.md).
- **Colunas e tabelas:** migração versionada, uma mudança por migração, com caminho de volta; nunca editar migração aplicada (`docs/engineering/praticas.md`).

## 4. Mudança de critério de cálculo NÃO é mudança de contrato
Alterar regra de cálculo (feriado, turno, mapeamento de etapa, classificação de coluna, regra de métrica) segue a **T2.6**: registra-se uma `ref_versao_criterio` com data (`data-model.md` §5 e §7), o cabeçalho `X-Versao-Criterio` informa a versão vigente e o gráfico marca a mudança (`criterios` no corpo). O formato do DTO não muda; portanto não há `/api/v2`. O PR que muda cálculo cita a versão de critério criada. Se a mudança alterar também a forma do DTO, vale a tabela do §2 além da T2.6.

## 5. Quem aprova
| Mudança | Aprova |
|---|---|
| Compatível, sem impacto estrutural | `tech-lead` no code review |
| Incompatível, `/api/v2`, nova chave de armazenamento, tipo novo de evento | `software-architect` + `tech-lead` (ADR se alterar decisão existente); prazo de convivência: usuário |
| Regra de negócio ou critério de cálculo | usuário (dúvida de regra nunca se resolve por inferência) |
| Coluna de pessoa nova (`COLUNAS_PESSOA`) | usuário, com revisão de modelagem (`data-model.md` §9) |

## 6. Checklist de PR
Todo PR que toca `packages/contratos`, rotas, eventos, chaves de preferência ou migrações marca: **contrato: compatível / incompatível (justificativa)**. Esse item no template de PR e em `docs/engineering/praticas.md` é [planejado].

## Registro de incompatibilidades aceitas
O registro é um só: `docs/contratos/snapshots/aceitas.json`, lido pela ferramenta. Esta página não mantém lista própria. Nenhuma entrada até 2026-10-11.
