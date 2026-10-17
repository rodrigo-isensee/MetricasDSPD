# Pedido 027 — Branch das táticas atualizada com a develop e B11-001

- **Data:** 2026-10-17
- **Origem:** lote 2 do back da fase 2 do 011 (decisão do usuário de 2026-10-17: lotes por nível). O lote 1 entrou na develop por squash (#105, 1607a5f); a `feature/011-fase2-taticas` saiu da branch das estratégicas e precisa trazer a develop. B11-001 = sim (usuário, 2026-10-17): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços.
- **Modo:** implementar.

## Escopo
- **E1:** trazer a `origin/develop` para a `feature/011-fase2-taticas`, resolvendo os conflitos nos arquivos comuns (`METRICA_IDS`, `REGRAS_METRICA`, OpenAPI, fotografias) sem mudar o que o lote 2 faz.
- **E2:** B11-001: normalizar o nome do fornecedor no T10 (caixa e espaços) antes de agrupar, com teste.

## Etapas
- E1.1 (forge:node-backend): branch das táticas atualizada com a develop e o B11-001, com o pronto verde e push.

## Fora do escopo
- Review, segurança e QA do lote 2 (revalidação depois desta entrega); o PR (pedido 022).
