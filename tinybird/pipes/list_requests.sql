SELECT
  id,
  timestamp,
  org_id,
  project_id,
  method,
  path,
  status,
  latency_ms,
  req_size,
  res_size,
  ip,
  user_agent,
  body
FROM ingestions
WHERE org_id = {{String(org_id)}} AND project_id = {{String(project_id)}}
ORDER BY timestamp DESC
LIMIT {{Int32(limit, 100)}}
OFFSET {{Int32(offset, 0)}}