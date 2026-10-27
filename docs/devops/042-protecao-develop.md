---
tipo: revisao-devops
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: e342a2cd71c46df5acf60b756637ebf5a6c84709
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-27
---
# Review de devops: 042-protecao-develop (K-148)

## Parecer
Aprovado, com a aplicação pendente do dono. A entrega é o texto da regra (`docs/engineering/fluxo-homologacao.md`, seção 15) e o comando exato; nenhum workflow mudou.

- Lista de checks conferida contra `.github/workflows/ci.yml` e contra os checks reais do PR #142 (base `develop`): `rapida`, `testes`, `filtro`, `banco`, `openapi`, `imagem`, `build`, `e2e`, `seguranca`. No #142, `banco` saiu "skipping" (filtro de caminho) e conta como sucesso.
- `perf` excluído de propósito: só roda em PR para `homolog`/`main`, schedule e dispatch; exigi-lo travaria todo PR para a `develop`.
- `strict` desligado (sem rodada extra de cerca de 25 min por merge). Nenhuma outra regra da proteção muda.
- recomendado: ao renomear job no `ci.yml`, atualizar a lista (job renomeado trava PRs).
- Segurança (controle de merge, gatilho de `R-SEGURANCA`): parecer do `security-engineer` pendente.
- Lacuna: `actionlint` não usado (nenhum arquivo de `.github/` alterado). A proteção **não foi alterada** na API: `R-CONFORMIDADE` reserva proteção de branch ao dono; o comando está na seção 15.

## Custo e rollback
Custo zero (`R-CUSTO`); nenhum minuto de CI novo. Rollback: remover o `required_status_checks` da proteção da `develop` (comando na seção 15).
