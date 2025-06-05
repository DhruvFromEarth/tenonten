import React, { useState, useEffect } from "react";
import axios from "../../providers/axios";
import "./TaskManager.css";
import TaskForm from "./components/TaskForm";
import TaskColumn from "./components/TaskColumn";
import TaskModal from "./components/TaskModal";
import todoIcon from "./assets/direct-hit.png";
import doingIcon from "./assets/glowing-star.png";
import doneIcon from "./assets/check-mark-button.png";
import { AuthModal } from "../../components/AuthModal";
// import { useNavigate } from "react-router-dom";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userName'));
  const [users, setUsers] = useState([]);
  // const navigate = useNavigate();

  // Fetch tasks and users on component mount
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleError = (error) => {
    console.error("Error:", error);
    if (error.response?.status === 403) {
      setShowAuthModal(true);
    }
  };

  const fetchTasks = async () => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        console.log('No organization selected');
        setTasks([]);
        return;
      }
      const response = await axios.get(`/task?organisationName=${selectedOrg}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      handleError(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        console.log('No organization selected');
        setUsers([]);
        return;
      }
      const response = await axios.post('/org/users', {
        organisationName: selectedOrg
      });
      console.log('Fetched users:', response.data); // Debug log
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      handleError(error);
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      console.log("TaskManager: Creating task with data:", newTask); // Debug log
      
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        alert('Please select an organization first');
        return;
      }

      const response = await axios.post(`/task`, {
        ...newTask,
        organisationName: selectedOrg
      });

      console.log("TaskManager: Server response:", response.data); // Debug log
      
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("TaskManager: Error creating task:", error);
      if (error.response) {
        console.error("Error response:", error.response.data); // Debug log
      }
      handleError(error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        alert('Please select an organization first');
        return;
      }
      const response = await axios.delete(`/task/${taskId}?organisationName=${selectedOrg}`);
      if (response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      handleError(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        alert('Please select an organization first');
        return;
      }
      const response = await axios.patch(`/task/${taskId}/status?organisationName=${selectedOrg}`, {
        status: newStatus
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Error updating task status:", error);
      handleError(error);
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        alert('Please select an organization first');
        return;
      }
      const response = await axios.patch(`/task/${taskId}`, {
        taskTitle: updatedTask.title,
        taskDescription: updatedTask.description,
        assignedTo: updatedTask.assignedTo || [],
        organisationName: selectedOrg
      });
      if (response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      handleError(error);
    }
  };

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === "todo");
  const doingTasks = tasks.filter(task => task.status === "doing");
  const doneTasks = tasks.filter(task => task.status === "done");

  return (
    <div className="TaskManager">
      {showAuthModal && <AuthModal 
        showModal={showAuthModal} 
        setShowModal={setShowAuthModal}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />}
      <TaskForm onSubmit={handleCreateTask} users={users} />
      <main className="TaskManager_main">
        <TaskColumn
          title="To do"
          icon={todoIcon}
          tasks={todoTasks}
          status="todo"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateTask}
          onTaskClick={setSelectedTask}
          users={users}
        />
        <TaskColumn
          title="Doing"
          icon={doingIcon}
          tasks={doingTasks}
          status="doing"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateTask}
          onTaskClick={setSelectedTask}
          users={users}
        />
        <TaskColumn
          title="Done"
          icon={doneIcon}
          tasks={doneTasks}
          status="done"
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateTask}
          onTaskClick={setSelectedTask}
          users={users}
        />
      </main>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onStatusChange={handleStatusChange}
          users={users}
        />
      )}
    </div>
  );
};

export default TaskManager; 