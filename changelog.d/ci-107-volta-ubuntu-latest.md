### Alterado

- CI: de volta ao GitHub (`ubuntu-latest`) por decisão do dono, com o repositório público (os runners hospedados não têm custo). O ci.yml, o homolog.yml, o restauracao.yml, a action do Playwright e o `artefatos.test.ts` voltam exatamente ao estado de antes do pedido 107: `services: postgres`, `container:` do Playwright, gitleaks em contêiner e o job único `migracao-smoke`. Os runners próprios são desligados depois do merge.
