import { describe, expect, it } from 'vitest';
import { COLUNAS_API_APONTAMENTO } from '../src/plataforma/db/grants.js';

// Pedido 105, B7a (A4 do parecer 105-o22-adr, R-T5, caso 13): o papel da aba Apontamento lê `pessoa_ref` por card. Se ele lesse o toque por card, daria tempo de
// resposta por pessoa (regra inviolável: nenhuma métrica para avaliação individual). As colunas ainda não existem (migração do B7b); esta guarda estática impede que
// entrem na lista do papel e o teste de banco do B7b confirma o `permission denied`.
describe('o papel da aba Apontamento não lê o primeiro toque (R-T5)', () => {
  const COLUNAS_DO_TOQUE = ['primeiro_toque_em', 'toque_situacao', 'conta_como_toque', 'revisao_lida', 'estado', 'motivo', 'ocorrido_em', 'evento_id'];

  const GENERICAS_CTL = ['estado', 'motivo'];

  it('nenhuma coluna do toque em dim_card nem em outra tabela da lista do papel', () => {
    expect(COLUNAS_API_APONTAMENTO['bm.dim_card']).not.toContain('primeiro_toque_em');
    expect(COLUNAS_API_APONTAMENTO['bm.dim_card']).not.toContain('toque_situacao');
    for (const [tabela, colunas] of Object.entries(COLUNAS_API_APONTAMENTO)) {
      const ehCtl = tabela === 'bm.ctl_apontamento_cobertura' || tabela === 'bm.ctl_coleta';
      for (const c of COLUNAS_DO_TOQUE) {
        if (ehCtl && GENERICAS_CTL.includes(c)) continue; // só `estado` e `motivo`, colunas genéricas dessas duas tabelas
        expect(colunas, `${tabela}.${c}`).not.toContain(c);
      }
    }
  });

  it('as tabelas do toque não estão na lista do papel', () => {
    const tabelas = Object.keys(COLUNAS_API_APONTAMENTO);
    expect(tabelas).not.toContain('bm.stg_toque_instante');
    expect(tabelas).not.toContain('bm.ctl_toque_leitura');
  });
});
