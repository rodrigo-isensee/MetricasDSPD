---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-deps-patch
commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-05
---
# Review de segurança: renovação do lock (E8, K-232)

Propósito: portão de segurança da dependência do E8 antes do PR. Público: tech-lead, node-backend, qa-engineer, Jarvis.

**Veredito: aprovado.** O diff `8a789d43...b9441f58` toca só `pnpm-lock.yaml` (13 linhas trocadas, 13 removidas) e sobe body-parser 1.20.8 para 1.20.9, qs 6.16.0 para 6.16.1 e ip-address 10.7.3 para 10.7.4, as versões corretivas da triagem (alertas 17, 26 e 13, `docs/security/073-dependabot-triagem.md`, A1 e A2). Leitura estática do diff.

## Conferências
- Corrige os alertas: 17 (body-parser, alta), 26 (qs, média) e 13 (ip-address, média), cada um para a versão indicada na triagem; as versões antigas não restam no lock (uma só entrada de cada pacote, em `packages` e em `snapshots`).
- Nenhum pacote novo: o diff só renomeia as três chaves e seus pontos de referência (`express`, `body-parser`, `socks`); nenhuma entrada foi adicionada ou removida e as listas de `dependencies` dos três pacotes não mudaram.
- Origem intacta: só mudou o `integrity` dos três pacotes; nenhuma outra linha `resolution`, nenhum `tarball` nem registro alternativo no lock.
- Sem dependência de produção nova: `package.json` não mudou; os três pacotes são transitivos da cadeia de e2e (`@lhci/cli`, `proxy-agent`), só desenvolvimento.
- Salto de patch na mesma linha (1.20, 6.16, 10.7), sem quebra esperada.

## Lacunas
- `osv-scanner` não está no PATH: o resultado das versões novas não foi reconfirmado localmente; vale a varredura do CI do PR.
- Os hashes de integridade não foram recotejados com o registro (sem rede para o npm); a instalação congelada na CI os verifica.
- Os 4 testes de entrada do server, que falham no sandbox (tsx em /tmp), ficam para a CI do PR, conforme o Histórico do pedido.

## Achados
- A1 (recomendado) pnpm-lock.yaml:2511 · confirmar na CI do PR a instalação congelada e a varredura de dependências verdes; sem isso a integridade das três versões não foi provada fora do diff.
