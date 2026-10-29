---
tipo: revisao-seguranca
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: docs/048-t14-desenho
commit: 3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-28
---
# Review de segurança da T14 em mock (K-112 e K-130)

Escopo: código de `4137981` a `c6a2f60` (E1.3 e E1.4), contra C1 a C6 e D1 a D6 de `048-t14-ameacas.md`. Revisão estática, por leitura do diff; suíte, typecheck e lint ficam no QA (E5.2). `gitleaks` e `osv-scanner` não rodados: nenhuma dependência nem segredo novo no diff (lacuna registrada).

**Veredito: aprovado.** Nenhum controle falta. Os controles de servidor e banco (C1, C5, parte de C2) não têm código nesta branch porque o cadastro real é da fase 3; ficam nomeados abaixo como pendentes da fase 3, não como defeito.

## Controles
- C1 (cadastro fora do `dspd_api`): só no mock. Não há tabela nem GRANT; o cadastro simulado vive só no gerador (`membrosSimulados.ts:1-12`). Fase 3: tabela em `COLUNAS_PESSOA` e sem GRANT de coluna de pessoa ao `dspd_api`.
- C2 (pessoa na fronteira, saída booleana): cumprido no mock; `pessoasDistintas` devolve inteiro só dentro do gerador (`membrosSimulados.ts:48-55`) e a extensão recebe só `outrosPublicavel` (`extensaoTambemFase2.ts:396-405`); `calcularT14` recebe só o booleano. Fase 3: a contagem em `packages/metricas/src/coletor/` com lint de import.
- C3 (membros simulados): cumprido; ids `sim-NNN`, sem nome nem e-mail (`membrosSimulados.ts:22`, teste `membrosSimulados.test.ts:57-67`).
- C4 (cadastro não chega ao front nem ao worker): cumprido; o retorno de `gerarFase2` não inclui `membros` (`extensaoTambemFase2.ts:396-405`), e há teste de varredura da extensão e do código web/server (`membrosSimulados.test.ts:170,193`).
- C5 (log sem pessoa): só no mock; não há validação de cadastro nem log nesta branch. Fase 3: teste do marcador em log e `ctl_coleta_falha`.
- C6 (export sem membro): cumprido por ausência; a T14 não tem export (`taticas.tsx` sem CSV/PNG) e a tabela de dados mostra só k, e "não exibido" para o oculto.
- D1 (oculto só com `k`): cumprido; união por `oculto`, o ramo oculto é `{projetoId, codigo, titulo, meuTime:{k}}` e contrato `fechado` (`tambem.ts:392-406`, `t14.ts:122-129`).
- D2 (totais sem o oculto): cumprido; `total` do bloco e `base.n` somam só visíveis (`t14.ts:107-110,135`). Duas consultas com e sem o oculto não dão o `n` dele.
- D3 (ordem): cumprido; visíveis por `-total` e código, ocultos depois, por código (`t14.ts:111,122`), Q-T14-12 = B.
- D4 (sem campo novo de pessoa): cumprido; `fechado` rejeita chave desconhecida e nenhum campo de pessoa ou de time entrou.
- D5 (fail-closed): cumprido; `outrosPublicavel[...] === true`, chave ausente = oculto (`t14.ts:100-101`).
- D6 (mesma regra no mock e na API): cumprido pelo uso do mesmo `calcularT14`; a prova de igualdade worker x rota é do QA.

Aba de rede, soma e ordem (Q-T14-12 = B): o projeto oculto não traz `n`, `total`, `semTime`, `pct` nem `status`; não entra em nenhuma soma; a posição dele não depende do volume. Não há campo de pessoa no contrato, na tela (`taticas.tsx`), nem em log; o mock do navegador recebe só booleanos.

## Achados
- A1 (recomendado) packages/mock/src/businessmap/membrosSimulados.ts:48 · a contagem de pessoas está em packages/mock; na fase 3 ela deve ir para packages/metricas/src/coletor, só importável do módulo de coleta, com lint de import e teste de bundle (C2)
- A2 (recomendado) packages/mock/src/businessmap/extensaoTambemFase2.ts:373 · o mapa outrosPublicavel traz um booleano por projeto, equipe e granularidade para todas as equipes; no mock é sintético e aceitável, na fase 3 a API deve receber só o booleano da equipe do filtro

## Perguntas
- PERGUNTA: no cadastro de membros, um membro pode estar em mais de um time? Isso muda a regra de "menos de 2 pessoas" em "outros times" (a mesma pessoa em dois times) e o controle C2. Segue aberta com o dono; o código a trata como suposição em `packages/metricas/src/core/regras.ts:698` (no mock cada membro simulado fica num time só; a fase 3 conta ids distintos), sem decisão por inferência e sem bloquear o mock. O commit 3c9f6a4 só mexe em texto (comentário de `t14.ts` e `docs/api/metricas.md`) e não muda o que este parecer avaliou.

## Riscos aceitos
Nenhum pedido.
