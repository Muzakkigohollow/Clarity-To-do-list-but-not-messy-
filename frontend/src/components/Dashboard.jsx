import React, { useEffect, useState, useMemo } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import * as taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    setError(null);
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Error adding task', err);
      setError('Failed to add the task.');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    setError(null);
    try {
      await taskService.toggleTaskStatus(id, newStatus);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Error updating status', err);
      setError('Failed to update the task status.');
    }
  };

  const handleDeleteTask = async (id) => {
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task', err);
      setError('Failed to delete the task.');
    }
  };

  const { progressPercent, todayTasks, upcomingTasks } = useMemo(() => {
    const doneCount = tasks.filter(t => t.status === 'DONE').length;
    const totalCount = tasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

    // Fix: Use local date instead of UTC to avoid date shifting
    const todayDateStr = new Date().toLocaleDateString('en-CA'); 
    
    const priorityWeight = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sortedTasks = [...tasks].sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

    const todayList = [];
    const upcomingList = [];

    sortedTasks.forEach(t => {
      if (!t.deadline) {
        todayList.push(t);
      } else {
        const taskDate = t.deadline.includes('T') ? t.deadline.split('T')[0] : t.deadline.substring(0, 10);
        if (taskDate <= todayDateStr) {
          todayList.push(t);
        } else {
          upcomingList.push(t);
        }
      }
    });

    return { progressPercent: progress, todayTasks: todayList, upcomingTasks: upcomingList };
  }, [tasks]);

  const handleLogout = () => {
    logout();
  };

  const username = user?.username || 'User';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 sm:gap-0">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-4xl font-extrabold text-clarity-text tracking-tight">Clarity</h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">
              {username}
            </span>
          </div>
          <p className="text-clarity-muted font-medium flex items-center space-x-3">
            <span>Clear your mind. Focus on today.</span>
            <span className="text-gray-300">|</span>
            <button onClick={handleLogout} className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors">Sign Out</button>
          </p>
        </div>
        <div className="text-right">
          <div className="bg-white rounded-lg shadow-sm px-6 py-3 border border-gray-100 flex flex-col items-center">
            <span className="text-3xl font-bold text-indigo-600">{progressPercent}%</span>
            <span className="text-xs font-semibold text-clarity-muted tracking-wide uppercase">Completed</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <TaskForm onTaskAdded={handleAddTask} />

      {loading ? (
        <div className="text-center text-clarity-muted py-10">Loading tasks...</div>
      ) : (
        <div className="mt-8 space-y-12">
          {/* Today Focus Section */}
          <div>
            <h2 className="text-2xl font-bold text-clarity-text mb-4 border-b pb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              Today's Focus
            </h2>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-clarity-muted bg-white rounded-lg border border-dashed border-gray-300">
                You're clear for today!
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Section */}
          {upcomingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-400 mb-4 border-b pb-2">Upcoming</h2>
              <div className="space-y-3 opacity-80">
                {upcomingTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
