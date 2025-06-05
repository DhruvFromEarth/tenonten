import React from 'react';
import './TaskCard.css';
import deleteIcon from '../assets/delete.png';

const TaskCard = ({ task, onDragStart, onDragEnd, onStatusChange, onTaskClick, onDelete, users }) => {
  // Don't render if task is empty or invalid
  if (!task || !task.taskTitle || !task.taskTitle.trim()) {
    return null;
  }

  function handleCardClick(e) {
    // Only trigger if the click wasn't on the select or delete button
    if (!e.target.closest('.status-select') && !e.target.closest('.delete-btn')) {
      onTaskClick(task);
    }
  }

  function handleDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task._id);
  }

  function handleStatusChange(e) {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(task._id, e.target.value);
  }

  const getAssignedUserNames = () => {
    return task.assignedTo?.map(userId => {
      const user = users?.find(u => u._id === userId);
      return user?.userName || userId;
    }).join(', ') || 'Unassigned';
  };

  return (
    <div
      className="task-card"
      // draggable
      // onDragStart={(e) => onDragStart(e, task)}
      // onDragEnd={onDragEnd}
      onClick={handleCardClick}
    >
      <div className="task-header">
        <h3>{task.taskTitle}</h3>
        <div className="task-actions">
          <span className="assigned-users">{getAssignedUserNames()}</span>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="status-select"
          >
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <button className="delete-btn" onClick={handleDeleteClick}>
            <img src={deleteIcon} alt="Delete" style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>
      {task.taskDescription && <p className="task-description">{task.taskDescription}</p>}
    </div>
  );
};

export default TaskCard; 