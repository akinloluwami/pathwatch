SELECT
  org_id,
  project_id,
  count() AS total_requests
FROM ingestions
GROUP BY org_id, project_id
ORDER BY total_requests DESC