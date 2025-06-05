import React from 'react';
import TaskCard from './TaskCard';
import './TaskColumn.css';

const TaskColumn = ({ title, tasks, onDelete, onStatusChange, onTaskClick, icon, users }) => {
  return (
    <div className="task-column">
      <h2 className="column-title">{title}
        {/* dont add icon for now */}
        {/* <img src={icon} alt="Task Icon"></img> */}
      </h2>
      
      <div className="tasks-container">
        {tasks.map((task, index) => (
          <TaskCard
            key={index}
            task={task}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onTaskClick={onTaskClick}
            users={users}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn; 