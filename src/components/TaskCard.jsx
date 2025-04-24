import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onDragStart, onDragEnd, onStatusChange }) => {
  // Don't render if task is empty or invalid
  if (!task || !task.title || !task.title.trim()) {
    return null;
  }

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className="task-header">
        <h3>{task.title}</h3>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="status-select"
        >
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
    </div>
  );
};

export default TaskCard; 