import request from 'supertest';
import { app } from '../src/app.js';

describe('OpenAPI / Swagger Documentation', () => {
  it('deve expor a rota /api-docs/openapi.json com o schema válido', async () => {
    const res = await request(app).get('/api-docs/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info).toBeDefined();
    expect(res.body.info.title).toContain('Docs-Wiki');
    expect(res.body.paths['/search']).toBeDefined();
    expect(res.body.paths['/chat']).toBeDefined();
  });
});
