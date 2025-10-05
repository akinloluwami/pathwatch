SELECT
  org_id,
  project_id,
  avg(latency_ms) AS avg_latency_ms,
  min(latency_ms) AS min_latency_ms,
  max(latency_ms) AS max_latency_ms,
  quantile(0.95)(latency_ms) AS p95_latency_ms,
  quantile(0.99)(latency_ms) AS p99_latency_ms
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}
GROUP BY org_id, project_id
ORDER BY avg_latency_ms DESC