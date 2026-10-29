#!/bin/bash
# Teste do scripts/suite-unica.sh: sem banco e sem navegador.
# 1) duas chamadas simultâneas rodam em série; 2) chamada aninhada não trava.
set -uo pipefail
cd "$(dirname "$0")/.."

unset METRICAS_DSPD_SUITE_SEGURA
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export METRICAS_DSPD_SUITE_LOCK="$TMP/trava.lock"
LOG="$TMP/log"
: >"$LOG"

# Trabalho de 1 s que registra início e fim.
cat >"$TMP/trabalho.sh" <<'EOF'
#!/bin/bash
echo "inicio $1" >>"$2"
sleep 1
echo "fim $1" >>"$2"
EOF

falhas=0
verifica() { # descrição, condição (0 = ok)
  if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi
}

# 1) simultâneas rodam em série: nenhum "inicio" entre um "inicio" e o "fim" do mesmo trabalho.
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" A "$LOG" 2>"$TMP/errA" &
pA=$!
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" B "$LOG" 2>"$TMP/errB" &
pB=$!
wait "$pA"; rcA=$?
wait "$pB"; rcB=$?
verifica "as duas chamadas terminam com rc=0" $((rcA + rcB))
linhas="$(awk '{print $1}' "$LOG" | paste -sd' ')"
[ "$linhas" = "inicio fim inicio fim" ]
verifica "execução em série (inicio fim inicio fim): $linhas" $?
cat "$TMP/errA" "$TMP/errB" | grep -q "esperando a trava"
verifica "quem esperou avisou no terminal" $?

# 2) aninhada não trava (timeout evita pendurar o teste se houver deadlock).
timeout 10 bash scripts/suite-unica.sh bash scripts/suite-unica.sh echo aninhada >"$TMP/saida" 2>&1
rc=$?
[ "$rc" -eq 0 ] && grep -q aninhada "$TMP/saida"
verifica "chamada aninhada roda direto (rc=$rc)" $?

# 3) o rc do comando é preservado.
bash scripts/suite-unica.sh bash -c 'exit 7'
[ "$?" -eq 7 ]
verifica "rc do comando é repassado" $?

[ "$falhas" -eq 0 ] && echo "suite-unica.test: tudo certo" || echo "suite-unica.test: $falhas falha(s)"
exit "$falhas"
