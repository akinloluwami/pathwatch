-- Pre-aggregation pipe: store hourly request counts per org/project
SELECT
  org_id,
  project_id,
  toStartOfHour(timestamp) AS hour,
  count() AS request_count
FROM ingestions
GROUP BY org_id, project_id, hour
ORDER BY org_id, project_id, hour DESC
