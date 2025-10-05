SELECT
  countIf(timestamp >= now() - INTERVAL 1 HOUR) AS last_1h,
  countIf(timestamp >= now() - INTERVAL 24 HOUR) AS last_24h,
  countIf(timestamp >= toStartOfDay(now())) AS today,
  countIf(timestamp >= toStartOfDay(now() - INTERVAL 1 DAY) AND timestamp < toStartOfDay(now())) AS yesterday,
  countIf(timestamp >= now() - INTERVAL 3 DAY) AS last_3d,
  countIf(timestamp >= now() - INTERVAL 7 DAY) AS last_7d,
  countIf(timestamp >= now() - INTERVAL 30 DAY) AS last_30d,
  countIf(timestamp >= toStartOfMonth(now())) AS this_month,
  countIf(timestamp >= toStartOfMonth(now() - INTERVAL 1 MONTH) AND timestamp < toStartOfMonth(now())) AS last_month
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}