---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: docs/jarvis-2026-10-23
commit: d8754a08978ecd18fc14bb0e80120b3c3a7845b7
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-05
---
# Aceitação de risco dos alertas 16 e 27 do Dependabot (E1.2)

Propósito: registrar a aceitação dos alertas 16 e 27, ao lado da triagem `docs/security/073-dependabot-triagem.md` (achados A3 e A4). Público: Jarvis, tech-lead, devops-engineer. Sem dado de pessoa. Só leitura: nenhuma dependência mudou.

## Resumo
Os dois alertas ficam aceitos, com revisão em 2026-12-05 ou quando o pacote pai corrigir (o que vier primeiro). O 16 só alcança teste. O 27, depois de lido o advisory, não alcança o uso do projeto. Este parecer não substitui o aceite formal do usuário em `docs/security/aceites/`, que o Jarvis pede; o frontmatter fica `aprovado` por isso.

## Decisão do dono
2026-11-05 20:34, DECISÃO DO DONO "A" (alertas 16 e 27, pergunta refeita): aceitar o 16 agora; o 27 só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto, com revisão em 2026-12-05 ou quando o pacote pai corrigir. A decisão anterior (20:24) foi suspensa às 20:31.

## Alerta 16: zod 3.25.76 via lighthouse (aceito)
- Pedido: 073, E1.2. Alerta Dependabot 16, severidade alta, `pnpm-lock.yaml:5429`; corrigido só em zod 4.6.6; não há correção na linha 3.x.
- Cadeia: `chromium-bidi@14.0.0` ← `puppeteer-core@24.43.1` ← `lighthouse@12.6.1` ← `@lhci/cli` (e2e, devDependencies). As dependências diretas do projeto usam `^4.6.7`, já corrigidas.
- Por que é aceitável: só roda em ferramenta de teste (e2e), fora de produção e do deploy, e o zod ali valida dados da própria ferramenta, sem entrada externa nem dado de pessoa. Sem quem ataque nem de onde, o risco é baixo na prática.
- Revisão: 2026-12-05 ou quando `lighthouse`/`chromium-bidi` passarem a zod 4.
- Gatilho que reabre: uso do zod 3.x fora do teste (importado pelo `server/` ou pelo `web/`, ou alcançável em runtime de produção), ou o e2e passar a processar entrada de fora do repositório.

## Alerta 27: glob 13.0.6 via node-pg-migrate (aceito, após ler o advisory)
- Pedido: 073, E1.2. Alerta 27, média, `pnpm-lock.yaml:3379`; GHSA-3g3m-2fjr-6pw4 (CVE-2026-118773), faixa afetada `>= 9.0.0, <= 14.0.1`, corrigido em 14.0.2. Transitiva de `node-pg-migrate@9.0.0` (dependência direta do `server`), que roda no deploy pelo runner de migração.
- O que o advisory diz: disponibilidade apenas. Quando uma varredura do glob é abortada (`signal`/`AbortSignal.timeout()`), os ramos de abort chamam `cb()` sem `return` e a travessia segue em segundo plano, gastando E/S e CPU. Afeta aplicações que expõem glob a padrões ou árvores de diretório controlados por atacante e usam o abort como orçamento de travessia. Sem impacto de confidencialidade nem de integridade.
- Por que não alcança o uso do projeto (evidência):
  1. `server/src/plataforma/db/migrar.ts:87-90` chama `runner({ dbClient, dir: DIR_MIGRACOES, direction, migrationsTable })` sem `useGlob`. No `node-pg-migrate@9.0.0` instalado (`dist/bundle/index.js:2553`), o `glob` só é chamado quando `useGlob` é verdadeiro; sem ele, a listagem usa `readdir` do próprio Node. O glob nem executa neste uso.
  2. Mesmo com `useGlob`, o pacote não passa `signal` ao `glob` (`dist/bundle/index.js:2553-2557`; busca por `signal` em `dist/` sem ocorrência). A condição do defeito (abort) não existe.
  3. O diretório vem de constante do repositório (`DIR_MIGRACOES`), sem entrada externa; o CLI de migração roda no deploy, sem requisição de usuário que empilhe varreduras.
- Conclusão: a falha não alcança o uso do projeto; aceitação confirmada.
- Revisão: 2026-12-05 ou quando `node-pg-migrate` passar a glob >= 14.0.2.
- Gatilho que reabre: o glob receber caminho ou padrão de fora do repositório (por exemplo `useGlob` ligado com padrão vindo de variável de ambiente ou argumento externo), qualquer código do projeto chamar `glob` com `signal`, ou uma atualização do `node-pg-migrate` passar `signal` ao glob.

## Achados
- A1 (recomendado) pnpm-lock.yaml:3379 · reavaliar o alerta 27 em 2026-12-05 ou quando `node-pg-migrate` corrigir; dono devops-engineer.
- A2 (recomendado) pnpm-lock.yaml:5429 · reavaliar o alerta 16 em 2026-12-05 ou quando `lighthouse` migrar para zod 4; dono devops-engineer.

## Plano em cartões
Os dois acompanhamentos já estão no cartão 2 da triagem (A3, A4); este parecer fixa a data de revisão: 2026-12-05.

## Riscos aceitos
Alertas 16 e 27, nos termos acima. O aceite formal do usuário (`docs/security/aceites/`, com `commit:` igual ao deste parecer) é pedido pelo Jarvis; não o gravo (R-DECISAO).
