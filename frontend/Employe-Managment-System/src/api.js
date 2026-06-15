const API_BASE_URL = 'http://localhost:8000/api/v1';

// Exported so components can call raw endpoints if needed
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Throw API error with message
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Save tokens and user info
    if (res.data?.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async register(name, email, password, role) {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async logout() {
    try {
      await apiRequest('/users/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Forgot / Reset Password
  async forgotPassword(email) {
    return apiRequest('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email, otp, newPassword) {
    return apiRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  // Time logging (Employees)
  async saveTime(project, totalTime, description) {
    return apiRequest('/timelog/saveTime', {
      method: 'POST',
      body: JSON.stringify({ project, totalTime, description }),
    });
  },

  async getUserTime() {
    return apiRequest('/timelog/getUserTime');
  },

  async getProjectSummary() {
    return apiRequest('/timelog/ProjectSummery');
  },

  // Reports
  async submitReport(reportContent) {
    return apiRequest('/reports/addReport', {
      method: 'POST',
      body: JSON.stringify({ report: reportContent }),
    });
  },

  async getMyReports() {
    return apiRequest('/reports/getAllReports');
  },

  async getUserReports(userId) {
    return apiRequest(`/reports/getUserReports/${userId}`);
  },

  // Tasks
  async getMyTasks() {
    return apiRequest('/task/getTaskById');
  },

  async getAllTasks() {
    return apiRequest('/task/getAllTasks');
  },

  // Admin specific
  async getAdminUserInfo(dateString) {
    const query = dateString ? `?date=${dateString}` : '';
    return apiRequest(`/adminpanel/get-user-info${query}`);
  },

  async viewUserInfo(userId, dateString) {
    const query = dateString ? `?date=${dateString}` : '';
    return apiRequest(`/adminpanel/view-user-info/${userId}${query}`);
  },

  async getAllUsers() {
    return apiRequest('/users/getallUsers');
  },

  async createTask(taskName, description, assignedUserId, assignedUser) {
    return apiRequest('/task/addTask', {
      method: 'POST',
      body: JSON.stringify({ taskName, description, assignedUserId, assignedUser }),
    });
  },

  async updateTask(taskId, taskName, description, assignedUserId, assignedUser, status) {
    return apiRequest(`/task/updateTask/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ taskName, description, assignedUserId, assignedUser, ...(status && { status }) }),
    });
  },

  async deleteTask(taskId) {
    return apiRequest(`/task/deleteTask/${taskId}`, {
      method: 'DELETE',
    });
  }
};
