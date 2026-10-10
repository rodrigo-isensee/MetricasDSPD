# 006 - setup-chromium-local.sh não baixa as libs quando apt-file não existe
- Severidade: baixa
- Responsável sugerido: qa-engineer (corrigido em e2e/scripts/setup-chromium-local.sh)
- Ambiente: develop @ 252bed4, vite preview (VITE_MOCK_LATENCIA=0), Chromium 1280x800

## Passos para reproduzir
1. Rodar eval "$(bash e2e/scripts/setup-chromium-local.sh)" em WSL sem apt-file.

## Resultado esperado
Baixar as libs com apt-get download e exportar LD_LIBRARY_PATH.

## Resultado obtido
Com set -euo pipefail o pipeline de apt-file derruba o script antes do fallback; nada é baixado e o Chromium não abre (libnspr4.so ausente). Contorno usado: apt-get download libnspr4 libnss3 libasound2t64 e dpkg-deb -x em ~/.local/chromium-libs/root. Ferramenta de teste: QA pode ajustar (e2e/scripts).

## Evidência
Saída do script; sem arquivo.
