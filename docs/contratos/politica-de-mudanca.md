# Política de mudança de contrato

- **Propósito:** definir o que é mudança compatível ou incompatível, como versionar, e quem aprova.
- **Público:** quem altera `packages/contratos`, rotas, eventos, chaves de armazenamento ou colunas expostas.
- **Revisão:** 2026-10-11. Base: ADR 0007 (versionamento e formato), ADR 0014 (stack).

## 1. Versionamento da API HTTP
- Prefixo `/api/v1` (`server/src/app.ts:61`). Saúde (`/health*`) e o webhook (`/webhooks/businessmap`) ficam fora do prefixo (`app.ts:55`, `:62`).
- Mudança **compatível** não muda a versão: campo novo **opcional** na resposta, rota nova, valor novo aceito na entrada.
- Mudança **incompatível** exige `/api/v2` em paralelo, com prazo de convivência combinado com o usuário: remover ou renomear campo, trocar tipo, tornar obrigatório um campo novo, remover valor de enum, endurecer a entrada.
- A saída é validada pelo schema Zod antes de serializar (fora do schema = 500, `server/src/plataforma/erros.ts:40`); por isso o schema é o contrato e o `openapi.json` é gerado dele.
- O OpenAPI gerado e o versionado precisam ser iguais: `pnpm --filter @metricas-dspd/server run openapi:verificar` (`server/package.json:27`).

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
| Campo de pessoa em qualquer lugar | recusado | não é versão: é violação de regra inviolável |

Teste automático de compatibilidade entre fotografias de schema: [planejado] (plano em `docs/engineering/contratos-plano.md` §3, item 2). Até existir, a classificação é feita na revisão.

## 3. Preferências, cartões e eventos
- **Preferências:** formato incompatível troca a chave (`metricas-dspd:preferencias:v1` -> `:v2`), com leitura migrada da `:v1` (`packages/contratos/src/cartoes.ts:150`). Preferência ausente ou inválida vira o padrão (`web/src/features/preferencias/fonte.ts:42`).
- **Cartão retirado ou renomeado:** entra em `CARTOES_RETIRADOS` (`cartoes.ts:127`), aplicado na leitura, sem aviso ao usuário.
- **Eventos da outbox:** mudança incompatível de payload = **tipo novo** (ex.: `coleta.concluida.v2`) [planejado: nome de exemplo]; o consumidor antigo continua até a outbox esvaziar. Ver [eventos.md](eventos.md).
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
Nenhuma até 2026-10-11.
