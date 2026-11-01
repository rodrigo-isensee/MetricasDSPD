import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { analisarDominio, lerDominio } from '../src/modulos/referencia/dominio-acelerato.js';

const le = (rel: string): string => readFileSync(new URL(rel, import.meta.url), 'utf8');

describe('QA 056 carga inicial: abuso e fronteira', () => {
  it('nenhum acesso ao MySQL: o comando e o módulo não importam driver nem cliente do coletor, nem PG de outra fonte', () => {
    for (const f of ['../src/entradas/ref-sync-ac.ts', '../src/modulos/referencia/dominio-acelerato.ts']) {
      const t = le(f);
      expect(t.length).toBeGreaterThan(500);
      expect(t).not.toMatch(/mariadb|mysql/i);
      expect(t).not.toMatch(/modulos\/acelerato\//);
      expect(t).not.toMatch(/PG_COLETOR|PG_API_URL|businessmap/i);
    }
  });

  it('o arquivo real não traz arroba, caractere invisível nem campo fora da lista fechada', () => {
    const bruto = le('../../docs/architecture/fontes/acelerato-dominio.json');
    expect(bruto).not.toContain('@');
    expect(bruto).not.toMatch(/[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF]/);
    const { arquivo } = lerDominio();
    expect(Object.keys(arquivo.dominios).length).toBeGreaterThanOrEqual(2);
  });

  it('abuso: arroba e caractere invisível escondidos em qualquer lugar do rótulo ou do código são recusados', () => {
    const base = JSON.parse(le('../../docs/architecture/fontes/acelerato-dominio.json'));
    for (const ruim of ['a@b', 'a​b', 'a‮b', 'a b', 'a\u0000b', 'a\u0007b', 'a﻿b']) {
      const c = structuredClone(base);
      c.dominios.descricao_workflow[0].rotulo = ruim;
      expect(() => analisarDominio(JSON.stringify(c)), JSON.stringify(ruim)).toThrow(/inválido/);
    }
  });
});
