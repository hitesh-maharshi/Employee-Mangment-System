import { useEffect, useState } from "react";
import "../styles/Projects.css";
import Sidebar from "../components/Sidebar";

const API_BASE_URL = 'https://employee-mangment-system-1.onrender.com/api/v1';

async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || `API Error: ${response.status}`);
  return json;
}

function Projects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  // 🔹 Admin fetch (all data)
  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        apiCall('/projects/getAllProject'),
        apiCall('/users/getallUsers')
      ]);
      
      setProjects(projectsRes.data || []);
      // Include users with role employee or user
      setUsers((usersRes.data || []).filter(u => u.role === 'employee' || u.role === 'user'));
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    }
  };

  // 🔹 User fetch (only assigned projects)
  const fetchUserProjects = async () => {
    try {
      const { data } = await apiCall('/projects/my-projects');
      setProjects(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load user projects.");
    }
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUserEmail(user.email);

    if (user.role === "admin") {
      setIsAdmin(true);
      await fetchData();
    } else {
      setIsUser(true);
      await fetchUserProjects();
    }

    setLoading(false);
  };

  const openAdd = () => {
    setEditProject(null);
    setTitle("");
    setDescription("");
    setSelectedUserId("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setTitle(p.projectName);
    setDescription(p.description || "");
    setSelectedUserId(p.assignedUser?._id || p.assignedUser || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title || !description || !selectedUserId) return alert("Fill all fields");

    try {
      if (editProject) {
        await apiCall(`/projects/updateProject/${editProject._id}`, 'PUT', {
          projectName: title,
          description: description,
          assignedUser: selectedUserId
        });
      } else {
        await apiCall('/projects/addProject', 'POST', {
          projectName: title,
          description: description,
          assignedUser: selectedUserId
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error saving project: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await apiCall(`/projects/deleteProject/${id}`, 'DELETE');
      fetchData();
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  };

  // ✅ Loader UI
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="proj-container-prj">
      <Sidebar />

      <div className="proj-content-prj">
        <div className="proj-header-prj">
          <h2>{isAdmin ? "Project Management" : "My Projects"}</h2>

          {isAdmin && (
            <button className="add-btn-prj" onClick={openAdd}>
              + Add Project
            </button>
          )}
        </div>

        <table className="proj-table-prj">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Assigned User</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {projects.length > 0 ? (
              projects.map((p) => (
                <tr key={p._id}>
                  <td>{p.projectName}</td>
                  <td>{p.description}</td>
                  <td>
                    {isAdmin ? p.assignedUserName : (p.assignedUser?.name || p.assignedUserName || "Unknown")}
                  </td>

                  {isAdmin && (
                    <td>
                      <button
                        className="edit-prj"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-prj"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: "center" }}>
                  No Projects Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Modal only for Admin */}
      {showModal && isAdmin && (
        <div className="modal-prj">
          <div className="modal-card-prj">
            <h3>{editProject ? "Edit Project" : "Add Project"}</h3>

            <input
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select User</option>

              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <div className="modal-actions-prj">
              <button onClick={handleSave}>Save</button>

              <button
                className="cancel-prj"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;