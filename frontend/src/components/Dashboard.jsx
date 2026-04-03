import React, { useEffect, useState } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import * as taskService from '../services/taskService';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      fetchTasks();
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  const handletoggleStatus = async (id, newStatus) => {
    try {
      await taskService.toggleTaskStatus(id, newStatus);
      fetchTasks();
      // Alternatively optimistically update state:
      // setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  // Grouping logic (Temporal Filtering)
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  // Sort ensures priority strictly (if we ever sort locally): HIGH, MEDIUM, LOW
  const priorityWeight = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedTasks = [...tasks].sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

  const todayTasks = sortedTasks.filter(t => {
      if (!t.deadline) return true; // tasks without deadline fall into Today by default
      // compare YYYY-MM-DD
      const taskDate = new Date(t.deadline).toISOString().split('T')[0];
      return taskDate <= todayDateStr;
  });

  const upcomingTasks = sortedTasks.filter(t => {
      if (!t.deadline) return false;
      const taskDate = new Date(t.deadline).toISOString().split('T')[0];
      return taskDate > todayDateStr;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-clarity-text tracking-tight mb-2">Clarity</h1>
          <p className="text-clarity-muted font-medium">Clear your mind. Focus on today.</p>
        </div>
        <div className="text-right">
          <div className="bg-white rounded-lg shadow-sm px-6 py-3 border border-gray-100 flex flex-col items-center">
            <span className="text-3xl font-bold text-indigo-600">{progressPercent}%</span>
            <span className="text-xs font-semibold text-clarity-muted tracking-wide uppercase">Completed</span>
          </div>
        </div>
      </header>

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
                  <TaskItem key={task.id} task={task} onToggleStatus={handletoggleStatus} onDelete={handleDeleteTask} />
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
                  <TaskItem key={task.id} task={task} onToggleStatus={handletoggleStatus} onDelete={handleDeleteTask} />
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
