-- ID: Q-RO-10a
-- FONTE: mysql
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: nome_campo:dominio,n:numero
-- NOTA: variante em campos_personalizados
-- Q-RO-10 (O17, Q-099-7): existe campo de causa raiz? (variante a: campos_personalizados)
SELECT f.nome_campo, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados, '$[*]' COLUMNS (nome_campo VARCHAR(255) PATH '$.nomeCampo')) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND (f.nome_campo LIKE '%ausa%' OR f.nome_campo LIKE '%aiz%')
 GROUP BY f.nome_campo;
