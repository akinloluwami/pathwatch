SELECT
  org_id,
  project_id,
  count() AS total_requests
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}
GROUP BY org_id, project_id
ORDER BY total_requests DESC