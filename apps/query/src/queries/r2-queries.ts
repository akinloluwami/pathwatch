type QueryBuilder = (params: Record<string, any>) => string;

const escapeString = (str: string | undefined): string => {
  if (!str) return '';
  return str.replace(/'/g, "''");
};

export const r2SqlQueries: Record<string, QueryBuilder> = {
  total_requests: (params) => {
    const { org_id, project_id } = params;
    return `
      SELECT
        org_id,
        project_id,
        count() AS total_requests
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
      GROUP BY org_id, project_id
      ORDER BY total_requests DESC
    `;
  },

  error_rate: (params) => {
    const { org_id, project_id } = params;
    return `
      SELECT
        org_id,
        project_id,
        countIf(status >= 400) AS error_count,
        count() AS total_count,
        round(error_count / total_count * 100, 2) AS error_rate_percent
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
      GROUP BY org_id, project_id
      ORDER BY error_rate_percent DESC
    `;
  },

  avg_latency: (params) => {
    const { org_id, project_id } = params;
    return `
      SELECT
        org_id,
        project_id,
        avg(latency_ms) AS avg_latency_ms,
        min(latency_ms) AS min_latency_ms,
        max(latency_ms) AS max_latency_ms,
        quantile(0.95)(latency_ms) AS p95_latency_ms,
        quantile(0.99)(latency_ms) AS p99_latency_ms
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
      GROUP BY org_id, project_id
      ORDER BY avg_latency_ms DESC
    `;
  },

  top_paths: (params) => {
    const { org_id, project_id, limit = 100 } = params;
    return `
      SELECT
        org_id,
        project_id,
        path,
        count() AS request_count
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
      GROUP BY org_id, project_id, path
      ORDER BY request_count DESC
      LIMIT ${Number(limit)}
    `;
  },

  requests_over_time: (params) => {
    const { org_id, project_id, interval = '1h' } = params;

    const intervalMap: Record<string, string> = {
      '1h': 'toStartOfHour(timestamp)',
      '1d': 'toStartOfDay(timestamp)',
      '1w': 'toStartOfWeek(timestamp)',
      '1m': 'toStartOfMonth(timestamp)',
    };

    const timeFunction = intervalMap[interval] || 'toStartOfHour(timestamp)';

    return `
      SELECT
        org_id,
        project_id,
        ${timeFunction} AS period,
        count() AS request_count
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
      GROUP BY org_id, project_id, period
      ORDER BY org_id, project_id, period DESC
    `;
  },

  request_counts_by_period: (params) => {
    const { org_id, project_id } = params;
    return `
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
      FROM default.pw_logs
      WHERE org_id = '${escapeString(org_id)}' 
        AND project_id = '${escapeString(project_id)}'
    `;
  },

  ingestions_endpoint: (params) => {
    const {
      org_id,
      project_id,
      method,
      status,
      start_date,
      end_date,
      limit = 100,
      offset = 0,
    } = params;

    let whereConditions = [
      `org_id = '${escapeString(org_id)}'`,
      `project_id = '${escapeString(project_id)}'`,
    ];

    if (method) {
      whereConditions.push(`method = '${escapeString(method)}'`);
    }

    if (status) {
      whereConditions.push(`status = ${Number(status)}`);
    }

    if (start_date) {
      whereConditions.push(`timestamp >= '${escapeString(start_date)}'`);
    }

    if (end_date) {
      whereConditions.push(`timestamp <= '${escapeString(end_date)}'`);
    }

    return `
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
      FROM default.pw_logs
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY timestamp DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number(offset)}
    `;
  },
};
