import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalData, setModalData] = useState(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [adminRes, usersRes, projectsRes, reportsRes, tasksRes] = await Promise.all([
        axios.get("https://employee-mangment-system-1.onrender.com/api/v1/adminpanel/get-user-info", { headers }),
        axios.get("https://employee-mangment-system-1.onrender.com/api/v1/users/getallUsers", { headers }),
        axios.get("https://employee-mangment-system-1.onrender.com/api/v1/projects/getAllProject", { headers }),
        axios.get("https://employee-mangment-system-1.onrender.com/api/v1/reports/getAllReports", { headers }),
        axios.get("https://employee-mangment-system-1.onrender.com/api/v1/task/getAllTasks", { headers }),
      ]);

      setLogs(adminRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
      setProjects(projectsRes.data?.data || []);
      setReports(reportsRes.data?.data || []);
      setTasks(tasksRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDate = (d) => new Date(d).toLocaleDateString();

  const formatHours = (hours) => {
    const totalSeconds = Math.floor(hours * 3600);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    return `${h}h ${m}m`;
  };

  const formatDateTime = (d) => {
    if (!d || d === "Active") return "Active";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupedByDate = {};

  logs.forEach((log) => {
    const d = getDate(log.loginTime || log.created_at);
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(log);
  });

  const handleSaveTask = async () => {
    if (!selectedUser || !taskTitle) {
      return alert("Fill all fields");
    }

    const assignedUserObj = users.find((u) => u.email === selectedUser);
    if (!assignedUserObj) return alert("Selected user not found");

    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingTask) {
        await axios.put(
          `https://employee-mangment-system-1.onrender.com/api/v1/task/updateTask/${editingTask._id}`,
          {
            taskName: taskTitle,
            description: taskDesc,
            assignedUser: selectedUser,
            assignedUserId: assignedUserObj._id,
          },
          { headers }
        );
        alert("Task Updated ✅");
      } else {
        await axios.post(
          "https://employee-mangment-system-1.onrender.com/api/v1/task/addTask",
          {
            taskName: taskTitle,
            description: taskDesc,
            assignedUser: selectedUser,
            assignedUserId: assignedUserObj._id,
          },
          { headers }
        );
        alert("Task Assigned ✅");
      }

      setTaskTitle("");
      setTaskDesc("");
      setSelectedUser("");
      setEditingTask(null);

      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error saving task");
    }
  };

  const handleDeleteTask = async (id) => {
    const confirm = window.confirm("Delete this task?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://employee-mangment-system-1.onrender.com/api/v1/task/deleteTask/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Task Deleted ❌");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error deleting task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.taskName);
    setTaskDesc(task.description);
    setSelectedUser(task.assignedUser);
  };

  //  Loader UI
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const totalWorkHours = logs.reduce((acc, log) => acc + (log.totalHoursWorked || 0), 0);

  return (
    <div className="admin-dashboard-adm">
      <h1 className="dashboard-title-adm">Admin Control Center</h1>

      <div className="task-create-box-adm">
        <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select User</option>

          {users
            .filter((u) => u.role !== "admin")
            .map((u) => (
              <option key={u._id} value={u.email}>
                {u.name}
              </option>
            ))}
        </select>

        <input
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />

        <button onClick={handleSaveTask}>
          {editingTask ? "Update Task" : "Assign Task"}
        </button>
      </div>

      <h2>All Tasks</h2>

      {tasks.map((t) => (
        <div key={t._id} className="task-card-adm">
          <h3>{t.taskName}</h3>

          <p>{t.description}</p>

          <p>
            <b>User:</b> {t.assignedUser}
          </p>

          <p>Status: {t.status}</p>

          <button onClick={() => handleEditTask(t)}>Edit</button>

          <button onClick={() => handleDeleteTask(t._id)}>Delete</button>
        </div>
      ))}

      <div className="stats-grid-adm">
        <div className="stat-card-adm">
          <h2>{users.length}</h2>
          <p>Total Users</p>
        </div>

        <div className="stat-card-adm">
          <h2>{projects.length}</h2>
          <p>Total Projects</p>
        </div>

        <div className="stat-card-adm">
          <h2>{formatHours(totalWorkHours)}</h2>
          <p>Total Work Logged</p>
        </div>

        <div className="stat-card-adm">
          <h2>{logs.length}</h2>
          <p>Total User Sessions</p>
        </div>
      </div>

      <div className="search-bar-adm">
        <input
          type="text"
          placeholder="Search by user name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {Object.keys(groupedByDate)
        .sort((a, b) => new Date(b) - new Date(a))
        .map((date, idx) => (
          <div key={idx} className="date-section-adm">
            <h2 className="date-title-adm">{date}</h2>

            <table className="table-adm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Project Details</th>
                  <th>Total Hours</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {groupedByDate[date]
                  .filter((log) => {
                    const user = users.find((u) => u.email === log.email) || { name: log.name };
                    return user?.name?.toLowerCase().includes(search.toLowerCase());
                  })
                  .map((log, i2) => {
                    const user = users.find((u) => u.email === log.email) || { name: log.name };

                    let detail = "";
                    if (log.ProjectNames && Object.keys(log.ProjectNames).length > 0) {
                      detail = Object.entries(log.ProjectNames)
                        .map(([p, h]) => `${p} (${formatHours(h)})`)
                        .join(", ");
                    } else {
                      detail = "No projects";
                    }

                    const total = log.totalHoursWorked || 0;

                    return (
                      <tr key={i2}>
                        <td>{user?.name}</td>

                        <td>{log.email}</td>

                        <td>{formatDateTime(log.loginTime)}</td>

                        <td>{formatDateTime(log.logoutTime)}</td>

                        <td>{detail}</td>

                        <td>{formatHours(total)}</td>

                        <td>
                          <button
                            className="view-btn-adm"
                            onClick={() => {
                              const assignedUserId = log.userId || users.find((u) => u.email === log.email)?._id;
                              setModalData({
                                email: log.email,
                                userId: assignedUserId,
                                date,
                                detail,
                                total,
                              });
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ))}

      {modalData && (
        <div className="report-modal-adm">
          <div className="report-content-adm">
            <h2>User Work Details ({modalData.date})</h2>

            {/* REPORT */}
            <h3>Daily Report</h3>

            <p>
              {reports.find(
                (r) =>
                 String(r.userId?._id || r.userId) === String(modalData.userId) &&
                  getDate(r.date || r.createdAt ) === modalData.date
              )?.report || "No report submitted"}
            </p>

            {/* TASKS */}
            <h3>Tasks</h3>

            <ul>
              {tasks
                .filter(
                  (t) =>
                    (t.assignedUserId === modalData.userId || t.assignedUser === modalData.email) &&
                    getDate(t.createdAt || t.created_at) === modalData.date
                )
                .map((t, i) => (
                  <li key={i}>
                    {t.taskName} — <b>{t.status}</b>
                  </li>
                ))}
            </ul>

            {/* PROJECT WORK */}
            <h3>Project Work</h3>

            <p>{modalData.detail}</p>

            <p>
              <b>Total Hours: {formatHours(modalData.total)}</b>
            </p>

            <button onClick={() => setModalData(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;