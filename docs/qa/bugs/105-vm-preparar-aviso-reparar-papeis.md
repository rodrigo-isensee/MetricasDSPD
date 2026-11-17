# 105-vm-preparar-aviso-reparar-papeis - aviso manda o dono da VM rodar script de desenvolvimento
- Severidade: baixa
- Responsável sugerido: devops-engineer (texto do roteiro) ou node-backend (aviso do migrar)
- Ambiente: fix/105-vm-criterios-ac, e0b84358; Postgres 17 descartável com o 00_papeis_e_banco.sql aplicado

## Passos para reproduzir
1. Aplicar o `00_papeis_e_banco.sql` (webhook, automação e pesquisa ficam NOLOGIN, sem CONNECT, por desenho).
2. Rodar `pnpm run vm:preparar` (ou o serviço `migrate`).

## Resultado esperado
Nenhum aviso que contradiga o roteiro, ou o roteiro explicando que o aviso é esperado na VM.

## Resultado obtido
Toda subida imprime `Aviso: sem CONNECT neste database: dspd_webhook, dspd_automacao, dspd_pesquisa. Rode docker/postgres/reparar-papeis.sh como administrador.` O roteiro (`docs/devops/105-implantacao-vm.md`) não menciona o aviso nem diz que é esperado; o script é do Compose de desenvolvimento.

## Evidência
Saída das subidas 1 e 2 no parecer docs/qa/105-vm-preparar.md. O `vm:preparar` termina com rc 0.
