import React from 'react';

const TaskItem = ({ task, onToggleStatus, onDelete }) => {
  const isDone = task.status === 'DONE';
  
  const priorityConfig = {
    HIGH: { colors: 'border-red-500 text-red-700 bg-red-50', icon: '🔥' },
    MEDIUM: { colors: 'border-yellow-500 text-yellow-700 bg-yellow-50', icon: '⚡' },
    LOW: { colors: 'border-emerald-500 text-emerald-700 bg-emerald-50', icon: '🌱' }
  }[task.priority];

  // formatting the deadline purely visual mapping
  let formattedDate = null;
  if (task.deadline) {
    const [y, m, d] = task.deadline.substring(0, 10).split('-');
    formattedDate = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 mb-4 rounded-xl border-l-8 transition-all ${isDone ? 'bg-gray-50 border-gray-300 opacity-50 grayscale' : `bg-white shadow-md border-gray-100 hover:shadow-lg ${priorityConfig.colors}`}`}>
      <div className="flex items-center gap-5 flex-1 w-full truncate">
        <button
          onClick={() => onToggleStatus(task.id, isDone ? 'PENDING' : 'DONE')}
          className={`w-8 h-8 flex-shrink-0 rounded-full border-[3px] flex items-center justify-center transition-colors ${isDone ? 'bg-gray-400 border-gray-400' : 'border-indigo-400 hover:border-indigo-600 bg-white shadow-inner'}`}
        >
          {isDone && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </button>
        <div className="flex flex-col min-w-0">
          <span className={`font-sans text-xl truncate ${isDone ? 'line-through text-gray-500' : 'text-gray-900 font-bold'}`}>
            {task.title}
          </span>
          {formattedDate && <span className={`text-sm mt-1 font-medium ${isDone ? 'text-gray-400' : 'text-indigo-500'}`}>Due: {formattedDate}</span>}
        </div>
      </div>
      <div className="flex items-center gap-6 mt-4 sm:mt-0 ml-12 sm:ml-0 self-end sm:self-auto">
        {!isDone && (
          <span className={`text-sm font-extrabold px-3 py-1.5 rounded-lg border-2 shadow-sm ${priorityConfig.colors}`}>
            <span className="mr-1.5">{priorityConfig.icon}</span>
            {task.priority}
          </span>
        )}
        <button 
          onClick={() => onDelete(task.id)}
          className={`p-2 rounded-md transition-colors ${isDone ? 'text-gray-400 hover:text-red-500 hover:bg-red-100' : 'text-gray-300 hover:text-red-500 hover:bg-red-100'}`}
          title="Delete task"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
