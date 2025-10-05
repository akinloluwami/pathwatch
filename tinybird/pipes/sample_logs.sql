-- Sampled raw logs: last N rows per project (for dashboard performance)
SELECT
  *
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}
ORDER BY timestamp DESC
LIMIT {{Int32(limit, 100)}}
