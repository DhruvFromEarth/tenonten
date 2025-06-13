import React, { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ task, onClose, onUpdate, onStatusChange, users }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.taskTitle,
    description: task.taskDescription,
    status: task.status,
    assignedTo: task.assignedTo || []
  });

  useEffect(() => {
    setEditedTask({
      title: task.taskTitle,
      description: task.taskDescription,
      status: task.status,
      assignedTo: task.assignedTo || []
    });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;
    if (selectedUserId && !editedTask.assignedTo.includes(selectedUserId)) {
      setEditedTask(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, selectedUserId]
      }));
    }
  };

  const removeUser = (userId) => {
    setEditedTask(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== userId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(task._id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusChange(task._id, newStatus);
      setEditedTask(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.userName : userId;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{isEditing ? 'Edit Task' : 'Task Details'}</h4>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Title :</label>
                <input
                  type="text"
                  name="title"
                  value={editedTask.title}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Description :</label>
                <textarea
                  name="description"
                  value={editedTask.description}
                  onChange={handleChange}
                  className="modal-textarea"
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={editedTask.status}
                  onChange={handleChange}
                  className="modal-select"
                >
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To:</label>
                <div className="assigned-list">
                  {editedTask.assignedTo.map((userId, index) => (
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
                <select
                  name="assignedTo"
                  value=""
                  onChange={handleUserSelect}
                  className="modal-select"
                >
                  <option value="">Add user...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.userName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-body">
              <div className="task-detail">
                <h3>Title :</h3>
                <p>{task.taskTitle}</p>
              </div>

              <div className="task-detail">
                <h3>Description :</h3>
                <p>{task.taskDescription}</p>
              </div>

              <div className="task-detail">
                <h3>Created By:</h3>
                <p>{getUserName(task.createdBy)}</p>
              </div>

              <div className="task-detail">
                <h3>Status</h3>
                <div className="status-buttons">
                  <div className="status-row">
                  <button
                    className={`status-button ${editedTask.status === 'todo' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('todo')}
                  >
                    To Do
                  </button>
                    {task.timestamp?.todo && (
                      <span className="status-time">
                        {getUserName(task.timestamp.todo.userId)} - {new Date(task.timestamp.todo.date).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="status-row">
                  <button
                    className={`status-button ${editedTask.status === 'doing' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('doing')}
                  >
                    Doing
                  </button>
                    {task.timestamp?.doing && (
                      <span className="status-time">
                        {getUserName(task.timestamp.doing.userId)} - {new Date(task.timestamp.doing.date).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="status-row">
                  <button
                    className={`status-button ${editedTask.status === 'done' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('done')}
                  >
                    Done
                  </button>
                    {task.timestamp?.done && (
                      <span className="status-time">
                        {getUserName(task.timestamp.done.userId)} - {new Date(task.timestamp.done.date).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="task-detail">
                <h3>Assigned To</h3>
                <div className="assigned-list">
                  {task.assignedTo?.map((userId, index) => (
                    <div key={index} className="assigned-user">
                      {getUserName(userId)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsEditing(true)} className="edit-button">
                Edit Task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;