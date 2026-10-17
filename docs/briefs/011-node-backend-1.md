## Objetivo
Implementar o back da fase 2 do pedido 011 em mock, E6, T13, O22, O26 e E7 com R$ (E1) e, em seguida, E8 e T14 com a R-1 = B (E2). É o caminho para o front das 17 métricas, prioridade do usuário. Cartão K-103, worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, branch `feature/011-fase2-back` (hoje igual à develop, b73bad3 depois de atualizar).

## Ler
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: "Decisões do usuário" e "Retomada 2026-10-17".
- `docs/architecture/features/metricas-tambem-disponiveis.md`: §1, as subseções de §2 do O22, O26, T13, E6 e E7, §3, §4 e §5 "Fase 2".
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`: seções "Decisão" e "Consequências".
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: só os CAs citados no plano para essas cinco métricas.
- `docs/engineering/praticas.md`, seção de commits.

## Entregar
- (E1) Antes, `git merge --ff-only origin/develop` na branch (está sem commits próprios).
- (E1) E6 `datasProjeto`, T13 `vinculos`, O22 `primeiroToque`, O26 `passagens` (com `houveTroca` e property test, chave `'faixa-passagens'`) e E7 com R$ por fixture, como no plano §2, §4 e §5 "Fase 2": contrato, cálculo pela biblioteca compartilhada, mock, testes e entrada em `COM_EXTENSAO_MOCK`.
- (E1) As decisões já tomadas pelo usuário valem no código: Q-a = 1 passagem e Q-b = conta (O26); Q-E7-1 = pró-rata por dias corridos (E7). Elas saem de `pendente-usuario` em `REGRAS_METRICA`.
- (E1) Documentação afetada na mesma entrega: `docs/api` (contratos e blocos de mock) e `docs/tecnica`, onde o plano manda.
- (E2) Depois do E1: E8 `conhecimentoSistema` e T14 `equipeResponsavel`, com a decisão R-1 = B (o E8 mostra só a contagem de sistemas com 1 pessoa, sem nomear os sistemas; na T14, "outros times" oculto quando somar menos de 2 pessoas, mostrando só "meu time: k de n"). Pré-condição: a ADR 0020 e o plano já registram a R-1 = B (E3.1, forge:software-architect, em paralelo); confira com `grep -n -E "R-1 = B" docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` no diretório principal. Se ainda não registram, pare depois do E1 e relate.
- Commits por métrica ou lote, `git add` por caminho, sem push.
- Fora do escopo, outros itens do pedido 011 (etapas de outros papéis, citadas de "### Etapas"): "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E4.1 (forge:react-frontend): front, depois do K-102."
- Fora do escopo, etapas seguintes (citadas de "### Etapas"): "E1.2/E2.2 (forge:tech-lead): code review."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2."; "E9.1 (forge:tech-lead): PR para a develop e promoção para a homolog."
- Fora do escopo (do pedido, "### Fora do escopo"): "Fase 3 (coleta real, K-100, guarda B-K1, releitura da ADR 0020 pelo security-engineer)."

## Decisões e restrições
- Regras invioláveis do `CLAUDE.md`: nada de pessoa em contrato nem em agregado; BusinessMap e Acelerato nunca juntos; story, frente e projeto nunca no mesmo histograma; menos de 20 itens, sem estatística; todo cálculo pela biblioteca (ADR 0011).
- Decisões do usuário (pedido 011, "Decisões do usuário", 2026-10-14 e 2026-10-16): R-1 = B (E8 e T14, acima); T14 nova = A (os outros times sempre somados em "outros times", nunca listados nem ordenados); Q-T14-5 = D (aparecem os projetos ligados a um sistema do meu time, `ConfigBM.equipes[].sistemas`, inclusive com 0% de atuação, e qualquer projeto com pelo menos 1 card do meu time); Q-T14-6 = A ("outros times" publicado mesmo com um único outro time, sem nome, tempo, vazão nem ranking), com o refinamento posterior R-1 = B (2026-10-16): oculto quando os outros times somarem menos de 2 pessoas; R-2 = B (`fato_transicao.usuario` desativada; a migração já foi mesclada no #88, nada a fazer aqui); Q-a = 1 passagem; Q-b = conta (1 passagem); Q-E7-1 = pró-rata por dias corridos; D-5' = B (O26); D-1' = A (E7, custo total do DSPD rateado, horas apontadas não entram); D-14' e R-4 do T13 conforme o plano §2 T13.
- ADR 0020 vigente para a fase 2: o O22 e o O26 saem como contagem, sem id de usuário. Não crie `pessoa`, `responsavel` nem `equipe` em `ChaveSegmentacao`.
- Orçamento de performance: ADR 0003 (C4 e C6). Meça o C4 do Operacional antes e depois.
- Dúvida de regra de negócio que os documentos não decidem: pare e relate como pergunta, não decida no código.
- NÃO tocar: `web/`, `.github/`, na `main` nem em migrações de banco. Sem `--no-verify`.
- Tarefas pesadas uma por vez (R-TETO): confira `uptime` e `free -m` antes do pronto.

## Pronto quando
- PQ-1 (sha): commits das sete métricas (E1 e E2) em `feature/011-fase2-back`.
- PQ-2 (cmd): `pnpm run pronto`, rodado da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short` · espera: linhas=0
- PQ-4 (cmd): `grep -r -o -h -E "(E6|T13|O22|O26|E8|T14)" docs/api | sort -u | wc -l` · espera: igual '6'
- PQ-6 (cmd): `grep -r -n -i "custoPorDemanda" docs/api` · espera: linhas>=1
- PQ-5 (cmd): `grep -rn "pendente-usuario" packages/metricas/src | grep -E "Q-a|Q-b|Q-E7-1"` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (inclui a medida do C4 antes e depois); riscos; mudanças de contrato. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
