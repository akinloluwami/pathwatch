SELECT
  status,
  count(*) AS error_count
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}} AND status >= 400
GROUP BY status
ORDER BY error_count DESC
