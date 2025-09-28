SELECT
  org_id,
  project_id,
  path,
  count() AS request_count
FROM ingestions
GROUP BY org_id, project_id, path
ORDER BY request_count DESC
LIMIT 100