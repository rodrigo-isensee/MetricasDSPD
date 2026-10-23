# ENV-025-001 - Chromium do Playwright não abre: falta libnspr4.so
- Severidade: média (bloqueou o reteste do 025; não era defeito do produto). Estado: corrigido no ambiente (dono instalou as dependências; chrome-headless-shell 1248 abre sem "not found" no ldd)
- Responsável sugerido: dono da estação (instalação de pacote do sistema com sudo)
- Ambiente: feature/025-front-taticas em 43f29b3, WSL2, node 24.22.1, chromium-1248

## Passos para reproduzir
1. `E2E_PORTA=4283 E2E_PORTA_ALT=4284 bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm exec playwright test --project=chromium-api --retries=0 tests-api/tatico-011-lote2.spec.ts'`

## Resultado esperado
Os 19 testes abrem o Chromium e rodam.

## Resultado obtido
Todos falham em `browserType.launch`: `chrome-headless-shell: error while loading shared libraries: libnspr4.so: cannot open shared object file` (exit 127).

## Evidência
Log do Playwright acima; `find / -name 'libnspr4*'` só acha a DLL em `/mnt/c/Program Files/Fortinet`. Correção: `pnpm exec playwright install-deps chromium` com sudo.
