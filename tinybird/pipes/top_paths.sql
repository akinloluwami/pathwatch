SELECT
  org_id,
  project_id,
  path,
  count() AS request_count
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}
GROUP BY org_id, project_id, path
ORDER BY request_count DESC
LIMIT 100