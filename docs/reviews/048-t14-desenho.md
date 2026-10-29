---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: docs/048-t14-desenho
commit: 230b4e92d95973d3b814fe4487474506f4ba625f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: 048-o-que-falta-em-mock (E1.1 a E1.5, branch docs/048-t14-desenho)

Escopo: `4137981e5333bee5b69f3c515b26c64d3a0b71c0` a `c6a2f6071f16814fccbaa5c6ab2e005bc31974a2` (8 commits). Por leitura do diff; typecheck, lint e testes ficam para o QA (E5.2), conforme o brief. Sem comando de ferramenta rodado aqui, nada a citar de saída.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t14.ts:121 · RESOLVIDO em 3c9f6a4: comentário agora diz "Q-T14-12 = B, decidida pelo usuário (2026-10-28)"
- A2 (recomendado) docs/api/metricas.md:273 · RESOLVIDO em 3c9f6a4: ordem dos ocultos como decidida (B) e a 12 fora das pendências (:278)
- A3 (recomendado) docs/api/metricas.md:288 · RESOLVIDO em 3c9f6a4: "Desvios do plano" descreve a união por oculto e outrosTimes inteiro
- A4 (recomendado) docs/reviews/048-t14-desenho.md:1 · teto M14: o diff de código e teste hoje soma 1240 linhas (numstat contra origin/develop, sem docs); o PR deve levar `teto: excedido, 1240 linhas, <motivo>` (contrato, biblioteca, mock e tela são uma mudança só); sem a linha passa a bloqueante
- A5 (recomendado) docs/contratos/snapshots/resultados/T14.json:1 · o aceite da mudança incompatível é de uso único e saiu do histórico; o corpo do PR deve registrar `contrato: incompatível (aceito, T14-M1 = B e Q-T14-12 = B, sem consumidor publicado)` para deixar rastro

## Parecer
Aprovado. Pontos conferidos:
- Contrato `resultadoT14` (`tambem.ts`) bate com o bloco T14 do `docs/api/metricas.md`: união discriminada por `oculto`, `fechado` (strict), oculto só com `meuTime.k`, visível com `outrosTimes` inteiro e sem `null`.
- Q-T14-12 = B: `t14.ts` ordena os visíveis por `-total` e código e os ocultos depois, só por código; teste D3 e CA-4 cobrem (`t14.test.ts:521`).
- T14-M1 = B / K-130: `total` do bloco, `base.n` e `base.complemento.n` somam só os visíveis; o oculto não entra em soma; testes D1, D2, CA-1 a CA-3 e propriedades (variar `n` mantendo `k` não muda um byte), com sentinelas 47, 41 e 213.
- Fail-closed: chave de `outrosPublicavel` ausente ou falsa oculta; sem extensão, todo projeto oculto (testes `:153`, `:405`, `:544`).
- ADR 0020 item 9 e Q-T14-10 = B: o cadastro simulado (`membrosSimulados.ts`) usa ids opacos `sim-NNN`, sem nome nem e-mail; o gerador só devolve o booleano; a contagem de pessoas não sai da extensão; membro em dois times conta uma vez; testes varrem a extensão e os fontes do web atrás de `membroRef` e `sim-NNN` (`membrosSimulados.test.ts:170`, `:197`). O mock não está no alcance do `dspd_api`; os controles C1 e C5 (grants, catálogo LGPD, log) pertencem à fase 3 e não entram nesta entrega.
- Tela (`taticas.tsx`): lê a união por `oculto`, mostra só "Meu time: k" no oculto, o aviso diz que o total não inclui os ocultos, nenhum campo de pessoa, sem ranking nem comparação entre times; "outros times" segue sem nome, tempo e vazão (Q-T14-6 = A).
- Regras invioláveis do `CLAUDE.md`: sem métrica individual, mínimo de 20 mantido (CA-31), sem mistura de fontes.
- `regras.ts`: pendências Q-T14-11 e membro em mais de um time registradas.
- Âncoras de hash do mock e spec e2e de API: do QA (E5.2), como o brief decidiu.
- Commits em Conventional Commits em português, um tema por commit.

## Revalidação (c6a2f60..f9c22a6)
Lido por leitura: o diff do intervalo sem `docs/qa` e `docs/security`, a seção 2 de `docs/architecture/features/048-t14-mock.md` e `docs/contratos/politica-de-mudanca.md`. Nada rodado aqui (trava de suíte única); o `pronto` do QA no 4497268 saiu rc=0 com `docs:check` ok (`docs/qa/048-t14-desenho.md:52`).
- Código: `t14.ts` só mudou o comentário (3c9f6a4); a regra (ocultos depois dos visíveis, por código; total do bloco e base só dos visíveis; oculto só com `meuTime.k`) é a já aprovada e cumpre T14-M1 = B e Q-T14-12 = B.
- Testes: a propriedade D1 (`t14.test.ts:706`) ganhou `fc.pre` para projeto sem card (a biblioteca não lista `total === 0`, fora do domínio) e `toEqual`; segue falhando se `n` do oculto entrar em soma ou na resposta. O spec de API (`tatico-011-lote2.spec.ts`, TT-20 a TT-23) lê a resposta real: chaves exatas do oculto e do visível, `outrosTimes` inteiro, ordem Q-T14-12 = B com guarda que distingue "ocultos ao fim" de "tudo por código", soma só dos visíveis, lista fechada de chaves e ausência de `sim-NNN` e `@`; TT-13 vira controle positivo do detector. Os testes de tela TT-11 e TT-12 trocaram o rótulo antigo pelo novo contrato.
- Âncoras de hash (`82329bc3`, `8eac5ab5`, `0e099f62`): só `equipeResponsavel` e `outrosTimes` mudam, pelo cadastro simulado (commit 0b8ee6c); o teste novo de menos de 3 equipes cobre o ramo sem equipe solo.
- Gerados: `openapi.json`, `docs/contratos/metricas/T14.md` e a fotografia `T14.json` trazem a mesma união por `oculto` (`oculto` const, `outrosTimes` inteiro, oculto com só `meuTime.k`, `additionalProperties: false`) do schema `resultadoT14`; vieram do `docs:gerar`, `openapi:gerar` e `docs:fotografar` (mensagem do 4497268 e QA A5), e o `docs:check` do QA fechou verde.
- Mudança incompatível (`politica-de-mudanca.md:45`): união por `oculto`, `outrosTimes` de `["number","null"]` para inteiro e campos removidos do oculto são incompatíveis para o gate. Fluxo seguido: aceite de uso único, fotografia regravada, entrada removida, `docs:check` verde; `aceitas.json` não existe mais na branch, como a política manda. Eu, como tech-lead, ACEITO a mudança: decidida pelo dono (T14-M1 = B e Q-T14-12 = B), desenhada pelo arquiteto (`048-t14-mock.md`, seção 2) e sem consumidor publicado (T14 só em mock, nenhum painel a lê no `/api/v2`). O rastro vai no corpo do PR (A5).
- Dado de pessoa e métrica individual: nenhum campo novo de pessoa; a resposta é fechada e o spec prova a lista de chaves; sem ranking nem comparação entre times.
- Regra de ferramenta sem comando rodado neste review: citada só a saída do QA acima.

## Revalidação (f9c22a6..230b4e9)
Delta lido: só a vinda da `develop` por merge (#157 a #160, entre eles `.github/workflows/homolog.yml`), mais a revisão de UX e a aprovação do arquiteto da T14, ambas só de `docs/`. Nenhum arquivo do diff da T14 mudou. Já lido: todo o restante, no parecer acima. Veredito inalterado: aprovado.
