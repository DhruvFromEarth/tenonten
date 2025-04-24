import React, { useState, useEffect } from "react";

import "./TaskManager.css";
import TaskForm from "./components/TaskForm";
import TaskColumn from "../../components/TaskColumn";
import todoIcon from "./assets/direct-hit.png";
import doingIcon from "./assets/glowing-star.png";
import doneIcon from "./assets/check-mark-button.png";

// const oldTasks = localStorage.getItem("tasks");

const TaskManager = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // const [tasks, setTasks] = useState(JSON.parse(oldTasks) || []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleDelete = (taskIndex) => {
    const newTasks = tasks.filter((task, index) => index !== taskIndex);
    setTasks(newTasks);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === "todo");
  const doingTasks = tasks.filter(task => task.status === "doing");
  const doneTasks = tasks.filter(task => task.status === "done");

  return (
    <div className="TaskManager">
      <TaskForm setTasks={setTasks} />
      <main className="TaskManager_main">
        <TaskColumn
          title="To do"
          icon={todoIcon}
          tasks={todoTasks}
          status="todo"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        <TaskColumn
          title="Doing"
          icon={doingIcon}
          tasks={doingTasks}
          status="doing"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        <TaskColumn
          title="Done"
          icon={doneIcon}
          tasks={doneTasks}
          status="done"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
};

export default TaskManager;
