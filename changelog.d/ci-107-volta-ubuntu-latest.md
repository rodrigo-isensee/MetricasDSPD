---
tipo: ci
---
CI de volta ao GitHub (ubuntu-latest): com o repositório público, os runners hospedados não custam nada. Os jobs, o container do Playwright, o job migracao-smoke e o Postgres em `docker run` da restauração voltam ao que eram antes do 107; os runners próprios são desligados depois do merge.
