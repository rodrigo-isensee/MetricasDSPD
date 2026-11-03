#!/bin/bash
# Uso: aviso-falha.sh <unidade>. Chamado pelo OnFailure= das unidades de coleta; manda e-mail ao dono (AVISO_EMAIL, vem do host).
# Corpo: nome da unidade, hora e as ultimas linhas do journal da unidade (a saida da coleta e JSON de contagens, sem segredo).
set -euo pipefail
unidade="${1:?uso: aviso-falha.sh <unidade>}"
case "$unidade" in metricas-coleta-*.service) ;; *) echo "unidade invalida" >&2; exit 2 ;; esac
destino="${AVISO_EMAIL:?AVISO_EMAIL ausente em /etc/metricas-dspd/host.env}"
case "$destino" in *[!A-Za-z0-9@._+-]*) echo "AVISO_EMAIL invalido" >&2; exit 2 ;; esac
{
  echo "To: $destino"
  echo "Subject: [Metricas DSPD] coleta falhou: $unidade em $(hostname)"
  echo
  echo "A unidade $unidade terminou com falha em $(date -Is)."
  echo "Reexecutar: systemctl start $unidade   |   Conferir: journalctl -u $unidade -n 50"
  echo
  journalctl -u "$unidade" -n 30 --no-pager -o cat
} | /usr/sbin/sendmail -t
