### Alterado

- CI: o passo de cobertura do ci.yml e do homolog.yml imprime `nproc`, `free -m` e `uptime` antes de rodar, e o web passa a rodar em passo próprio (com `time`), depois dos demais pacotes; a espera de 15 s (METRICAS_DSPD_ESPERA_ASYNC_MS) vale só nesse passo. Motivo: separar o tempo e a carga do web para achar a causa da lentidão do runner (K-405); o resumo e o artefato continuam lendo `*/coverage`, nenhum teste pulado, sem retry nem continue-on-error (pedido 105, E7.546).
