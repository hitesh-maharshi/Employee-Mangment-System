const API_BASE_URL = 'https://employee-mangment-system-1.onrender.com/api/v1';

// Helpers to make fetch calls with accessToken automatically attached
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const json = await response.json();

  if (!response.ok) {
    // If the token is expired or invalid, log the user out and redirect
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    throw new Error(json.message || `API Error: ${response.status}`);
  }

  return json;
}

// Global cached list of users to resolve emails/names to MongoDB ObjectIds
let usersCache = null;
async function getCachedUsers() {
  if (usersCache) return usersCache;
  try {
    const res = await apiCall('/users/getallUsers');
    usersCache = res.data || [];
    return usersCache;
  } catch (err) {
    console.error('Failed to pre-cache users:', err);
    return [];
  }
}

class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.queryType = 'select'; // 'select' | 'insert' | 'update' | 'delete'
    this.filters = []; // { field, value }
    this.payload = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
  }

  select(fields) {
    this.queryType = 'select';
    return this;
  }

  insert(data) {
    this.queryType = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.queryType = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.queryType = 'delete';
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  is(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  order(field, options) {
    // We sort locally or ignore sorting options
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Chained Promise execution
  async then(onfulfilled, onrejected) {
    try {
      const data = await this.execute();
      return onfulfilled({ data, error: null });
    } catch (err) {
      console.error(`Supabase Mock [${this.tableName}] error:`, err);
      if (onrejected) {
        return onrejected({ data: null, error: { message: err.message } });
      }
      return { data: null, error: { message: err.message } };
    }
  }

  async execute() {
    const filterMap = {};
    this.filters.forEach(f => {
      filterMap[f.field] = f.value;
    });

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // ─────────────────────────────────────────────────────────────────
    // 1. USERS TABLE
    // ─────────────────────────────────────────────────────────────────
    if (this.tableName === 'users') {
      if (this.queryType === 'select') {
        const usersList = await getCachedUsers();
        // Include admin if matching admin email
        const allUsers = [...usersList];
        if (currentUser && currentUser.role === 'admin') {
          // Add admin user representation
          if (!allUsers.some(u => u.email === currentUser.email)) {
            allUsers.push(currentUser);
          }
        }
        
        let mapped = allUsers.map(u => ({
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        }));

        if (filterMap.role) {
          mapped = mapped.filter(u => u.role === filterMap.role);
        }
        if (filterMap.email) {
          mapped = mapped.filter(u => u.email === filterMap.email);
        }

        if (this.isSingle || this.isMaybeSingle) {
          return mapped[0] || null;
        }
        return mapped;
      }

      if (this.queryType === 'insert') {
        // Sign-up handles user creation, so insert can be a success callback
        usersCache = null; // Clear cache
        return this.payload;
      }

      if (this.queryType === 'update') {
        usersCache = null;
        return [this.payload];
      }

      if (this.queryType === 'delete') {
        const userId = filterMap.id;
        await apiCall(`/users/deleteUser/${userId}`, 'DELETE');
        usersCache = null;
        return null;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. PROJECTS TABLE
    // ─────────────────────────────────────────────────────────────────
    if (this.tableName === 'projects') {
      if (this.queryType === 'select') {
        let res;
        if (currentUser && currentUser.role === 'admin') {
          res = await apiCall('/projects/getAllProject');
        } else {
          res = await apiCall('/projects/my-projects');
        }

        let projects = res.data || [];
        let mapped = projects.map(p => ({
          id: p._id,
          title: p.projectName,
          assigneduser: p.assignedUserName || (p.assignedUser && p.assignedUser.name) || '',
        }));

        if (filterMap.assigneduser) {
          mapped = mapped.filter(p => p.assigneduser.includes(filterMap.assigneduser));
        }

        return mapped;
      }

      if (this.queryType === 'insert') {
        const item = this.payload[0] || this.payload;
        // Resolve email to user _id
        const usersList = await getCachedUsers();
        const targetUser = usersList.find(u => u.email === item.assigneduser);

        const res = await apiCall('/projects/addProject', 'POST', {
          projectName: item.title,
          description: item.title,
          assignedUser: targetUser ? targetUser._id : currentUser._id,
        });

        return [
          {
            id: res.data._id,
            title: res.data.projectName,
            assigneduser: res.data.assignedUserName,
          },
        ];
      }

      if (this.queryType === 'update') {
        const item = this.payload;
        const projId = filterMap.id;

        const usersList = await getCachedUsers();
        const targetUser = usersList.find(u => u.email === item.assigneduser);

        const res = await apiCall(`/projects/updateProject/${projId}`, 'PUT', {
          projectName: item.title,
          description: item.title,
          assignedUser: targetUser ? targetUser._id : currentUser._id,
        });

        return [
          {
            id: res.data._id,
            title: res.data.projectName,
            assigneduser: res.data.assignedUserName,
          },
        ];
      }

      if (this.queryType === 'delete') {
        const projId = filterMap.id;
        await apiCall(`/projects/deleteProject/${projId}`, 'DELETE');
        return null;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. TIMEENTRIES TABLE
    // ─────────────────────────────────────────────────────────────────
    if (this.tableName === 'timeentries') {
      if (this.queryType === 'select') {
        // If employee, fetch active time logs
        const res = await apiCall('/timelog/getUserTime');
        const logs = res.data || [];
        return logs.map(l => ({
          id: l._id,
          projectid: l.project, // contains project ID or name
          hours: l.totalTime,
          date: l.date,
          useremail: currentUser ? currentUser.email : '',
          description: l.description,
        }));
      }

      if (this.queryType === 'insert') {
        const item = this.payload[0] || this.payload;
        const res = await apiCall('/timelog/saveTime', 'POST', {
          project: item.projectid,
          totalTime: Number(item.hours),
          description: `Logged hours via timer`,
        });

        const createdLog = res.data;
        return [
          {
            id: createdLog._id,
            projectid: createdLog.project,
            hours: createdLog.totalTime,
            date: createdLog.date,
            useremail: currentUser ? currentUser.email : '',
            description: createdLog.description,
          },
        ];
      }

      if (this.queryType === 'delete') {
        const logId = filterMap.id;
        await apiCall(`/timelog/deleteTime/${logId}`, 'DELETE');
        return null;
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. DAILY REPORTS TABLE
    // ─────────────────────────────────────────────────────────────────
    if (this.tableName === 'daily_reports') {
      if (this.queryType === 'select') {
        // Get user reports
        let reports = [];
        try {
          const res = await apiCall('/reports/getUserReports/' + (currentUser ? currentUser._id : ''));
          reports = res.data || [];
        } catch (err) {
          // If no reports yet
          reports = [];
        }

        const mapped = reports.map(r => ({
          id: r._id,
          useremail: filterMap.useremail || (currentUser ? currentUser.email : ''),
          report_date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          report_text: r.report,
        }));

        if (this.isSingle || this.isMaybeSingle) {
          return mapped[0] || null;
        }
        return mapped;
      }

      if (this.queryType === 'insert') {
        const item = this.payload[0] || this.payload;
        const res = await apiCall('/reports/addReport', 'POST', {
          report: item.report_text,
        });

        return [
          {
            id: res.data._id,
            useremail: currentUser ? currentUser.email : '',
            report_date: new Date().toISOString().split('T')[0],
            report_text: res.data.report,
          },
        ];
      }

      if (this.queryType === 'update') {
        // Mock update as success
        return [this.payload];
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. TASKS TABLE
    // ─────────────────────────────────────────────────────────────────
    if (this.tableName === 'tasks') {
      if (this.queryType === 'select') {
        let res;
        if (currentUser && currentUser.role === 'admin') {
          res = await apiCall('/task/getAllTasks');
        } else {
          res = await apiCall('/task/getTaskById'); // returns tasks assigned to user
        }

        const tasksList = res.data || [];
        const usersList = await getCachedUsers();

        return tasksList.map(t => {
          const userObj = usersList.find(u => u._id === t.assignedUserId);
          return {
            id: t._id,
            title: t.taskName,
            description: t.description,
            assigned_to: userObj ? userObj.email : t.assignedUser,
            status: t.status === 'completed' ? 'done' : t.status,
            task_date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          };
        });
      }

      if (this.queryType === 'insert') {
        const item = this.payload[0] || this.payload;
        const usersList = await getCachedUsers();
        const targetUser = usersList.find(u => u.email === item.assigned_to);

        const res = await apiCall('/task/addTask', 'POST', {
          taskName: item.title,
          description: item.description || '',
          assignedUserId: targetUser ? targetUser._id : currentUser._id,
          assignedUser: targetUser ? targetUser.name : (currentUser ? currentUser.name : 'Unknown'),
        });

        return [
          {
            id: res.data._id,
            title: res.data.taskName,
            description: res.data.description,
            assigned_to: item.assigned_to,
            status: 'pending',
            task_date: new Date().toISOString().split('T')[0],
          },
        ];
      }

      if (this.queryType === 'update') {
        const item = this.payload;
        const taskId = filterMap.id;

        let res;
        if (item.status === 'done') {
          // Employee calling markAsDone
          res = await apiCall(`/task/markAsDone/${taskId}`, 'PUT');
        } else {
          // Admin calling normal updateTask
          const usersList = await getCachedUsers();
          const targetUser = usersList.find(u => u.email === item.assigned_to);

          res = await apiCall(`/task/updateTask/${taskId}`, 'PUT', {
            taskName: item.title,
            description: item.description,
            assignedUserId: targetUser ? targetUser._id : undefined,
            assignedUser: targetUser ? targetUser.name : undefined,
            status: item.status,
          });
        }

        return [
          {
            id: res.data._id,
            title: res.data.taskName,
            description: res.data.description,
            status: res.data.status === 'completed' ? 'done' : res.data.status,
          },
        ];
      }

      if (this.queryType === 'delete') {
        const taskId = filterMap.id;
        await apiCall(`/task/deleteTask/${taskId}`, 'DELETE');
        return null;
      }
    }

    
    // 6. LOGIN LOGS TABLE (Local storage simulation)
    
    if (this.tableName === 'loginLogs') {
      if (this.queryType === 'select') {
        // Admin pulls loginLogs to render table. Let's hit the admin panel info endpoint!
        const todayStr = new Date().toISOString().split('T')[0];
        let adminRecords = [];
        try {
          const res = await apiCall('/adminpanel/get-user-info?date=' + todayStr);
          adminRecords = res.data || [];
        } catch (err) {
          adminRecords = [];
        }

        return adminRecords.map((r, index) => ({
          id: r._id || index,
          email: r.email,
          login: r.loginTime,
          logout: r.logoutTime === 'Active' ? null : r.logoutTime,
        }));
      }

      if (this.queryType === 'insert') {
        // Node backend automatically creates login record, return mock success
        return this.payload;
      }

      if (this.queryType === 'update') {
        // Node backend automatically logs out user, return mock success
        return this.payload;
      }
    }

    return [];
  }
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      try {
        const res = await apiCall('/users/login', 'POST', { email, password });
        const data = res.data;

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        return { data: { user: { id: data.user._id, email: data.user.email } }, error: null };
      } catch (err) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signOut() {
      try {
        await apiCall('/users/logout', 'POST');
      } catch (err) {
        console.error('Logout API failure:', err);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        usersCache = null;
      }
      return { error: null };
    },

    async getUser() {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      return { data: { user: user ? { id: user._id, email: user.email } : null }, error: null };
    },

    async signUp({ email, password }) {
      try {
        const res = await apiCall('/users/register', 'POST', {
          name: email.split('@')[0],
          email,
          password,
          role: 'employee',
        });
        return { data: { user: { id: res.data._id, email: res.data.email } }, error: null };
      } catch (err) {
        return { data: null, error: { message: err.message } };
      }
    },

    admin: {
      async updateUserById(authId, payload) {
        // Mock updateUserById successfully
        return { data: {}, error: null };
      },
    },
  },

  from(tableName) {
    return new QueryBuilder(tableName);
  },

  async getDashboard() {
    try {
      const res = await apiCall('/users/dashboard');
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
};
