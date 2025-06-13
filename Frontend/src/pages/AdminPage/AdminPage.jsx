import React, { useState, useEffect } from 'react';
import axios from '../../providers/axios';
import './AdminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [projectHierarchy, setProjectHierarchy] = useState([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchJoinRequests();
    fetchProjectHierarchy();
  }, []);

  const fetchUsers = async () => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        setError('No organization selected');
        setLoading(false);
        return;
      }

      const response = await axios.post('/org/users', {
        organisationName: selectedOrg
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        return;
      }

      const response = await axios.post('/org/join-requests', {
        organisationName: selectedOrg
      });
      console.log('Fetched join requests:', response.data);
      setJoinRequests(response.data);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      setError('Failed to fetch join requests');
    }
  };

  const fetchProjectHierarchy = async () => {
    try {
      setLoadingHierarchy(true);
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        setError('No organization selected');
        setLoadingHierarchy(false);
        return;
      }

      // Use the new recursive members endpoint
      const response = await axios.post('/org/recursive-members', {
        organisationName: selectedOrg
      });

      setProjectHierarchy(response.data);
      setLoadingHierarchy(false);
    } catch (error) {
      console.error('Error fetching project hierarchy:', error);
      setError('Failed to fetch project hierarchy');
      setLoadingHierarchy(false);
    }
  };

  const handleJoinRequestResponse = async (requestId, action) => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        setError('No organization selected');
        return;
      }

      await axios.post('/org/join-request-response', {
        organisationName: selectedOrg,
        requestId,
        action
      });

      fetchUsers();
      fetchJoinRequests();
    } catch (error) {
      console.error('Error handling join request:', error);
      setError(error.response?.data?.message || 'Failed to process request');
    }
  };

  const handleRemoveUser = (user) => {
    setUserToRemove(user);
    setShowRemoveModal(true);
  };

  const confirmRemoveUser = async () => {
    try {
      if (confirmUsername !== userToRemove.userName) {
        setError('Username does not match');
        return;
      }

      const selectedOrg = localStorage.getItem('selectedOrganisation');
      await axios.post('/org/remove-user', {
        organisationName: selectedOrg,
        userName: userToRemove.userName
      });

      setShowRemoveModal(false);
      setUserToRemove(null);
      setConfirmUsername('');
      fetchUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      setError(error.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleEditRole = (user) => {
    setEditingRole(user._id);
    setNewRole(user.role || '');
  };

  const handleSaveRole = async (user) => {
    try {
      const selectedOrg = localStorage.getItem('selectedOrganisation');
      if (!selectedOrg) {
        setError('No organization selected');
        return;
      }

      await axios.post('/org/update-role', {
        organisationName: selectedOrg,
        userName: user.userName,
        role: newRole
      });

      setEditingRole(null);
      setNewRole('');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setNewRole('');
  };

  if (loading) {
    return <div className="admin-page">Loading...</div>;
  }

  if (error) {
    return <div className="admin-page error">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1>Organization Management</h1>

      <div className="users-list">
        <h2>Organization Members</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Tasks Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.userName} ({user.position})</td>
                <td>
                  {editingRole === user._id ? (
                    <div className="role-edit">
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Enter role"
                      />
                      <div className="role-edit-actions">
                        <button onClick={() => handleSaveRole(user)} className="save-button">
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span>{user.role || 'No role assigned'}</span>
                  )}
                </td>
                <td>{user.taskCount ? `${user.taskCount.todo} - ${user.taskCount.doing} - ${user.taskCount.done}` : '0 - 0 - 0'}</td>
                <td>
                  <button
                    onClick={() => handleEditRole(user)}
                    className="edit-button"
                    // disabled={user.position === 'admin'}
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user)}
                    className="remove-button"
                    disabled={user.position === 'admin'}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notification-section">
        <h2>Join Requests</h2>
        {joinRequests.length === 0 ? (
          <p>No pending join requests</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {joinRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.userName}</td>
                  <td>{new Date(request.requestedAt).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleJoinRequestResponse(request._id, 'approve')}
                      className="approve-button"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleJoinRequestResponse(request._id, 'reject')}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="project-hierarchy">
        <h2>Project Hierarchy</h2>
        {loadingHierarchy ? (
          <p>Loading project hierarchy...</p>
        ) : (
          <table className="hierarchy-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Organizations</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {projectHierarchy.map((user) => (
                <tr key={user.userName}>
                  <td>{user.userName}</td>
                  <td>
                    <ul className="org-list">
                      {user.projects.map((project, index) => (
                        <li key={index}>
                          {project.projectName} ({project.position})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <ul className="skills-list">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <li key={index} className="skill-tag">{skill}</li>
                        ))
                      ) : (
                        <li className="no-skills">No skills listed</li>
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm User Removal</h3>
            <p>Are you sure you want to remove {userToRemove.userName}?</p>
            <p>Type the username to confirm:</p>
            <input
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder="Enter username to confirm"
            />
            <div className="modal-actions">
              <button onClick={confirmRemoveUser} className="confirm-button">
                Confirm Remove
              </button>
              <button onClick={() => {
                setShowRemoveModal(false);
                setUserToRemove(null);
                setConfirmUsername('');
              }} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;