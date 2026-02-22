
import React from 'react';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onMove: (id: string, newStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onMove, onDelete }) => {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 group relative ${
      task.completed 
        ? 'bg-gray-50 border-gray-100 opacity-60' 
        : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
    }`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task.id)}
          className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'PRIORITY' && (
            <button 
              onClick={() => onMove(task.id, 'PRIORITY')}
              title="Move to Priority"
              className="p-1 hover:bg-green-50 text-green-600 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
          {task.status !== 'BACKLOG' && (
            <button 
              onClick={() => onMove(task.id, 'BACKLOG')}
              title="Move to Backlog"
              className="p-1 hover:bg-amber-50 text-amber-600 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          {task.status !== 'ARCHIVED' && (
            <button 
              onClick={() => onMove(task.id, 'ARCHIVED')}
              title="Archive"
              className="p-1 hover:bg-slate-100 text-slate-600 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-red-50 text-red-600 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
