import React, { useState } from "react";

import "./TaskForm.css";

const TaskForm = ({ setTasks }) => {
  const [taskData, setTaskData] = useState({
    task: "",
    status: "todo",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTaskData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.task.trim()) return; // Don't submit empty tasks
    
    // Create a new task with a unique ID
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      title: taskData.task,
      description: "",
      tags: [], // Keep empty tags array for compatibility
    };
    
    setTasks((prev) => {
      return [...prev, newTask];
    });
    
    // Reset form
    setTaskData({
      task: "",
      status: "todo",
    });
  };
  
  return (
    <header className="app_header">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="task"
          value={taskData.task}
          className="task_input"
          placeholder="Enter your task"
          onChange={handleChange}
        />

        <div className="task_form_bottom_line">
          <div>
            <select
              name="status"
              value={taskData.status}
              className="task_status"
              onChange={handleChange}
            >
              <option value="todo">To do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
            <button type="submit" className="task_submit">
              + Add Task
            </button>
          </div>
        </div>
      </form>
    </header>
  );
};

export default TaskForm;
