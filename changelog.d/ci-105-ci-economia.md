### Desempenho

- CI: o push só dispara em `develop` e `homolog`; branch de trabalho roda o CI pelo PR, sem duplicar o run (medido: 820 min em push duplicado). Em mudança só de documento (`.md` em `docs/`, `.md` da raiz e `changelog.d/`) em PR para `develop` ou push em `develop`, os jobs `build`, `openapi`, `imagem` e `e2e` ficam pulados e o `testes` roda só `spec:check` e `docs:check`; release, homolog, agendamento e dispatch rodam inteiros. Nenhum check exigido some, portão e `homolog-aprovada` iguais, sem retry nem `continue-on-error`, custo zero (pedido 105, E7.594).
