# Pedido 080: testes instáveis da web (K-173 e K-192)

- **Modo:** implementar
- **Objetivo:** tirar a instabilidade de dois testes da web que já derrubaram checks sem mudança de código: o teste do O20 que lê o SVG de forma síncrona (K-173) e o E2E L3-01 que falha no axe target-size do leia-junto do O15 (K-192)
- **Clareza:** 0 confirmado; 2 técnico; 1 suposição; 0 perguntas
- **Depende de:** —

## Escopo
- E1. K-173: o teste do O20 que lia o SVG de forma síncrona (operacionais.test.tsx:177 no 026; o arquivo mudou desde então) espera a renderização antes de ler; se o teste já não existir ou já estiver estável, registrar a evidência e fechar o cartão sem código · `técnico`
- E2. K-192: o E2E L3-01 (`e2e/tests/operacional-lote3.spec.ts`, axe target-size em `leia-junto-o15`) deixa de falhar de forma intermitente, corrigindo o alvo de toque na tela (não afrouxando a regra do axe) · `técnico`

## Etapas
- E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque).
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela.
- E1.5 (tech-lead): PR para a develop, depois do QA.
- E1.6 (agile-coach): retrospectiva do pedido 080.

## Fora do escopo
- Desligar regra do axe, aumentar timeout ou acrescentar retry · `técnico`
- Outros testes instáveis (cartões K-174 e K-120) · `técnico`

## Suposições
- Os dois cartões ainda valem na develop atual (852b9406); o react-frontend confirma antes de mudar. Base: K-173 de 2026-10-28 e K-192 de 2026-10-31, sem registro de correção. Muda com: teste já corrigido por outro PR (o item fecha com a evidência). Custo de reverter: baixo.

## Perguntas na fila

## Histórico
- 2026-11-07 07:38: pedido aberto (Jarvis) pela autonomia de melhoria técnica do projeto (cartões K-173 e K-192, testes instáveis que derrubaram checks); não muda produto, não afrouxa portão, não custa dinheiro; sem recibo ao dono, aviso no resumo da manhã. Lote por arquivo: os dois são testes da web do mesmo papel. Sem gatilho de segurança. Worktree 056d (HEAD destacado em f21220fe, limpa), branch feature/080-testes-instaveis-web da develop 852b9406.
- 2026-11-07 07:40: Brief react-frontend-1 aprovado e delegado (056d).
