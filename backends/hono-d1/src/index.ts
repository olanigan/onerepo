import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type']
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/tasks', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks ORDER BY created_at DESC'
  ).all();
  return c.json(results || []);
});

app.get('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE id = ?'
  ).bind(id).first();
  
  if (!results) {
    return c.json({ error: 'Not Found', message: `Task with id '${id}' not found` }, 404);
  }
  
  return c.json(results);
});

app.post('/tasks', async (c) => {
  const body = await c.req.json();
  
  if (!body.title) {
    return c.json({ error: 'Validation Error', details: [{ field: 'title', message: 'Title is required' }] }, 400);
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(
    'INSERT INTO tasks (id, title, description, status, project_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.title, body.description || '', body.status || 'inbox', body.project_id || null, now, now).run();
  
  const { results } = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return c.json(results, 201);
});

app.put('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const existing = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json({ error: 'Not Found', message: `Task with id '${id}' not found` }, 404);
  }
  
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'UPDATE tasks SET title = ?, description = ?, status = ?, project_id = ?, updated_at = ? WHERE id = ?'
  ).bind(
    body.title ?? existing.title,
    body.description ?? existing.description,
    body.status ?? existing.status,
    body.project_id !== undefined ? body.project_id : existing.project_id,
    now,
    id
  ).run();
  
  const { results } = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return c.json(results);
});

app.delete('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  
  const existing = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json({ error: 'Not Found', message: `Task with id '${id}' not found` }, 404);
  }
  
  await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  return c.body(null, 204);
});

app.get('/projects', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM projects ORDER BY created_at DESC'
  ).all();
  return c.json(results || []);
});

app.get('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(id).first();
  
  if (!results) {
    return c.json({ error: 'Not Found', message: `Project with id '${id}' not found` }, 404);
  }
  
  return c.json(results);
});

app.post('/projects', async (c) => {
  const body = await c.req.json();
  
  if (!body.name) {
    return c.json({ error: 'Validation Error', details: [{ field: 'name', message: 'Name is required' }] }, 400);
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(
    'INSERT INTO projects (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.status || 'active', now, now).run();
  
  const { results } = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  return c.json(results, 201);
});

app.put('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const existing = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json({ error: 'Not Found', message: `Project with id '${id}' not found` }, 404);
  }
  
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'UPDATE projects SET name = ?, status = ?, updated_at = ? WHERE id = ?'
  ).bind(
    body.name ?? existing.name,
    body.status ?? existing.status,
    now,
    id
  ).run();
  
  const { results } = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  return c.json(results);
});

app.delete('/projects/:id', async (c) => {
  const id = c.req.param('id');
  
  const existing = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json({ error: 'Not Found', message: `Project with id '${id}' not found` }, 404);
  }
  
  await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return c.body(null, 204);
});

app.get('/projects/:id/tasks', async (c) => {
  const projectId = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC'
  ).bind(projectId).all();
  return c.json(results || []);
});

export default app;
