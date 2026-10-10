# Gate do autor

Verificação que o dev roda antes de mover o cartão para review e cola a saída no cartão.

```
cd web && npm run check && npm run build
cd ../e2e && npm run gate
```
Encadeia: `verificar-fronteiras.mjs` (BM x AC, ADR 0001/0002), `hash-base-mock.mjs --comparar docs/qa/evidencias/hash-base-fase-a.json` (sem `--salvar`; a base mock não pode mudar sem decisão registrada) e `tamanho-bundle.mjs` (lê `web/dist`, limites do ADR 0003). Saída: resumo por etapa e linha final `GATE DO AUTOR: APROVADO|REPROVADO`; código de saída 1 se reprovar. Se a mudança do hash for intencional, regenerar a referência com `npm run hash-base -- --salvar ...` e registrar a decisão no cartão.

## Chromium sem sudo (WSL)
Se o Playwright acusar libs ausentes: `cd e2e && eval "$(bash scripts/setup-chromium-local.sh)"` (baixa os .deb com `apt-get download`, extrai em `~/.local/chromium-libs`, exporta `LD_LIBRARY_PATH` na sessão). Requer só rede e apt; não usa sudo. `CHROMIUM_LIBS_DIR` muda o destino. O export vale só para o shell atual.

## Aceitação de regra de produto
Casos por cartão em `docs/qa/aceitacao/<cartão>.md` (o dev os transforma em Vitest dentro de `web/`, no cartão).
