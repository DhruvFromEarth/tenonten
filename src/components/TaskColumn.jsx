import React from 'react';
import TaskCard from './TaskCard';
import './TaskColumn.css';

const TaskColumn = ({ title, tasks, onDelete, onStatusChange }) => {
  return (
    <div className="task-column">
      <h2 className="column-title">{title}</h2>
      <div className="tasks-container">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn; 