import { z } from 'zod';

export const EventSchema = z.object({
  api_key: z.string(),
  method: z.string(),
  path: z.string(),
  url: z.string().optional(),
  host: z.string().optional(),
  status: z.number(),
  latency_ms: z.number(),
  req_size: z.number(),
  res_size: z.number(),
  ip: z.string().optional(),
  user_agent: z.string().optional(),
  body: z.any().optional(),
});

export type Event = z.infer<typeof EventSchema>;
