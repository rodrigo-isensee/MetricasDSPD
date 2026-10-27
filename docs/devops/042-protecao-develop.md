---
tipo: revisao-devops
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: a9b35204943b6cd50734abb77497cdec7cdc89c7
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-27
---
# Review de devops: 042-protecao-develop (K-148)

## Parecer
Aprovado, com a aplicação pendente do dono. Decisão B do dono (2026-10-27): a proteção da `develop` é só o ruleset 25003880 "develop: PR, squash, checks" (PR obrigatório, só squash, `strict` ligado, bypass de administrador em modo pull_request), e não a proteção clássica; o comando PUT foi retirado. A entrega é o texto da regra (`docs/engineering/fluxo-homologacao.md`, seções 4, 5, 12, 14 e 15) e o passo a passo nas Settings do ruleset, para o dono acrescentar `filtro`, `banco`, `openapi`, `imagem` e `seguranca` aos quatro já exigidos; nenhum workflow mudou.

- Lista de checks conferida contra `.github/workflows/ci.yml` e contra os checks reais do PR #142 (base `develop`): `rapida`, `testes`, `filtro`, `banco`, `openapi`, `imagem`, `build`, `e2e`, `seguranca`. No #142, `banco` saiu "skipping" (filtro de caminho) só no run de PR (no de push rodou e passou) e conta como sucesso. Push e PR geram checks de mesmo nome no mesmo sha (`e2e` pulado no push, passou no PR); não provado que isso segure o caso do #133, então a conferência pós-aplicação inclui abrir um PR e ver o merge bloqueado enquanto o `e2e` do PR roda.
- `seguranca` segue informativo (`continue-on-error`); exigi-lo só garante que rodou. O bypass do papel de administrador no ruleset é risco conhecido, do dono (seção 15).
- `perf` excluído de propósito: só roda em PR para `homolog`/`main`, schedule e dispatch; exigi-lo travaria todo PR para a `develop`.
- `strict` fica ligado, como está no ruleset (não afrouxa; custa rodada extra de CI quando outro merge entra antes). Nenhuma outra regra do ruleset muda.
- recomendado: ao renomear job no `ci.yml`, atualizar a lista (job renomeado trava PRs).
- Segurança (controle de merge, gatilho de `R-SEGURANCA`): parecer do `security-engineer` pendente.
- Lacuna: `actionlint` não usado (nenhum arquivo de `.github/` alterado). A proteção **não foi alterada** na API: `R-CONFORMIDADE` reserva proteção de branch ao dono; o passo a passo está na seção 15.

## Custo e rollback
Custo zero (`R-CUSTO`); nenhum minuto de CI novo. Rollback: tirar os cinco checks acrescentados nas Settings do ruleset (seção 15).
