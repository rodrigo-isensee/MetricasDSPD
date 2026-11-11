---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l1-sem-simulador
commit: dec8924c79b0ea678d889272f68237c1c3f8dc48
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: L1 do pedido 099, simulador desligado na web (E2.3, K-275)

## Achados
- A1 (recomendado) web/src/app/composicao.test.tsx:49 · o teste "nenhum cartão mostra o selo Simulado" fica verde com o FonteComSimulado religado (mutação do QA): não prova o L1, só guarda o texto. Sugestão: no L5, trocar pela G4 da ADR 0030 ou dizer no nome que é guarda de regressão.
- A2 (recomendado) docs/architecture/adr/0030-sem-simulado-na-web.md:6 · a ADR cita `docs/analises/099-varredura-simulado.md` e `099-dado-real-operacional.md`, que ainda não estão versionados; o PR do L1 (E2.5) leva as duas análises ou a ADR aponta para o pedido.

## Parecer
Aprovado sobre dec8924c (base develop eac38a64). Diff: `web/src/app/App.tsx` (+2 -4) e `web/src/app/composicao.test.tsx` (+30 -1), 37 linhas, dentro da orientação de tamanho.

- **Faz o que o pedido manda, nem mais:** com `VITE_FONTE=api` (padrão), `criarFontePadrao` devolve `HttpFonteMetricas` pura; o import de `FonteComSimulado` sai do `App.tsx`. O ramo `mock` e a falha de partida para valor inválido não mudam. O código do simulador continua no repositório, parado: a remoção é dos lotes L2a a L3 (Q-099-3 A), fora deste lote.
- **Modo homologação e API não mudam:** o diff não toca `server/`, `packages/`, `docker-compose.homolog.yml` nem o ramo `mock`; a homologação segue com `VITE_FONTE: mock` (ADR 0030, D7).
- **Os testes provam a troca:** o teste `toBeInstanceOf(HttpFonteMetricas)` cai com o decorador religado (mutação registrada no parecer do QA, `docs/qa/099-l1-sem-simulador.md`), porque o `FonteComSimulado` não é instância da HTTP. O segundo teste é guarda de regressão (A1). O falso de `fetch` lê o id da métrica pela URL e devolve `corpoSemDadoReal` do contrato com `simulavel: true`, o caso que antes ligava o simulado.
- **Regras invioláveis:** nenhum número inventado na web de uso diário; sem pessoa, credencial, banco nem dependência nova; sem gatilho de segurança.
- **Execução:** `npx vitest run src/app --maxWorkers=2` em `web/` da worktree, HEAD 93309e3a: 5 arquivos, 78 testes, 78 passaram (13,3 s). Suíte completa e E2E ficam no CI do PR.
- **ADR 0030 coerente com a mudança:** o L1 é o "só desligar" da D1; a D3 (cartão visível com "Sem dado real") é o que o teste do Operacional mostra; a linha 7 diz que o tech-lead troca o `Estado:` da 0028 no PR do L1. Neste commit, a 0030 entra copiada sem mudança do repositório principal (cmp igual) e a linha `Estado:` da 0028 passa a "substituída pela ADR 0030 em 2026-11-11", o texto que a 0030 pede; o resto da 0028 não muda.
- **Commits:** um commit de código, Conventional Commits em português, escopo `web`, mensagem clara.
