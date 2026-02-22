
export type TimeSegment = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'UNASSIGNED';

export type TaskStatus = 'PRIORITY' | 'BACKLOG' | 'ARCHIVED';

export interface Task {
  id: string;
  title: string;
  description: string;
  segment: TimeSegment;
  status: TaskStatus;
  completed: boolean;
  createdAt: number;
}

export type ViewType = 'TODAY' | 'BACKLOG' | 'ARCHIVE' | 'INSIGHTS';

export interface TaskInput {
  title: string;
  description?: string;
  segment?: TimeSegment;
  status?: TaskStatus;
}
