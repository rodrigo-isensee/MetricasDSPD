#!/bin/bash
# Teste do scripts/suite-unica.sh: sem banco e sem navegador.
# 1) duas vagas: duas chamadas rodam juntas e a terceira espera; 2) uma vaga roda em série; 3) aninhada não trava;
# 4) rc repassado; 5) caminho padrão das vagas; 6) fila pg separada, com uma vaga; 7) entradas inválidas e link simbólico.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

# Limpa as marcas do ambiente (ex.: rodando dentro de pnpm run pronto) para o teste usar só as suas vagas.
unset METRICAS_DSPD_SUITE_SEGURA METRICAS_DSPD_SUITE_VAGAS METRICAS_DSPD_SUITE_GRUPO METRICAS_DSPD_SUITE_DIR
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export METRICAS_DSPD_SUITE_LOCK="$TMP/trava"
LOG="$TMP/log"
: >"$LOG"

# Trabalho que registra início e fim; o terceiro argumento é a duração em segundos.
cat >"$TMP/trabalho.sh" <<'EOF'
#!/bin/bash
echo "inicio $1" >>"$2"
sleep "${3:-1}"
echo "fim $1" >>"$2"
EOF

falhas=0
verifica() { # descrição, condição (0 = ok)
  if [ "$2" -eq 0 ]; then echo "ok - $1"; else echo "FALHOU - $1"; falhas=$((falhas + 1)); fi
}
# Maior número de trabalhos ao mesmo tempo no log (inicio soma, fim subtrai).
simultaneos() { awk '$1=="inicio"{n++; if(n>m)m=n} $1=="fim"{n--} END{print m+0}' "$1"; }

# 1) padrão (2 vagas): A e B rodam juntas, C espera uma delas liberar.
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" A "$LOG" 2 2>"$TMP/errA" &
pA=$!
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" B "$LOG" 2 2>"$TMP/errB" &
pB=$!
sleep 0.7
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" C "$LOG" 1 2>"$TMP/errC" &
pC=$!
sleep 0.5
[ "$(grep -c '^inicio' "$LOG")" -eq 2 ] && ! grep -q 'inicio C' "$LOG"
verifica "duas vagas ocupadas, a terceira chamada ainda espera" $?
wait "$pA"; rcA=$?
wait "$pB"; rcB=$?
wait "$pC"; rcC=$?
verifica "as três chamadas terminam com rc=0" $((rcA + rcB + rcC))
m="$(simultaneos "$LOG")"
[ "$m" -eq 2 ]
verifica "no máximo duas ao mesmo tempo (máximo observado: $m)" $?
grep -q "inicio A" "$LOG" && grep -q "inicio B" "$LOG" && [ "$(grep -n 'inicio' "$LOG" | sed -n 2p | cut -d: -f1)" -le 2 ]
verifica "A e B começaram juntas (a segunda vaga estava livre)" $?
grep -q "esperando a primeira livre" "$TMP/errC" && grep -q "vaga 1 .* segurada por: pid" "$TMP/errC" && grep -q "vaga 2 .* segurada por: pid" "$TMP/errC"
verifica "quem esperou avisou no terminal, com cada vaga e quem a segura" $?
! grep -q "esperando" "$TMP/errA" "$TMP/errB"
verifica "A e B (com vaga livre) não esperaram" $?

# 2) METRICAS_DSPD_SUITE_VAGAS=1: volta a uma de cada vez.
: >"$LOG"
export METRICAS_DSPD_SUITE_VAGAS=1
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" A "$LOG" 1 2>/dev/null &
pA=$!
bash scripts/suite-unica.sh bash "$TMP/trabalho.sh" B "$LOG" 1 2>/dev/null &
pB=$!
wait "$pA"; wait "$pB"
linhas="$(awk '{print $1}' "$LOG" | paste -sd' ')"
[ "$linhas" = "inicio fim inicio fim" ]
verifica "com 1 vaga, execução em série ($linhas)" $?
unset METRICAS_DSPD_SUITE_VAGAS

# 3) aninhada não trava, nem com todas as vagas ocupadas (timeout evita pendurar o teste).
timeout 10 bash scripts/suite-unica.sh bash scripts/suite-unica.sh echo aninhada >"$TMP/saida" 2>&1
rc=$?
[ "$rc" -eq 0 ] && grep -q aninhada "$TMP/saida"
verifica "chamada aninhada roda direto (rc=$rc)" $?

# 4) o rc do comando é preservado.
bash scripts/suite-unica.sh bash -c 'exit 7'
[ "$?" -eq 7 ]
verifica "rc do comando é repassado" $?

# 5) sem METRICAS_DSPD_SUITE_LOCK, as vagas ficam no diretório de trava, com o nome padrão.
# O diretório é temporário (METRICAS_DSPD_SUITE_DIR): o teste não disputa as vagas de /tmp/claude-<uid>,
# que o próprio `pnpm run pronto` já segura. O literal do diretório padrão e o padrão de 2 vagas são conferidos no script.
grep -q 'METRICAS_DSPD_SUITE_DIR:-/tmp/claude-$(id -u)}' scripts/suite-unica.sh
verifica "diretório padrão da trava continua /tmp/claude-<uid>" $?
grep -q 'METRICAS_DSPD_SUITE_VAGAS:-2}' scripts/suite-unica.sh
verifica "número de vagas padrão é 2" $?
DIR_PROPRIO="$TMP/claude-trava"
padrao="$DIR_PROPRIO/metricas-dspd-suite-1.lock"
sem_lock() { env -u METRICAS_DSPD_SUITE_LOCK -u METRICAS_DSPD_SUITE_SEGURA METRICAS_DSPD_SUITE_DIR="$DIR_PROPRIO" "$@"; }
sem_lock bash scripts/suite-unica.sh sleep 2 2>/dev/null &
p1=$!
sem_lock bash scripts/suite-unica.sh sleep 2 2>/dev/null &
p2=$!
sleep 0.5
sem_lock timeout 1 bash scripts/suite-unica.sh true 2>"$TMP/errP"
grep -q "vaga 1 ($padrao)" "$TMP/errP"
verifica "caminho padrão $padrao: a terceira chamada espera as duas primeiras" $?
wait "$p1"
verifica "caminho padrão: primeira chamada termina com rc=0" $?
wait "$p2"

# 6) fila pg: uma vaga própria, separada das vagas da suíte.
export METRICAS_DSPD_SUITE_LOCK="$TMP/trava"
METRICAS_DSPD_SUITE_GRUPO=pg bash scripts/suite-unica.sh sleep 5 2>/dev/null &
pG=$!
sleep 0.5
METRICAS_DSPD_SUITE_GRUPO=pg timeout 1 bash scripts/suite-unica.sh true 2>"$TMP/errG"
rcG=$?
[ "$rcG" -eq 124 ] && grep -q "esperando a primeira livre" "$TMP/errG"
verifica "pg: a segunda chamada do pg espera (uma vaga só, rc=$rcG)" $?
timeout 5 bash scripts/suite-unica.sh true 2>/dev/null
verifica "pg ocupado não segura a fila da suíte" $?
METRICAS_DSPD_SUITE_VAGAS=1 timeout 5 bash scripts/suite-unica.sh true 2>/dev/null
verifica "pg ocupado não segura a fila da suíte (1 vaga)" $?
METRICAS_DSPD_SUITE_VAGAS=8 METRICAS_DSPD_SUITE_GRUPO=pg timeout 1 bash scripts/suite-unica.sh true 2>/dev/null
[ "$?" -eq 124 ]
verifica "pg segue com uma vaga mesmo com METRICAS_DSPD_SUITE_VAGAS=8" $?
wait "$pG"

# 7) entradas inválidas e link simbólico.
METRICAS_DSPD_SUITE_VAGAS=0 bash scripts/suite-unica.sh true 2>/dev/null
[ "$?" -eq 2 ]
verifica "vagas=0 é recusado (rc=2)" $?
METRICAS_DSPD_SUITE_VAGAS=abc bash scripts/suite-unica.sh true 2>/dev/null
[ "$?" -eq 2 ]
verifica "vagas não numérico é recusado (rc=2)" $?
METRICAS_DSPD_SUITE_GRUPO='../x' bash scripts/suite-unica.sh true 2>/dev/null
[ "$?" -eq 2 ]
verifica "grupo com caminho é recusado (rc=2)" $?
touch "$TMP/alvo"
rm -f "$TMP/trava-2.lock"
ln -s "$TMP/alvo" "$TMP/trava-2.lock"
bash scripts/suite-unica.sh true 2>"$TMP/errL"
rcL=$?
[ "$rcL" -eq 1 ] && grep -q "link simbólico" "$TMP/errL"
verifica "vaga que é link simbólico é recusada (rc=$rcL)" $?

[ "$falhas" -eq 0 ] && echo "suite-unica.test: tudo certo" || echo "suite-unica.test: $falhas falha(s)"
exit "$falhas"
