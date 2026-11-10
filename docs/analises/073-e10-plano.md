# 073 E10 (K-235): plano de lotes do reconhecimento com versão de critério

Plano E10.2 (software-architect), sem código. Base: o desenho `docs/analises/073-e10-desenho.md` (opção C), as decisões do dono de 2026-11-06 11:11 (P-E10-1 a P-E10-4) e o E3 já mesclado na develop (c5a4728e). O código do E3 foi lido na worktree da branch dele (`/home/rodrigoisensee/MetricasDSPD-052e`), a que entrou nesse merge. As linhas citadas são dessa leitura; quem implementar confere de novo na develop.

**Conferência com as regras invioláveis:** conforme. Nenhum lote apaga ou reescreve histórico: a recusa só impede a carga, e o vínculo de métricas só acrescenta linhas. Toda consulta nova lê só `dspd_ac` e o domínio `acelerato` do core, sem nada do BusinessMap. O cálculo das métricas não muda. O que é regra de negócio virou pergunta ao dono (seção final).

## Decisões que o plano segue
- **P-E10-1 "A":** editar `ref_dominio` direto no banco não é caminho aceito. A coleta recusa até a lista voltar pelo `ac:ref-sync` (opção C, que contém a A).
- **P-E10-2 "A":** o time propõe quais métricas cada grupo de lista afeta e o dono valida. Vale também para a marca da P-E3-1. A proposta está na seção "Proposta P-E10-2".
- **P-E10-3 "A":** mudança de SQL, colunas e campos também exige versão de critério, registrada no deploy (Lote 3).
- **P-E10-4 "A":** voltar uma lista a um estado anterior é mudança nova, com data nova (Lote 1).

## Regras comuns aos lotes
- Uma branch por lote, a partir da develop. Cada lote tem um comportamento e até 150 linhas de diff, testes incluídos.
- Prova de cada lote: a CI do push da branch verde, com os checks obrigatórios da develop (DEV-1), e os testes listados no lote. Depois vêm o review do tech-lead e o parecer do QA em `docs/qa/`. Quando há gatilho, entra também o parecer do security-engineer (`R-SEGURANCA`).
- Ordem: Lote 1, depois Lote 2, depois Lote 3. O Lote 4 sai depois do Lote 1 (os dois mexem em `dominio-acelerato.ts`) e só depois de o dono validar a tabela P-E10-2. Ele pode correr junto com os Lotes 2 e 3, que tocam outros arquivos. O Lote 5 (documentação) fecha o E10.
- Por que essa ordem: o Lote 2 exige uma versão para cada data de vigência nova. Sem o Lote 1, uma lista revertida pelo `ac:ref-sync` não gera versão, e a coleta recusaria um caminho legítimo.
- Versão de critério (T2.6): nenhum lote muda o cálculo de métrica, então nenhum registra versão própria. É o mesmo tratamento dado ao L3-a e ao L9-a (`docs/reviews/068-release.md:52`). O Lote 4 faz a marca das versões de lista aparecer nos gráficos.
- Migração: nenhuma em nenhum lote. Os papéis já têm os grants necessários: `dspd_coletor` lê `ref_` do core e do `dspd_ac` (`grants.ts:107,122`), e `dspd_ref` grava em `ref_` do core (`grants.ts:124`).

## Lote 1: lista revertida gera versão nova no `ac:ref-sync` (P-E10-4)
- **Comportamento:** quando o plano de sincronização muda alguma vigência, o `ac:ref-sync` sempre registra uma versão com `vigente_desde` igual à data da carga. Hoje ele registra uma versão por sha do arquivo (`dominio-acelerato.ts:180-182`), então voltar a um arquivo já visto não deixa data nova.
- **Referência nova:** `056:ref-dominio:<sha256>:<AAAA-MM-DD>` (91 caracteres, cabe em 200). A idempotência passa a ser por essa referência: repetir a mesma carga no mesmo dia não duplica. As versões antigas ficam como estão; nada é reescrito. Quem procura pelo prefixo `056:ref-dominio:` continua achando as duas formas.
- **Limite que já existe:** reverter no mesmo dia da mudança anterior continua recusado pela `planejarDominio` (`dominio-acelerato.ts:138-139`). A reversão vai com a data seguinte.
- **Arquivos:** `server/src/modulos/referencia/dominio-acelerato.ts` (`referenciaDaVersao(sha, dia)`, o comentário das linhas 155-159 e o ramo `mudou`). `server/src/entradas/ref-sync-ac.ts` não muda.
- **Testes:**
  - `server/tests/dominio-acelerato.test.ts:184`: referência com a data.
  - `server/tests/dominio-acelerato.pg.test.ts:48,62`: A, B e de novo A em três datas gera três versões; a mesma carga no mesmo dia gera uma; carga sem diferença não gera nenhuma.
  - `server/tests/acelerato-ca8-ref-sync.pg.test.ts:31`.
- **Migração:** nenhuma.
- **Versão T2.6:** nenhuma própria (não muda cálculo).
- **Gatilho de segurança:** sim (banco: escrita em `dspd_core` pelo `dspd_ref`). Parecer curto.
- **Prova:** CI do push verde e os três arquivos de teste acima.
- **Documentação junto:** `docs/architecture/server.md:220` (a referência e a regra "uma por hash").

## Lote 2: recusa do reconhecimento sem versão ou com sobrescrita (opção C, P-E10-1)
**Regra de recusa.** Vale só no ramo `reconhecerMudanca === true` (`coletor.ts:212-223`). Roda antes do desvio da P-E3-2 e antes de abrir a conexão MySQL. Para cada chave de lista que mudou em relação ao último sucesso e que existe na linha anterior:
1. Grupos e chaves:
   - `recorte_sha256` = `CAMPOS_RECORTE`;
   - `vocabulario_sha256` = `CAMPOS_VOCABULARIO` mais os `cpe_*` de `CAMPOS_ETAPA_F3` com tratamento `lista`;
   - `fluxo_sha256` = `etapa_fluxo`.

   Os nomes vêm das constantes de `controle.ts:32-33` e `listas-fechadas.ts:40-56`, nunca da entrada.
2. `D` é a data civil, em -03:00 (P-DS-2), do `finalizado_em` do último sucesso. Para isso, `ultimoSucesso` passa a ler também `finalizado_em` (`controle.ts:69-75`).
3. Datas novas do grupo: o conjunto das datas `vigente_de >= D` ou `vigente_ate >= D` das linhas do grupo em `dspd_ac.ref_dominio`.
4. Se não houver nenhuma data nova, a coleta recusa com `lista-sobrescrita` e `coluna` igual ao nome da chave. O hash mudou sem vigência nova: foi UPDATE de `rotulo` no lugar ou INSERT com data passada.
5. Para cada data nova, exige versão em `dspd_core.ref_versao_criterio` com `dominio = 'acelerato'`, `starts_with(referencia, '056:ref-dominio:')` e `vigente_desde` igual à data. Sem ela, a coleta recusa com `reconhecimento-sem-versao` e `coluna` igual ao nome da chave.
6. Na recusa, o caminho é o de hoje: linha de falha sem marca d'água (ADR 0006, `registrarFalha`, `controle.ts:103-114`) e o e-mail de falha. O erro leva só o nome da chave, nunca o valor.

**Isenção:** uma chave ausente na linha anterior não é conferida. É o caso da primeira coleta depois do deploy do E3, no mesmo molde de `coletor.ts:216`.

**Fora da regra:**
- `natureza_prefixo`: fora do CA-8 pela P-E3-1 (ver a pergunta P-E10-5);
- `campo_personalizado`: não tem leitor;
- chaves de código: Lote 3;
- host, banco, tabela e TLS: continuam livres.

**Limite aceito no desenho:** a data é só o dia, então uma edição direta no mesmo dia de um `ac:ref-sync` legítimo passa.

- **Arquivos:**
  - `server/src/modulos/acelerato/controle.ts`: `finalizado_em` e a consulta de vigências e versões; o comentário da linha 21 passa a dizer a verdade.
  - `server/src/modulos/acelerato/coletor.ts`: a chamada no ramo do reconhecimento.
  - `server/src/modulos/acelerato/erros.ts`: os dois códigos; a mensagem da linha 28 é corrigida.
- **Testes:**
  - Unitários, com duplo: lista mudada com a opção e sem versão recusa; com versão na data passa; sobrescrita recusa; chave ausente na linha anterior passa; a recusa acontece sem abrir conexão.
  - `.pg`: `ac:ref-sync` seguido de reconhecimento passa. INSERT direto pelo dono do schema recusa (`reconhecimento-sem-versao`). UPDATE de `rotulo` recusa (`lista-sobrescrita`). INSERT com `vigente_de` antigo recusa (`lista-sobrescrita`). Uma lista revertida pelo `ac:ref-sync` (Lote 1) passa. A contagem de staging e de `ref_dominio` é a mesma antes e depois da recusa.
  - O QA acrescenta um CT ao lado do CT-34 em `docs/qa/056-coletor-plano-de-testes.md`.
- **Migração:** nenhuma.
- **Versão T2.6:** nenhuma própria (é controle, não cálculo).
- **Gatilho de segurança:** sim (controle de coleta; leitura nova do core pelo `dspd_coletor`).
- **Prova:** CI do push verde e os testes acima.
- **Depende de:** Lote 1 na develop.

## Lote 3: versão de critério para SQL, colunas e campos, registrada no deploy (P-E10-3)
**Regra.**
- **Hashes na entrada:** a entrada de `CRITERIOS_ACELERATO` (`criterios-acelerato.ts:9-42`) ganha o campo opcional `codigo: { sql_sha256, colunas_sha256, campos_sha256 }`, com os hashes que o código tinha quando o critério foi escrito. O cálculo desses três hashes sai de `montarParametros` para uma função `hashesDoCodigo()` em `controle.ts`, usada pelo coletor e pelo teste.
- **Na CI:** um teste estático compara os hashes atuais com o `codigo` da última entrada que o tem. Mudar o SQL, as colunas ou os campos sem acrescentar uma entrada nova quebra a CI do push.
- **No deploy:** o migrador roda a entrada que já existe, `criterios-ac <AAAA-MM-DD>` (`server/src/entradas/criterios-ac.ts`; `docs/analises/066-desenho.md:46`), antes do reconhecimento. Ela grava a versão com a data do deploy e as métricas da entrada.
- **Na coleta:** com `--reconhecer-mudanca` e alguma das chaves `sql_sha256`, `colunas_sha256` ou `campos_sha256` mudada, a coleta procura a entrada cujo `codigo` é igual aos hashes atuais. Exige a `referencia` dela em `ref_versao_criterio` (`dominio = 'acelerato'`). Sem entrada ou sem versão gravada, recusa com `reconhecimento-sem-versao` (código do Lote 2) e `coluna` igual ao nome da chave.
- **Métricas da entrada:** quem muda o SQL declara as métricas afetadas. Quais são é decisão do dono a cada mudança, como nas entradas atuais. `metricas: []` só quando a mudança fica no staging (precedente: `069:L9-b-campos-etapa`).
- **Linha de base:** a entrada que corresponde aos hashes de hoje. O implementador acha pelo histórico (`git log -S` do arquivo de SQL e de `listas-fechadas.ts`) qual referência registrou a última mudança. A candidata é `069:L9-b-campos-etapa`, mas o L9-c pode ter mudado `campos`. Se nenhuma corresponder, ele para e devolve ao Jarvis: nada de versão retroativa por inferência.
- **Arquivos:**
  - `server/src/modulos/referencia/criterios-acelerato.ts`: o tipo e o `codigo`;
  - `server/src/modulos/acelerato/controle.ts`: `hashesDoCodigo`;
  - `server/src/modulos/acelerato/coletor.ts`: a conferência no ramo do reconhecimento.
- **Testes:**
  - `server/tests/criterios-acelerato.test.ts`: hash atual igual ao da última entrada com `codigo`; SQL alterado sem entrada nova falha.
  - `server/tests/acelerato-estatico.test.ts`.
  - Unitário do coletor: SQL mudado e reconhecido sem versão recusa; com versão passa; host mudado e reconhecido passa sem versão.
- **Migração:** nenhuma.
- **Versão T2.6:** nenhuma própria. O lote passa a exigir versão para as mudanças de código seguintes.
- **Gatilho de segurança:** sim (controle de coleta e passo de deploy).
- **Prova:** CI do push verde e os testes acima.
- **Roteiro de deploy:** `criterios-ac` antes do reconhecimento. É uma linha no roteiro da release: o tech-lead a escreve em `docs/engineering/fluxo-homologacao.md`, e o devops-engineer a confere.
- **Depende de:** Lote 2 (mesmo ramo do coletor e mesmo código de erro).

## Lote 4: vínculo de métricas por lista no `ac:ref-sync` (P-E10-2 e marca da P-E3-1)
- **Comportamento:** uma constante fechada `METRICAS_POR_CAMPO_AC` em `dominio-acelerato.ts`, no molde de `METRICAS_CALENDARIO` (`calendario.ts:31`), com o conteúdo que o dono validar na tabela abaixo. Na mesma transação da versão (Lote 1), o `ac:ref-sync` grava em `ref_versao_criterio_metrica` a união das métricas dos campos que aparecem no plano (`inserir` ou `fechar`). Com isso, `lerVersoes` (`operacao/repositorio.ts:49-53`) passa a devolver a versão, e a marca aparece nos gráficos sem mudança na API.
- **Arquivos:** `server/src/modulos/referencia/dominio-acelerato.ts` (a constante e as linhas de INSERT).
- **Testes:**
  - Todo campo de `CAMPOS_DOMINIO` tem entrada na constante, mesmo vazia.
  - Todo id está em `METRICAS_SUSTENTACAO`: nenhuma métrica do BusinessMap, porque as fontes não se misturam.
  - Em `.pg`: mudar só `natureza_prefixo` grava S8 e O17, e `lerVersoes('acelerato')` devolve a versão com `afeta`; mudar só `campo_personalizado` grava a versão sem métrica.
- **Migração:** nenhuma.
- **Versão T2.6:** nenhuma própria. O lote faz aparecer a marca das versões de lista seguintes, o que cumpre a P-E3-1. As versões `056:ref-dominio` já gravadas ficam sem marca (pergunta P-E10-6).
- **Gatilho de segurança:** sim (escrita em `dspd_core`).
- **Prova:** CI do push verde e os testes acima.
- **Depende de:** Lote 1 e a validação do dono da tabela P-E10-2.

## Lote 5: documentação do E10 (software-architect, com review)
- ADR 0023 §6: o reconhecimento exige versão pela opção C e pela P-E10-3; a lista revertida é mudança nova.
- `docs/architecture/fontes/acelerato-listas.md`: editar lista só pelo `ac:ref-sync`; reverter vai com data nova; `cpe_*` só depois de o carregador aceitá-los (A3 de `docs/reviews/069-l9-etapa.md:40`).
- `docs/architecture/data-model.md` §4, se listar as chaves de `parametros`.
- Sem código e sem migração. Versão T2.6: não se aplica. Gatilho de segurança: não. Prova: `docs:check` na CI do push.

## Divisão por agente
| Lote | Implementa | Review | QA | Segurança | Outros |
|---|---|---|---|---|---|
| 1 | node-backend | tech-lead | qa-engineer | security-engineer | |
| 2 | node-backend | tech-lead | qa-engineer (CT novo ao lado do CT-34) | security-engineer | |
| 3 | node-backend | tech-lead | qa-engineer | security-engineer | devops-engineer (passo do deploy) |
| 4 | node-backend | tech-lead | qa-engineer | security-engineer | dono valida a tabela antes |
| 5 | software-architect | tech-lead | qa-engineer (`docs:check`) | | |

O QA prepara os testes de cada lote enquanto o lote é implementado.

## Proposta P-E10-2
Quais métricas de sustentação mudam quando muda cada lista, para marcar os gráficos (T2.6). A tabela vale também para a marca da P-E3-1 (`natureza_prefixo`). As métricas do Acelerato são as de `METRICAS_SUSTENTACAO` (`packages/contratos/src/metricas.ts:167-183`): S1 a S12, mais O17, EI_SUST e TENDENCIA_SUST. Hoje têm dado real S2, S3, S4, S8 e S10 (`origem.ts`). Marcar as outras não tem efeito até elas saírem do mock. Os caminhos de `packages/` são de `packages/metricas/src/acelerato/`, e os do server, de `server/src/modulos/acelerato/`.

| Grupo de lista | Campo | O que o campo decide | Métricas afetadas | Base |
|---|---|---|---|---|
| Recorte | `tipo_recorte`, `organizacao_recorte`, `equipe` | Quais chamados entram na base (WHERE da Q1 e CA-11) e o filtro de equipe | Todas: S1 a S12, O17, EI_SUST, TENDENCIA_SUST | `controle.ts:32`; `allow-list.ts:94-100`; `indice.ts:86`; `comum.ts:30-34`; P-E3-2 (releitura do recorte) |
| Vocabulário | `etapa` | Etapa do chamado e das etapas do fato: pausa no MTTR, nível de resolução, pendência, fila | S1, S4, S5, S9, S10 | `allow-list.ts:113,136`; `normalizador.ts:155,167`; `indice.ts:72-81`; `s4.ts:43`; `s5.ts:23`; `s9.ts:30`; `s10.ts:26` |
| Vocabulário | `prioridade` | Faixa P1 a P5 | S1, S2, S3, S4, S10, S11, EI_SUST, TENDENCIA_SUST | `allow-list.ts:114`; `normalizador.ts:153`; `s1.ts:39`; `s2.ts:43`; `s3.ts:28`; `s4.ts:38`; `s10.ts:37`; `s11.ts:22`; `ei.ts:37`; `tendencia.ts:33` |
| Vocabulário | `categoria` | Sistema e, pelo prefixo, a natureza | S8, S12, O17 | `allow-list.ts:115`; `normalizador.ts:151,163`; `s8.ts:23`; `s12.ts:37`; `o17.ts:21-24` |
| Vocabulário | `descricao_workflow` | Só o staging da etapa | Nenhuma | `allow-list.ts:137`; o projetor não lê o campo (`projetor.ts:74`) |
| Vocabulário | `cpe_motivo_escalacao` | Motivo da escalação | S5 | `normalizador.ts:181`; `s5.ts:31` |
| Vocabulário | `cpe_motivo_encerramento` | Motivo de encerramento (contorno, "não é incidente") | S6, S7, S11 | `normalizador.ts:182`; `s6.ts:25`; `s7.ts:29`; `s11.ts:20` |
| Vocabulário | `cpe_avaliacao_problema` | Avaliação de Problema | S11 | `normalizador.ts:183`; `s11.ts:26` |
| Vocabulário | `cpe_motivo_pendencia` | Motivo da pendência | S9 | `normalizador.ts:184`; `s9.ts:34`; `indice.ts:75` |
| Vocabulário | `cpe_prioridade_ajustada` | Ajuste manual de prioridade | S3, S7 | `normalizador.ts:180`; `s3.ts:39`; `s7.ts:27` |
| Vocabulário | `cpe_suporte_acionado`, `cpe_tipo_prioridade` | Nada no cálculo hoje | Nenhuma | O normalizador não os projeta (`normalizador.ts:180-185`) |
| Fluxo | `etapa_fluxo` | Qual valor de campo de etapa vale quando o campo se repete | S5, S6, S7, S9, S11 e, proposto, S3 | Versão `069:L9-c-ordem-fluxo` (`criterios-acelerato.ts:37-40`). S3 entra porque `prioridade_ajustada` também é campo de etapa (`s3.ts:39`) e a L9-c não a listou: o dono confirma |
| Natureza | `natureza_prefixo` | Incidente ou requisição | S8, O17 | `projetor.ts:37-44`; `normalizador.ts:151`; `s8.ts:23`; `o17.ts:21` |
| Fora dos grupos | `campo_personalizado` | Nada | Nenhuma | Sem leitor (`073-e3-desenho.md` §2) |

**Recomendação:** vínculo por campo, não por grupo. Pela união do grupo, o vocabulário marcaria as 15 métricas a cada mudança de `descricao_workflow`, que não entra em cálculo nenhum. Os `cpe_*` hoje não carregam pelo `ac:ref-sync` (`CAMPOS_DOMINIO` não os tem; A3 de `docs/reviews/069-l9-etapa.md:40`): as linhas deles passam a valer quando o carregador os aceitar.

## Perguntas ao dono (regra de negócio)
- **P-E10-2 (validação):** a tabela acima vale como está? A granularidade é por campo (recomendada) ou por grupo? S3 entra na `etapa_fluxo`?
- **P-E10-5:** `natureza_prefixo` editado direto no banco escapa da recusa da opção C. A P-E3-1 diz que a mudança de natureza não para a coleta; a P-E10-1 diz que a edição direta não é aceita. A projeção deve recusar até a lista voltar pelo `ac:ref-sync`, ou só contar e avisar sem parar?
- **P-E10-6:** as versões `056:ref-dominio` já gravadas, sem métrica, ganham o vínculo agora, com datas passadas reconstruídas pelas vigências de `ref_dominio`? O vínculo só acrescenta linhas, nada é reescrito. Ou a marca vale só daqui em diante?
