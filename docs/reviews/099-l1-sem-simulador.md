---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l1-sem-simulador
commit: b7d0e684bbed4b52373dcce4a9451256330c2cd6
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: L1 do pedido 099, simulador desligado na web (E2.3, K-275)

## Achados
- A1 (recomendado) web/src/app/composicao.test.tsx:49 · o teste "nenhum cartão mostra o selo Simulado" fica verde com o FonteComSimulado religado (mutação do QA): não prova o L1, só guarda o texto. Sugestão: no L5, trocar pela G4 da ADR 0030 ou dizer no nome que é guarda de regressão.

## Revalidação no head b7d0e684
Delta lido: `forge-check parecer delta docs/reviews/099-l1-sem-simulador.md`, intervalo dec8924c..a03dc1b3, sem o que veio da develop. No domínio, só documentação: `docs/analises/099-dado-real-operacional.md` (novo), `docs/analises/099-varredura-simulado.md` (novo), `docs/architecture/adr/0030-sem-simulado-na-web.md` (novo) e `docs/architecture/adr/0028-simulado-por-cartao.md` (1 linha). O código não mudou: `git diff dec8924c b7d0e684 -- web/src/app` vazio. O merge b7d0e684 (pais a116a9d8 e f4c122f1) é limpo e só traz a develop.

- **ADR 0028:** só a linha `Estado:` passa a "substituída pela ADR 0030 em 2026-11-11", o texto que a 0030 (linha 7) pede; o resto não muda.
- **ADR 0030:** coerente com o L1 (D1 "só desligar", D3 cartão visível com "Sem dado real", D7 homologação fora). Traz critério de reversão e "Por que o existente não basta"; a evidência de execução da G1 fica como condição do merge do L2d, fora deste lote.
- **A2 da rodada anterior resolvido:** as duas análises citadas na 0030 (linha 6) agora estão versionadas na branch (a116a9d8), pela decisão técnica do Jarvis de mantê-las neste PR.
- **Separação do parecer:** a rodada anterior saiu em 846267f1 junto com as ADRs (QA-TESTE-E-PARECER-SEPARADOS). Este parecer vai num commit só dele.
- **Execução:** `npx vitest run src/app --maxWorkers=2` em `web/` da worktree, no head b7d0e684: 5 arquivos, 78 testes, 78 passaram (12,2 s). Suíte completa e E2E ficam no CI do PR.

## Parecer
Aprovado sobre b7d0e684 (base develop f4c122f1). Diff de código da branch: `web/src/app/App.tsx` (+2 -4) e `web/src/app/composicao.test.tsx` (+30 -1), 37 linhas, dentro da orientação de tamanho.

- **Faz o que o pedido manda, nem mais:** com `VITE_FONTE=api` (padrão), `criarFontePadrao` devolve `HttpFonteMetricas` pura; o import de `FonteComSimulado` sai do `App.tsx`. O ramo `mock` e a falha de partida para valor inválido não mudam. O código do simulador continua no repositório, parado: a remoção é dos lotes L2a a L3 (Q-099-3 A), fora deste lote.
- **Modo homologação e API não mudam:** o diff não toca `server/`, `packages/`, `docker-compose.homolog.yml` nem o ramo `mock`; a homologação segue com `VITE_FONTE: mock` (ADR 0030, D7).
- **Os testes provam a troca:** o teste `toBeInstanceOf(HttpFonteMetricas)` cai com o decorador religado (mutação registrada no parecer do QA, `docs/qa/099-l1-sem-simulador.md`). O segundo teste é guarda de regressão (A1). O falso de `fetch` lê o id da métrica pela URL e devolve `corpoSemDadoReal` do contrato com `simulavel: true`, o caso que antes ligava o simulado.
- **Regras invioláveis:** nenhum número inventado na web de uso diário; sem pessoa, credencial, banco nem dependência nova; sem gatilho de segurança.
- **Commits:** um commit de código, Conventional Commits em português, escopo `web`, mensagem clara.
