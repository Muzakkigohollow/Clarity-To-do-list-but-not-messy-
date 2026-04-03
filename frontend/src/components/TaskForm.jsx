import React, { useState } from 'react';

const TaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onTaskAdded({ title, priority, deadline: deadline || null });
    setTitle('');
    setPriority('MEDIUM');
    setDeadline('');
  };

  return (
    <div className="bg-clarity-card rounded-xl shadow-lg border border-gray-100 p-6 mb-8 transition-shadow hover:shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="What needs to be done today?"
          className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-colors font-sans text-clarity-text shadow-inner"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <input
          type="date"
          className="w-full md:w-auto bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors text-clarity-muted font-medium"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full md:w-auto bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors font-bold text-clarity-text"
        >
          <option value="HIGH" className="text-red-500 font-bold">HIGH</option>
          <option value="MEDIUM" className="text-yellow-600 font-bold">MEDIUM</option>
          <option value="LOW" className="text-emerald-500 font-bold">LOW</option>
        </select>

        <button
          type="submit"
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:-translate-y-0.5 shadow-md"
        >
          Add Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
