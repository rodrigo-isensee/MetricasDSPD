---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: docs/048-t14-desenho
commit: c6a2f6071f16814fccbaa5c6ab2e005bc31974a2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: 048-o-que-falta-em-mock (E1.1 a E1.5, branch docs/048-t14-desenho)

Escopo: `4137981e5333bee5b69f3c515b26c64d3a0b71c0` a `c6a2f6071f16814fccbaa5c6ab2e005bc31974a2` (8 commits). Por leitura do diff; typecheck, lint e testes ficam para o QA (E5.2), conforme o brief. Sem comando de ferramenta rodado aqui, nada a citar de saída.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t14.ts:121 · o comentário diz "suposição até a resposta do dono", mas a Q-T14-12 = B está decidida (2026-10-28); trocar por "Q-T14-12 = B, decidida pelo usuário"
- A2 (recomendado) docs/api/metricas.md:273 · a ordem dos ocultos ainda vem como "suposição, pendente-usuario (Q-T14-12)"; o mesmo na lista do :278; atualizar para decidida (B) e tirar a 12 das pendências
- A3 (recomendado) docs/api/metricas.md:288 · "Desvios do plano" ainda diz T14 com outrosTimes anulável; o contrato agora é união por oculto e outrosTimes inteiro; atualizar a linha
- A4 (recomendado) docs/reviews/048-t14-desenho.md:1 · teto M14: o diff tem cerca de 1000 linhas de código e teste; o PR deve levar `teto: excedido, 1000 linhas, <motivo>` (contrato, biblioteca, mock e tela são uma mudança só e não compilam separados); sem a linha no PR passa a bloqueante

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
