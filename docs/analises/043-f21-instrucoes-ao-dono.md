# 043 / F21: aplicar o diff do pre-push (instruções ao dono)

No terminal, fora do Claude:

1. `cd ~/.forge-contrib/MetricasDSPD && git status --short` (esperado: 4 arquivos M e o fragmento novo; o hook ainda sem mudança).
2. `git apply --check /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-pre-push.patch && git apply /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-pre-push.patch`
3. `python3 -m unittest discover -s tests -v`
4. `scripts/validar-plugin.sh`
5. `scripts/verificar-contribuicao.sh`
6. Avise o Jarvis: o commit e o push da branch `melhoria/MetricasDSPD-f21-worktree` saem na delegação seguinte.
