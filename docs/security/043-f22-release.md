---
tipo: revisao-seguranca
contrato: 1
pedido: 043-forge-f21-f22
branch: melhoria/MetricasDSPD-f22-release
commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-27
---
# Parecer de segurança: F22, PR de release da homologação para a main (texto)

Escopo: commit 0b59505 no clone de contribuição do Forge (worktree f22), sobre `origin/develop` 41ba611; 4 arquivos de texto (`docs/regras/R-FLUXO.md`, `skills/ci-cd/SKILL.md`, `agents/tech-lead.md`, `changelog.d/MetricasDSPD-f22-release.md`). Análise estática e só leitura; nada foi executado nem alterado. Modelo de ameaças: `docs/security/043-forge-f21-f22-ameacas.md` (seção F22). Nenhum workflow, hook ou script alterado (não reabre o modelo). Ferramentas de varredura: não aplicáveis a texto; o review já registra `verificar-contribuicao.sh` sem segredo nem caminho pessoal.

## Conferência de N1 a N6
- N1 (PR alheio, fork, mais de um): `R-FLUXO.md:15` lista com `--base main --head homolog --state open` e pede `isCrossRepository` falso, `baseRefName` igual a `main` e autor esperado; mais de um, fork ou autor inesperado: parar e levar ao Jarvis, sem editar. Resumo em `agents/tech-lead.md:33`. Atende (ressalva em A1).
- N2 (troca de base): `R-FLUXO.md:15` limita a edição a título e corpo e proíbe `--base`, `--head`, `--add-reviewer`, estado e rascunho; base errada: fechar e levar ao Jarvis. Atende.
- N3 (mesclar, `--auto`, push na main): `R-FLUXO.md:15` e `agents/tech-lead.md:33` dizem que o tech-lead cria ou edita e para; `gh pr merge`, `--auto` e push na main são do usuário, citando `R-MAIN`. Atende. Busca por `merge`, `--auto`, `--base`, `--force`, `--no-verify` no texto novo: só ocorrem em proibição.
- N4 (injeção e vazamento no corpo): `R-FLUXO.md:15` exige `--body-file`, nunca `--body` com texto interpolado, e corpo só com resumo e links, sem segredo, dado pessoal nem log bruto. Atende.
- N5 (contornar o portão): `skills/ci-cd/SKILL.md:45` abre o PR só com o portão verde no sha do candidato; o check de promoção decide naquele sha; pendente é esperar e reexecutar o mesmo sha, nunca marcar aprovado nem afrouxar (`R-CONFORMIDADE`); não fechar e recriar para limpar o vermelho. Atende; nada afrouxa portão.
- N6 (edição tardia, erro do `gh`): `R-FLUXO.md:15` diz que erro do `gh` não é "sem PR" (só cria com listagem concluída e vazia) e pede uma linha no corpo quando o usuário já viu o PR. Atende.
- R-NEUTRO e R-MAIN: nenhum dado do projeto no texto (o nome do fragmento segue a convenção da skill); R-MAIN e R-FLUXO citados por ID, não reescritos; a main permanece do usuário.

## Achados
- A1 (recomendado) docs/regras/R-FLUXO.md:15 · "autor esperado" não nomeia quem é; sem isso o conferente do agente fica sem critério objetivo para o campo de autor da N1. Caminho de ataque: PR de outro colaborador com head `homolog` no mesmo repositório passaria como esperado. Correção mínima: nomear (o usuário ou a conta do tech-lead do projeto), como já apontou o review (A2). Não devolve a entrega; dono: devops-engineer/tech-lead na próxima rodada.

## Riscos aceitos
Nenhum solicitado. Risco residual baixo, já previsto no modelo: o cumprimento depende do texto (sem hook); falha na medida da análise E2.1 leva à opção B.

## Veredito
Aprovado: N1 a N6 atendidas sobre o commit 0b59505, sem achado bloqueante.
