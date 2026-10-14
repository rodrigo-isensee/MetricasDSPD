# IF-002 - Marcar todas as opções em sequência rápida ainda deixa o parâmetro na URL (resíduo do 004 / FIL-04)
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: main @ 0af552a, `vite preview` (latência simulada padrão), Chromium 1248, 1280x800
- Relação: **duplicado de IS-003** (QA sistêmica, mesma causa). Este registro só acrescenta uma reprodução nova: na Sustentação, com 3 cliques, sem carga artificial na máquina. Corrigir junto com o IS-003 e com o IF-001 (mesma família: ação nova partindo de estado velho).

## Passos para reproduzir
1. Abrir `/sustentacao`.
2. Abrir **Equipe** e clicar **SSSC TOTVS**, **SSSC SENIOR** e **SSSC FLUIG** em sequência, sem pausa.

## Resultado esperado
Todas marcadas = "Todas": o parâmetro `equipe` sai da URL e o botão mostra "Equipe: Todas" (FIL-04, spec 2.5).

## Resultado obtido
`equipe` continua na URL depois do terceiro clique (`expect.poll` de 5 s esgotado). Com 800 ms entre os cliques funciona.

## Causa provável
Em `FiltroMulti`, o `useEffect` que ressincroniza `atual.current` com a prop `selecionados` roda quando chega o render de uma URL **intermediária** (a do primeiro clique) e sobrescreve a seleção mais nova que já tinha sido emitida pelo segundo clique; o terceiro clique parte dela e perde uma marcação. Mesma família do IF-001.

## Evidência
`e2e/tests/intensivo-filtros.spec.ts` IF-I01 (caso `/sustentacao equipe`): `Expected: false` / `Received: true` para `searchParams.has('equipe')`. Os casos de fluxo (6 equipes, 6 tipos, 8 sistemas) e de prioridade passaram na mesma execução; o defeito depende do tempo de render.

## Correção
- Correção: 935e51a (fix(web): filtros na URL partem do estado vigente, URL canônica e aviso de período inválido); fb7dcb4 (fix(web): FiltroMulti mostra a última marcação do usuário)
