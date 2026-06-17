import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/CreateUser.css";

function CreateUser() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single();

    if (data?.role === "admin") {
      setIsAdmin(true);
      await fetchUsers();
    }

    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("id");

    setUsers(data || []);
  };

  // ✅ Premium Loader
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <h2 className="user-access-denied-usr">Access Denied</h2>;
  }

  const openAdd = () => {
    setEditUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowModal(true);
  };

  const openEdit = (u) => {
    console.log(u);

    if (u.role === "admin") {
      alert("Admin cannot be edited");
      return;
    }

    setEditUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !email) return alert("Fill all fields");

    // ✅ EDIT USER
    if (editUser) {
      console.log(editUser);

      await supabase
        .from("users")
        .update({ name, email })
        .eq("id", editUser.id);

      // ✅ update password only if entered
      if (password) {
        await supabase.auth.admin.updateUserById(
          editUser.auth_id,
          {
            password: password,
          }
        );
      }

      alert("User updated");
    }

    // ✅ CREATE USER
    else {
      if (!password) return alert("Password required");

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      const authId = data.user.id;

      if (error) {
        alert(error.message);
        return;
      }

      // insert profile in users table
      await supabase.from("users").insert([
        {
          name,
          email,
          role: "user",
          auth_id: authId,
        },
      ]);

      alert("User created successfully");
    }

    setShowModal(false);

    fetchUsers();
  };

  const handleDelete = async (id, role, name, email) => {
    if (role === "admin") {
      alert("Admin cannot be deleted");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${name} (${email})? This action cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("User removed from system");
    fetchUsers();
  };

  return (
    <div className="emp-container-usr">
      <div className="emp-header-usr">
        <h2>Employee Management</h2>

        <button className="add-btn-usr" onClick={openAdd}>
          + Add Employee
        </button>
      </div>

      <table className="emp-table-usr">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="name-cell-usr">
                <div className="avatar-usr">
                  {u.name?.charAt(0).toUpperCase()}
                </div>

                {u.name}
              </td>

              <td>{u.email}</td>

              <td>
                <span className={`role-usr ${u.role}-usr`}>
                  {u.role}
                </span>
              </td>

              <td>
                {u.role !== "admin" ? (
                  <>
                    <button
                      className="edit-usr"
                      onClick={() => openEdit(u)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-usr"
                      onClick={() =>
                        handleDelete(
                          u.id,
                          u.role,
                          u.name,
                          u.email
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="admin-protected-usr">
                    Protected
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-usr">
          <div className="modal-card-usr">
            <h3>
              {editUser
                ? "Edit Employee"
                : "Add Employee"}
            </h3>

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="modal-actions-usr">
              <button onClick={handleSave}>Save</button>

              <button
                className="cancel-usr"
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

export default CreateUser; 