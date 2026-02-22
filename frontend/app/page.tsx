"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TimeSegment, ViewType, TaskInput } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('TODAY');
  const [notification, setNotification] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSegment, setModalSegment] = useState<TimeSegment>('UNASSIGNED');

  // Persistence & Hydration
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('focusflow_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  // Priority check
  useEffect(() => {
    const undoneCount = tasks.filter(t => t.status === 'PRIORITY' && !t.completed).length;
    if (undoneCount > 0) {
      setNotification(`Attention: You have ${undoneCount} priority tasks pending.`);
    } else {
      setNotification(null);
    }
  }, [tasks]);

  const handleOpenModal = (segment: TimeSegment = 'UNASSIGNED') => {
    setModalSegment(segment);
    setIsModalOpen(true);
  };

  const handleCreateTask = (input: TaskInput) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: input.title,
      description: input.description || '',
      segment: input.segment || 'UNASSIGNED',
      status: input.status || 'PRIORITY',
      completed: false,
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    if (currentView === 'TODAY') return tasks.filter(t => t.status === 'PRIORITY');
    if (currentView === 'BACKLOG') return tasks.filter(t => t.status === 'BACKLOG');
    if (currentView === 'ARCHIVE') return tasks.filter(t => t.status === 'ARCHIVED');
    return [];
  }, [tasks, currentView]);

  const statsData = useMemo(() => {
    const priorityTasks = tasks.filter(t => t.status === 'PRIORITY');
    return [
      { name: 'Morning', done: priorityTasks.filter(t => t.segment === 'MORNING' && t.completed).length, total: priorityTasks.filter(t => t.segment === 'MORNING').length },
      { name: 'Afternoon', done: priorityTasks.filter(t => t.segment === 'AFTERNOON' && t.completed).length, total: priorityTasks.filter(t => t.segment === 'AFTERNOON').length },
      { name: 'Evening', done: priorityTasks.filter(t => t.segment === 'EVENING' && t.completed).length, total: priorityTasks.filter(t => t.segment === 'EVENING').length },
    ];
  }, [tasks]);

  if (!isClient) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            FocusFlow
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setCurrentView('TODAY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'TODAY' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Daily Focus
          </button>
          <button 
            onClick={() => setCurrentView('BACKLOG')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'BACKLOG' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Backlog
          </button>
          <button 
            onClick={() => setCurrentView('ARCHIVE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'ARCHIVE' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            Archive
          </button>
          <button 
            onClick={() => setCurrentView('INSIGHTS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'INSIGHTS' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Insights
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              {currentView === 'TODAY' && 'Today\'s Focus'}
              {currentView === 'BACKLOG' && 'Project Backlog'}
              {currentView === 'ARCHIVE' && 'Archived History'}
              {currentView === 'INSIGHTS' && 'Productivity Insights'}
            </h2>
            {notification && (
              <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-2 animate-pulse border border-amber-200">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                {notification}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-sm text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {currentView === 'INSIGHTS' ? (
            <div className="max-w-4xl mx-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Priority</p>
                    <p className="text-3xl font-bold text-slate-800">{tasks.filter(t => t.status === 'PRIORITY').length}</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {tasks.filter(t => t.status === 'PRIORITY').length > 0 
                        ? Math.round((tasks.filter(t => t.status === 'PRIORITY' && t.completed).length / tasks.filter(t => t.status === 'PRIORITY').length) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Backlog Depth</p>
                    <p className="text-3xl font-bold text-amber-600">{tasks.filter(t => t.status === 'BACKLOG').length}</p>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                 <h3 className="font-bold text-slate-700 mb-6">Execution Velocity by Time Segment</h3>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={statsData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                     <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                     />
                     <Bar dataKey="done" radius={[4, 4, 0, 0]} barSize={40}>
                       {statsData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#ec4899'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          ) : currentView === 'TODAY' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(['MORNING', 'AFTERNOON', 'EVENING'] as TimeSegment[]).map(segment => (
                <div key={segment} className="flex flex-col h-full bg-slate-100/50 p-6 rounded-3xl border border-dashed border-slate-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{segment}</h3>
                      <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-xs border border-slate-200">
                        {filteredTasks.filter(t => t.segment === segment).length}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleOpenModal(segment)}
                      className="p-1 hover:bg-white rounded-full text-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {filteredTasks.filter(t => t.segment === segment).length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 bg-white rounded-2xl mx-auto mb-3 flex items-center justify-center border border-slate-100">
                           <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <p className="text-xs text-slate-400">Rest or plan a focus task</p>
                      </div>
                    ) : (
                      filteredTasks.filter(t => t.segment === segment).map(task => (
                        <TaskCard key={task.id} task={task} onToggle={toggleTask} onMove={moveTask} onDelete={deleteTask} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-slate-500">
                  Manage your {currentView === 'BACKLOG' ? 'ideas and pending projects' : 'completed or discarded tasks'}.
                </p>
                {currentView === 'BACKLOG' && (
                  <button 
                    onClick={() => handleOpenModal('UNASSIGNED')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add to Backlog
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-400">Nothing here yet</h3>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onMove={moveTask} onDelete={deleteTask} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Creation Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
        initialSegment={modalSegment}
      />

      {/* Mobile Nav */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
          <button onClick={() => setCurrentView('TODAY')} className={`p-2 rounded-lg ${currentView === 'TODAY' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => setCurrentView('BACKLOG')} className={`p-2 rounded-lg ${currentView === 'BACKLOG' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
          <button onClick={() => setCurrentView('INSIGHTS')} className={`p-2 rounded-lg ${currentView === 'INSIGHTS' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </button>
      </footer>
    </div>
  );
}