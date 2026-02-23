const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://hono-d1-backend.salalite.workers.dev';
const BACKEND_HEADER = 'hono-d1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-backend': BACKEND_HEADER,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  tasks: {
    list: () => request<ApiTask[]>('/tasks'),
    get: (id: string) => request<ApiTask>(`/tasks/${id}`),
    create: (data: { title: string; description?: string; status?: string; project_id?: string }) =>
      request<ApiTask>('/tasks', { method: 'POST', body: data }),
    update: (id: string, data: Partial<{ title: string; description: string; status: string; project_id: string }>) =>
      request<ApiTask>(`/tasks/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (data: { name: string }) => request<Project>('/projects', { method: 'POST', body: data }),
    update: (id: string, data: Partial<{ name: string; status: string }>) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },
  health: () => request<{ status: string }>('/health'),
};

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: 'inbox' | 'next' | 'waiting' | 'done';
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'someday' | 'archive';
  created_at: string;
  updated_at: string;
}
