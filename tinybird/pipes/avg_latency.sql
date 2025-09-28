SELECT
  org_id,
  project_id,
  avg(latency_ms) AS avg_latency_ms,
  min(latency_ms) AS min_latency_ms,
  max(latency_ms) AS max_latency_ms
FROM ingestions
GROUP BY org_id, project_id
ORDER BY avg_latency_ms DESC