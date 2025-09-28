SELECT
  org_id,
  project_id,
  countIf(status >= 400) AS error_count,
  count() AS total_count,
  round(error_count / total_count * 100, 2) AS error_rate_percent
FROM ingestions
GROUP BY org_id, project_id
ORDER BY error_rate_percent DESC