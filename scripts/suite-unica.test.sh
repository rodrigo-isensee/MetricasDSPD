#!/bin/bash
# Teste do scripts/suite-unica.sh: sem banco e sem navegador.
# 1) duas chamadas simultâneas rodam em série; 2) chamada aninhada não trava.
set -uo pipefail
cd "$(dirname "$0")/.."

# Guarda se já rodamos dentro de uma suíte que segura a trava padrão (ex.: pnpm run pronto), antes de limpar a marca.
DENTRO_DE_SUITE="${METRICAS_DSPD_SUITE_SEGURA:-}"
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

# 4) sem METRICAS_DSPD_SUITE_LOCK, a trava é a única do diretório de trava, com o nome padrão.
# O diretório é temporário (METRICAS_DSPD_SUITE_DIR): o teste não disputa a trava de /tmp/claude-<uid>,
# que o próprio `pnpm run pronto` já segura. O literal do diretório padrão é conferido no script.
grep -q 'METRICAS_DSPD_SUITE_DIR:-/tmp/claude-$(id -u)}' scripts/suite-unica.sh
verifica "diretório padrão da trava continua /tmp/claude-<uid>" $?
DIR_PROPRIO="$TMP/claude-trava"
padrao="$DIR_PROPRIO/metricas-dspd-suite.lock"
env -u METRICAS_DSPD_SUITE_LOCK -u METRICAS_DSPD_SUITE_SEGURA METRICAS_DSPD_SUITE_DIR="$DIR_PROPRIO" bash scripts/suite-unica.sh bash -c 'echo "$$" >"$1"; sleep 2' x "$TMP/pid" 2>/dev/null &
pP=$!
sleep 0.5
env -u METRICAS_DSPD_SUITE_LOCK -u METRICAS_DSPD_SUITE_SEGURA METRICAS_DSPD_SUITE_DIR="$DIR_PROPRIO" timeout 1 bash scripts/suite-unica.sh true 2>"$TMP/errP"
grep -q "esperando a trava $padrao" "$TMP/errP"
verifica "caminho padrão $padrao: segunda chamada espera a primeira" $?
wait "$pP"
verifica "caminho padrão: primeira chamada termina com rc=0" $?

[ "$falhas" -eq 0 ] && echo "suite-unica.test: tudo certo" || echo "suite-unica.test: $falhas falha(s)"
exit "$falhas"
