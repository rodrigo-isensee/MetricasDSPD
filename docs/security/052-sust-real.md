---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-sust-real
commit: 671e8d718c5f2a0f161af60fe4ce05eaaecb9426
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: sustentação com dado real do Acelerato (pedido 052, E2.119, K-182)

Propósito: parecer de segurança do delta `2efa879..671e8d7` (E2.115 e E2.117): S2, S3, S4, S8 e S10 passam a origem `real` no mapa de origem da F6, lendo a base do Acelerato já carregada; S1, S5, S6, S7, S9, S11, S12 e EI_SUST seguem mock com motivo. Gatilhos: dado de pessoa (a API passa a servir chamados reais) e fonte externa (R-SEGURANCA). Público: node-backend (dono), tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado** em `671e8d7`. Nenhum achado. Revisão estática: li o diff inteiro (9 arquivos, só `origem.ts`, `servico.ts`, `OrigemDosCartoes.tsx`, testes e `docs/api/metricas.md`); o `.env` não foi aberto, nada foi chamado no Acelerato nem no BusinessMap e nenhuma suíte foi executada por mim. Lacuna de ferramenta: `gitleaks`, Semgrep e `osv-scanner` não estão no PATH; o delta não toca dependência, workflow, migração, GRANT nem `.env.example`, e uma busca por `password`, `apikey`, `token`, `secret`, `console.` e `log(` no diff não achou nada.

## Gatilhos
- Dado de pessoa: a base real do Acelerato passa a alimentar respostas da API. Verificado abaixo que nenhuma coluna de pessoa chega à API e que o delta não adiciona leitura nova.
- Duas fontes (BusinessMap e Acelerato nunca se misturam): verificado abaixo.

## O que foi verificado
- **Leitura do esquema do Acelerato pelo papel `dspd_api`, sem pessoa.** O delta não altera `lerChamados` (`server/src/modulos/metricas/repositorio.ts:104-117`): a mesma consulta, já usada na base do seed, passa a rodar também no esquema real por `esquemasDe(real)` (`servico.ts:102-104`). A lista de colunas não tem nome, e-mail, `usuarioKey`, descrição nem título; `com_agente` é só booleano (exceção registrada em `plataforma/db/lgpd.ts:28-31`, ADR 0020 D-9) e `justificativa_informada` é indicador derivado. O `grants.ts` não mudou, então o GRANT por coluna do `dspd_api` (`grants.ts:52-56`) vale igual nas duas bases. `lgpd.ts` não ganhou coluna nem exceção.
- **Escolha da base pela origem.** `ehReal(id)` (`servico.ts:97-99`) só é verdadeiro com `SMock` definido e origem `real` no mapa; a base única (sem `DSPD_SCHEMA_PREFIXO_SEED`) mantém o comportamento anterior. Carga, marca-d'água, versão de critério e cache de resultado têm chave por base (`servico.ts:112`, `:166`, `:270`), então S2, S3, S4, S8 e S10 não reaproveitam cache do seed. As cinco reais são de domínio `acelerato`; nenhuma é `ambos`, e VISAO_GERAL e TENDENCIA_SUST seguem mock em `origem.ts`, sem consumir a base real.
- **S8 sem mock na base real.** `servico.ts:282` passa a usar a extensão só quando `real || extensoes === undefined`; a extensão vem de `extrasAC(base, chamados)` da própria base real (`servico.ts:166`), e as extensões mockadas só entram com `!real` (`servico.ts:287-288`). Sem campo dos 90 dias projetado, o resultado sai "sem campo", não 0% (teste em `painel-real-f6.test.ts`).
- **Sem mistura BusinessMap e Acelerato.** O teste novo `painel-real-f6.test.ts` conta as leituras por esquema: as cinco reais leem só `r_dspd_ac.dim_chamado` e nunca `dspd_ac`, `dspd_bm` nem `r_dspd_bm`; as mock leem só o seed. O teste .pg (e) confirma por efeito: alterar a base real muda S3 e não muda S1, S5, S9, S12 nem EI_SUST. A sustentação não lê `ref_time` (o guard de times da F6 segue valendo, sem arquivo novo na lista).
- **Mock com motivo, sem dado inventado como real.** S9 e S12 voltaram a mock (campo ausente), e S5, S6, S7, S11 e S1 têm motivo em `origem.ts:48-63`; o front decide o selo só pelo mapa (`OrigemDosCartoes.tsx:27-33`), sem confiar no `status` do catálogo. Isso evita publicar como real um 0% por campo ausente, alinhado à decisão do dono de 2026-11-01 17:30.
- **Nada de pessoa em resposta, teste ou log.** As fixtures novas (`painel-real-f6.test.ts`, `chamado(...)`) usam só ids sintéticos, equipe, organização e tipo, sem nome, e-mail nem texto de chamado; o delta não adiciona log, e `docs/api/metricas.md` só documenta a origem. Os textos de motivo no mapa são constantes sem dado.
- **Sem métrica individual nem comparação.** O delta não cria quebra por pessoa nem por time; só muda a origem de cartões que já existiam e já tinham revisão própria (pedido 011).

## Achados

## Plano em cartões
Nenhum cartão: sem achado.

## Riscos aceitos
Nenhum.
