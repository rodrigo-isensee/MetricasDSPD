---
tipo: review
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-deps-patch
commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5
parecer: aprovado
revisor: tech-lead
data: 2026-11-05
---

# Code review: renovação do lock (E8, K-232)

**Veredito: aprovado.** O diff `8a789d43...b9441f58` toca só `pnpm-lock.yaml`: 13 linhas a mais e 13 a menos, 1 arquivo. Leitura estática do diff; não rodei testes (nenhum código mudou) e a suíte inteira é do QA.

## Conferências
- Só as três versões subiram: body-parser 1.20.8 para 1.20.9, qs 6.16.0 para 6.16.1 e ip-address 10.7.3 para 10.7.4. Cada pacote aparece uma vez em `packages` e uma em `snapshots` (`grep` no lock: 2511/7635, 4470/9827, 3549/8906), sem versão antiga restante.
- Nada mais mudou: as demais linhas do diff são os pontos de referência (`express` para body-parser e qs, `body-parser` para qs, `socks` para ip-address) e o `integrity` dos três pacotes. Nenhuma entrada adicionada ou removida; as listas de `dependencies` dos três ficaram iguais.
- As versões são as corretivas da triagem (`docs/security/073-dependabot-triagem.md`): alerta 17 (body-parser 1.20.9), 26 (qs 6.16.1) e 13 (ip-address 10.7.4). Salto de patch na mesma linha.
- Dispensa `package.json`: os três são transitivos (cadeia `express` e `socks` do e2e, só desenvolvimento) e o diff não toca o manifesto; o lock fixa a versão exata.
- Teto M14: não se aplica, lock não conta como código; um comportamento só (renovar o lock).
- Parecer de segurança (e49e6a3c, `docs/security/073-deps-patch.md`, aprovado) citado, não refeito.
- Histórico: o commit é só o lock, mensagem em Conventional Commits com a ligação aos alertas.

## Pendências de ambiente
- Os 4 arquivos de teste de entrada do server falham no sandbox (tsx em /tmp) e ficam provados pela CI do PR antes de qualquer merge, conforme o Histórico do pedido.
- Integridade dos hashes e varredura de dependências: instalação congelada e varredura do CI do PR (mesma lacuna do parecer de segurança).

## Achados
Nenhum achado bloqueante.
- A1 (recomendado) pnpm-lock.yaml:2511 · confirmar no PR a instalação congelada, a varredura de dependências e os 4 testes de entrada verdes na CI antes do merge.
