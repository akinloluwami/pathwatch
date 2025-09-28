SELECT
  countIf(timestamp >= now() - INTERVAL 1 HOUR AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_1h,
  countIf(timestamp >= now() - INTERVAL 24 HOUR AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_24h,
  countIf(timestamp >= toStartOfDay(now()) AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS today,
  countIf(timestamp >= toStartOfDay(now() - INTERVAL 1 DAY) AND timestamp < toStartOfDay(now()) AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS yesterday,
  countIf(timestamp >= now() - INTERVAL 3 DAY AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_3d,
  countIf(timestamp >= now() - INTERVAL 7 DAY AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_7d,
  countIf(timestamp >= now() - INTERVAL 30 DAY AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_30d,
  countIf(timestamp >= toStartOfMonth(now()) AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS this_month,
  countIf(timestamp >= toStartOfMonth(now() - INTERVAL 1 MONTH) AND timestamp < toStartOfMonth(now()) AND org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}) AS last_month