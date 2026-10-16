# SNO-002 - "Leia junto" entre visões: o nome acessível não contém o texto visível (WCAG 2.5.3)
- Severidade: baixa
- Responsável sugerido: react-frontend (`web/src/features/complementares/LeiaJunto.tsx`, linhas do `aria-label`)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`, HEAD 67624ba, Chromium

## Passos para reproduzir
1. Abrir `/operacional?cadencia=semanal` e rolar até o cartão O15.
2. Inspecionar o link do "Leia junto" para o O17.

## Resultado esperado
O nome acessível começa pelo texto visível (2.5.3 Rótulo no nome, nível A): quem usa comando de voz diz o que lê na tela e acerta o link.

## Resultado obtido
- Texto visível: `O17 Defeitos por causa raiz e sistema · visão Sustentação, fonte Acelerato`.
- Nome acessível (`aria-label`): `O17 Defeitos por causa raiz e sistema, abre Mais métricas da visão Sustentação, fonte Acelerato`.
O texto visível não é subcadeia do nome acessível (o trecho ` · visão` vira `, abre Mais métricas da visão`). Só o link entre visões tem o problema; os demais ("T1 Aderência", `abre Mais métricas deste painel`) preservam o texto visível no início.

## Evidência
O E2E `SIS-CONS-02` (`e2e/tests/intensivo-sistemico.spec.ts`) localizava o link pelo texto visível e travou até o teto de 300 s: `getByRole('link', { name: 'O17 ... · visão Sustentação, fonte Acelerato' })` não encontra o elemento. O QA passou a localizar pelo código no início do nome (`^O17 `), para o teste seguir provando o destino.
O axe não aponta (a regra `label-content-name-mismatch` é experimental e fica desligada nas tags WCAG 2.2 AA da suíte).

## Sugestão de correção
`aria-label` = texto visível + complemento: `O17 Defeitos por causa raiz e sistema · visão Sustentação, fonte Acelerato. Abre Mais métricas da visão Sustentação.`

## Reverificação
Fechado em 2026-10-15 (HEAD 140a60d): nome acessível começa pelo texto visível; teste de unidade vermelho no código antigo e verde no atual; E2E CA-18 verde.
