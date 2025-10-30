import { Elysia } from 'elysia';
import { verifyApiKey } from './database';

export const authenticateApiKey = new Elysia().macro({
  authenticate: {
    async resolve({ set, request }) {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      const token = authHeader.split(' ')[1];
      const apiKey = await verifyApiKey(token);

      if (!apiKey) {
        set.status = 401;
        throw new Error('Unauthorized');
      }

      return {
        org_id: apiKey.org_id,
        project_id: apiKey.project_id,
      };
    },
  },
});
