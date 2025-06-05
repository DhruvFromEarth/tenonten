import React, { useState, useEffect } from "react";
import "./TaskForm.css";

const TaskForm = ({ onSubmit, users }) => {
  const [taskData, setTaskData] = useState({
    taskTitle: "",
    taskDescription: "",
    status: "todo",
    assignedTo: []
  });

  // Set default assigned user to current user
  useEffect(() => {
    const currentUserName = localStorage.getItem('userName');
    if (currentUserName) {
      const currentUser = users.find(user => user.userName === currentUserName);
      if (currentUser) {
        setTaskData(prev => ({
          ...prev,
          assignedTo: [currentUser._id]
        }));
      }
    }
  }, [users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;
    if (selectedUserId && !taskData.assignedTo.includes(selectedUserId)) {
      setTaskData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, selectedUserId]
      }));
    }
  };

  const removeUser = (userId) => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== userId)
    }));
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.userName : userId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", taskData); // Debug log

    if (!taskData.taskTitle.trim()) {
      console.log("Empty task title, not submitting"); // Debug log
      return;
    }

    try {
      console.log("Calling onSubmit with:", taskData); // Debug log
      await onSubmit(taskData);

      // Reset form but keep the current user assigned
      const currentUserName = localStorage.getItem('userName');
      const currentUser = users.find(user => user.userName === currentUserName);
      setTaskData({
        taskTitle: "",
        taskDescription: "",
        status: "todo",
        assignedTo: currentUser ? [currentUser._id] : []
      });
    } catch (error) {
      console.error("Error in TaskForm handleSubmit:", error);
    }
  };

  return (
    <header className="app_header">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="taskTitle"
          value={taskData.taskTitle}
          className="task_input"
          placeholder="Enter task title"
          onChange={handleChange}
        />
        <textarea
          name="taskDescription"
          value={taskData.taskDescription}
          className="task_input"
          placeholder="Enter task description"
          onChange={handleChange}
        />
        <div className="task_form_bottom_line">
          <div className="assigned-users-section">
            <select
              name="assignTo"
              value=""
              className="task_status"
              onChange={handleUserSelect}
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.userName}
                </option>
              ))}
            </select>
            <label className="assigned-label">Assign To:</label>
            <div className="assigned-list">
              {taskData.assignedTo.map((userId, index) => (
                <div key={index} className="assigned-user">
                  {getUserName(userId)}
                  <button
                    type="button"
                    onClick={() => removeUser(userId)}
                    className="remove-user"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
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
      </form>
    </header>
  );
};

export default TaskForm;