---
tipo: review
contrato: 1
pedido: 094-lote-testes-e-guia
branch: docs/k265-guia-pronto
commit: 26511df5e66390a1b6fa5e0c3f77c8c8b1a3192b
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-265, guia do desenvolvedor alinhado ao pronto uma vez antes do commit final

Intervalo: `18701297..26511df5` (base develop 18701297fd058a6cf420c6361c08a264871dfc87). Classe T, só documentação: 1 linha trocada em `docs/engineering/guia-do-desenvolvedor.md` (linha 44, tabela de comandos).

## O que foi conferido
- **Mesmo sentido do `praticas.md`** (seção 9, item "Autores", linha 117): durante o desenvolvimento, só testes e typecheck do pacote alterado; `pnpm run pronto` completo, verde, uma vez, antes do commit final da branch; commit só de parecer não é o commit final. O texto novo do guia repete os três pontos e cita a mesma decisão do dono (2026-10-21, pedido 026).
- **Não afrouxa:** o pronto completo continua obrigatório e verde antes do commit final; o CI segue com a suíte inteira. O texto antigo ("antes de cada commit") era mais rígido que a decisão do dono e divergia do `praticas.md`; o novo remove a divergência sem abrir exceção nova.
- **Não contradiz o resto do guia:** a linha 115 ("Aceitação: `pnpm run pronto` e `pnpm run gate` verdes, saída colada no cartão; move para Code review") é o momento do commit final e fica coerente; a linha 155 (job `testes` do CI) não muda.
- **Commit:** Conventional Commits em português, escopo `engenharia`, `Cartão: K-265` e linhas de atribuição no corpo.
- Regras "ferramenta": não há código nem teste no diff; `docs:check` roda no CI do PR.

## Achados
Nenhum.
