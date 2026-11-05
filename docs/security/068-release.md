---
tipo: revisao-seguranca
contrato: 1
pedido: 068-release-065-067
branch: develop
commit: b66179b9f014768197a9017cd721b67cda2c3a47
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-05
---
# Review de segurança da release 068: develop contra homolog (K-219)

Propósito: parecer de segurança da release (`R-SEGURANCA`), develop b66179b contra homolog 92c5892. Público: tech-lead, qa-engineer, Jarvis, dono.

**Veredito: aprovado.** Cada PR da release com gatilho tem parecer de segurança aprovado, e o que mudou depois desses pareceres está dentro do que eles cobrem. Allow-list do Acelerato, mapa do BusinessMap e GRANT por coluna seguem fechados; nada pessoal entra no staging.

Revisão estática do diff `92c5892...b66179b` (143 arquivos) e dos pareceres. Rodei só testes dos arquivos tocados (6 arquivos, 146 testes, verdes, 2 workers). Não abri `.env*` nem toquei a base.

## PRs e gatilhos
- **#218 zod 4, ws 8.22.1 (dependência):** `docs/security/068-zod.md`, aprovado em 20ba6c6. O lock desta release traz só `ws@8.22.1` com integridade sha512; o único delta de manifesto depois é o script `bm:ref-sync` em `server/package.json:27`, do L2-a.
- **#220 L2-a (mapa de campos, entrada nova):** `069-lote-l2a.md`, `069-z1-l2a.md`, `069-l2-campos.md`, aprovados em 1f62f20. `CAMPOS_CUSTOMIZADOS_FORA` mantém os fields 36 (ID Acelerato) e 42 (Responsável CR, pessoa) fora (`server/src/modulos/businessmap/allow-list.ts:61`). Sem diferença de `server/src/entradas` entre o SHA aprovado e a develop.
- **#221 L2-b (projeção de colunas de lista):** `069-z5-l2b.md`, aprovado em 53361bc. `projetor.ts` e `dominio-businessmap.ts` idênticos ao SHA aprovado; `normalizador.ts` idêntico (valor só do enum, cortado em 80, `desconhecido` vira nulo com contagem).
- **#224 L9-b (consultas Q6 e Q7 do Acelerato):** `069-l9-etapa.md`, aprovado em fb8ea39. Nenhuma diferença em `server/src/modulos/acelerato` nem em `plataforma` entre esse SHA e a develop. Q6 sai com `valor` limitado a 80 e domínio fechado; Q7 sai só o booleano, sem coluna `valor` (`server/src/modulos/acelerato/sql.ts:51-74`); `esquemaEtapaLista` e `esquemaEtapaPreenchido` são `strictObject` (`allow-list.ts:166-170`).
- **Sem gatilho (sem parecer de segurança, ok):** #212, #214, #215, #216, #217, #219 e #225. Sem migração, workflow, dependência nem coluna de pessoa; mudam cálculo, contrato e interface. Migração, `.github` e `.githooks`: nenhum arquivo no diff.

## Regras invioláveis
- **Allow-list do Acelerato:** campos de etapa só por nome constante e valor no domínio de `ref_dominio`; texto livre vira booleano. Teste `acelerato-campos-etapa.test.ts` e `acelerato-estatico.test.ts` verdes.
- **GRANT por coluna:** nenhuma migração na release; as colunas de lista do `dim_card` usadas pelo L2-b já existiam e não mudam o GRANT do `dspd_api`.
- **Staging sem pessoa:** nome, e-mail, `usuarioKey`, título e descrição do chamado seguem fora; não há campo novo de pessoa nos contratos.
- **Credenciais:** nenhuma credencial no diff de código; `gitleaks` ausente, ver A1.

## Achados
- A1 (recomendado) docs/security/068-release.md:1 · Lacuna: gitleaks e osv-scanner ausentes do PATH; sem varredura local de segredo e de dependência. Confirmar gitleaks e auditoria verdes na CI do PR da release. Dono: devops-engineer.
