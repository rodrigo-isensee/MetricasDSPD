# Decisão do usuário — fluxo de homologação (2026-10-12)

O usuário aprovou o desenho de docs/engineering/fluxo-homologacao.md como recomendado:
- `feature/*` → `develop` (PR, squash) → `homolog` (PR, merge commit) → `main` (PR, merge commit; só o usuário mescla). Nada pula degrau; ninguém commita direto em `homolog` ou `main`; defeito achado em homolog volta por `fix/` → `develop`.
- Gates: PR para develop = rapida, testes, build, e2e (banco por filtro); PR para homolog = suíte completa (banco, openapi, imagem, perf, Lighthouse) + deploy no ambiente + `homolog-e2e`; para a main = checks atuais + `homolog-aprovada` (SHA = HEAD de homolog, e2e verde e uma noite em homolog sem falha) + aprovação do usuário.
- Quem mescla: tech-lead mescla em develop e homolog (Jarvis abre o PR); o usuário mescla na main.
- Versão SemVer: tag `-rc` em homolog, tag final na main; CHANGELOG gerado dos Conventional Commits, revisado no PR para a main.
- Hotfix sai da main com aprovação do usuário e volta a homolog e develop por PR de merge; rollback por `git revert -m 1` e reimplantação da tag anterior; nunca reset/force.
- Ambiente: ver docs/architecture/features/homologacao.md (decisões pendentes à parte).
- H-5: sem rotina noturna local por enquanto; o portão de homologação e a rodada noturna são agendamentos na CI hospedada (gratuita); o ambiente local sobe sob demanda (`homolog:subir`). Com dado real (só local), reavaliar o Agendador do Windows.
- Vale o fluxo aprovado `develop` → `homolog` → `main` (a proposta do arquiteto de PR direto para homolog foi substituída). A ADR do ambiente será renumerada para não colidir com a 0017 do Acelerato.
- H-2: documentação segue o mesmo caminho; em homolog roda só `docs:check`.
- H-4: release sob demanda, por entrega fechada, depois de uma noite verde em homolog.
- H-8: validação manual do usuário só quando a release muda a interface (roteiro curto de conferência).
- H-6: Git corporativo = GitHub corporativo (confirmar runners após a migração).
- H-7: dado real em homolog só na máquina do usuário, nunca na CI hospedada, com backups cifrados e retenção de 24 meses; só depois das integrações e das regras de LGPD (allow-list e redação) implementadas e testadas. Até lá, só mock.
- H-1/H-3: conforme o fluxo aprovado (tech-lead mescla em develop e homolog; hotfix sai da main com aprovação do usuário).
- I5 (identidade): conta de serviço (bot) para os agentes no GitHub corporativo, com escrita e sem permissão de mesclar na `main` (o ruleset da `main` exige aprovação/merge do usuário). Até a migração, os agentes seguem na conta do usuário e a proteção é o prompt de permissão do `gh pr merge` + a regra dos agentes, com I1–I4 corrigidos.
