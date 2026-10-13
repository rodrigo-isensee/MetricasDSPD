-- Inventário do banco para comparar origem e restauração. Duas seções, ordenadas, uma linha por item.
-- contagem|<schema.tabela>|<linhas>  : count(*) exato de toda tabela dos schemas dspd_*
-- coluna|<schema.tabela.coluna tipo NULL/NOT NULL DEFAULT ...>  : o mesmo formato do snapshot do catálogo (tests/pg/esquema.snapshot.json)
SELECT 'contagem|' || n.nspname || '.' || c.relname || '|' ||
       (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) AS c FROM %I.%I', n.nspname, c.relname), false, true, '')))[1]::text
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname LIKE '%dspd\_%' AND c.relkind IN ('r', 'p')
 ORDER BY n.nspname, c.relname;
SELECT 'coluna|' || table_schema || '.' || table_name || '.' || column_name || ' ' ||
       data_type || coalesce('(' || character_maximum_length || ')', '') || ' ' ||
       CASE is_nullable WHEN 'YES' THEN 'NULL' ELSE 'NOT NULL' END || coalesce(' DEFAULT ' || column_default, '')
  FROM information_schema.columns
 WHERE table_schema LIKE '%dspd\_%'
 ORDER BY table_schema, table_name, ordinal_position;
