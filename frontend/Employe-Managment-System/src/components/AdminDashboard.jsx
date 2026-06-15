import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, PlusCircle, Briefcase, UserCheck, FileText, CheckCircle2, ListFilter, Calendar, ChevronRight, X, User as UserIcon, LogOut } from 'lucide-react';

export default function AdminDashboard({ user, onSignOut }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeRecords, setEmployeeRecords] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Task assignment form states
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

  // Selected employee detail view
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('employee-status'); // 'employee-status' | 'assign-tasks' | 'reports'

  useEffect(() => {
    fetchEmployeeLogs();
    fetchUsersList();
  }, [date]);

  const fetchEmployeeLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminUserInfo(date);
      setEmployeeRecords(res.data || []);
    } catch (err) {
      setEmployeeRecords([]);
      // Only set error if it's a real failure, not just "no logins today"
      if (err.message !== 'No user info found for today') {
        setError(err.message || 'Failed to load employee info.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    setUsersLoading(true);
    try {
      const res = await api.getAllUsers();
      setAllUsers(res.data || []);
      if (res.data && res.data.length > 0) {
        setAssignedUserId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskName || !taskDesc || !assignedUserId) {
      setError('All task fields are required');
      return;
    }
    setError('');
    setSuccess('');
    setTaskLoading(true);

    const selectedEmployeeObj = allUsers.find(u => u._id === assignedUserId);
    if (!selectedEmployeeObj) {
      setError('Invalid employee selected');
      setTaskLoading(false);
      return;
    }

    try {
      await api.createTask(taskName, taskDesc, assignedUserId, selectedEmployeeObj.name);
      setSuccess(`Task successfully assigned to ${selectedEmployeeObj.name}!`);
      setTaskName('');
      setTaskDesc('');
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await api.viewUserInfo(userId, date);
      setSelectedUserDetail(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load employee activity details.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Top Header */}
      <header className="glass-panel" style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <UserIcon size={20} color="#fff" />
          </div>
          <div>
            <h1 style={styles.username}>{user.name}</h1>
            <p style={styles.userRole}>Admin Portal • {user.email}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="btn btn-secondary" style={styles.signOutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Admin Action Tabs */}
      <div style={styles.mainGrid}>
        
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Admin Console</h3>
          <nav style={styles.navMenu}>
            <button 
              onClick={() => setActiveTab('employee-status')} 
              style={{...styles.navBtn, ...(activeTab === 'employee-status' && styles.navBtnActive)}}
            >
              <UserCheck size={18} />
              <span>Today's Logins</span>
            </button>
            <button 
              onClick={() => setActiveTab('assign-tasks')} 
              style={{...styles.navBtn, ...(activeTab === 'assign-tasks' && styles.navBtnActive)}}
            >
              <PlusCircle size={18} />
              <span>Assign New Task</span>
            </button>
          </nav>

          {/* Date Picker Filter */}
          <div style={styles.datePickerContainer}>
            <label className="form-label">
              <Calendar size={14} style={{ marginRight: '6px' }} />
              <span>Filter Date</span>
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        {/* Dynamic Center content */}
        <div style={styles.centerContent}>
          {error && <div className="glass-panel" style={styles.errorAlert}>{error}</div>}
          {success && <div className="glass-panel" style={styles.successAlert}>{success}</div>}

          {activeTab === 'employee-status' && (
            <div style={styles.tabPanel}>
              
              {/* Today's Logins List */}
              <div className="glass-panel" style={styles.panelCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Employee Login Records for ({date})</h3>
                  <ListFilter size={18} color="var(--text-muted)" />
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="loader" />
                  </div>
                ) : employeeRecords.length === 0 ? (
                  <p style={styles.noData}>No employees logged in or registered activity for this date.</p>
                ) : (
                  <div style={styles.logsTable}>
                    {employeeRecords.map((record, index) => (
                      <div key={record._id || index} style={styles.logRow} className="glass-panel-hover">
                        <div style={styles.rowMain}>
                          <div>
                            <h4 style={styles.empName}>{record.name}</h4>
                            <p style={styles.empEmail}>{record.email}</p>
                          </div>
                          
                          <div style={styles.timeBadgeBox}>
                            <span style={styles.loginLabel}>Logged:</span>
                            <span style={styles.loginTime}>
                              {new Date(record.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={styles.workHoursBox}>
                            <span style={styles.hoursVal}>{record.totalHoursWorked || 0} hrs</span>
                            <span style={styles.hoursLabel}>Worked</span>
                          </div>
                        </div>

                        {/* Projects map display */}
                        <div style={styles.projectsContainer}>
                          <span style={styles.projTitle}>Active Projects today:</span>
                          <div style={styles.projBadges}>
                            {record.ProjectNames && Object.keys(record.ProjectNames).length > 0 ? (
                              Object.entries(record.ProjectNames).map(([proj, hrs]) => (
                                <span key={proj} style={styles.projBadge}>
                                  {proj}: {hrs} hrs
                                </span>
                              ))
                            ) : (
                              <span style={styles.noProj}>No projects logged yet today</span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleViewDetails(record.userId)} 
                          className="btn btn-secondary" 
                          style={styles.detailBtn}
                        >
                          <span>View Activities</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assign-tasks' && (
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.cardTitle}>Assign Work Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Implement API validation"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign to Employee</label>
                  <select
                    className="form-select"
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                  >
                    {usersLoading ? (
                      <option>Loading employees...</option>
                    ) : allUsers.length === 0 ? (
                      <option>No employees found</option>
                    ) : (
                      allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Instructions</label>
                  <textarea
                    rows="4"
                    className="form-textarea"
                    placeholder="Provide details about the task requirements..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={taskLoading} className="btn btn-primary" style={{ width: '100%' }}>
                  {taskLoading ? <div className="loader" /> : 'Assign Task'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Selected Employee Activity Modal */}
      {selectedUserDetail && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContent}>
            
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Activity Details</h3>
                <p style={styles.modalSubtitle}>
                  {selectedUserDetail.user?.name} • {selectedUserDetail.user?.email}
                </p>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              
              {/* Reports Grid Section */}
              <div style={styles.modalSection}>
                <h4 style={styles.sectionTitle}>
                  <FileText size={16} style={{ marginRight: '6px' }} />
                  <span>Work Reports submitted today</span>
                </h4>
                {selectedUserDetail.reports?.length === 0 ? (
                  <p style={styles.modalNoData}>No reports submitted today.</p>
                ) : (
                  selectedUserDetail.reports?.map((r, i) => (
                    <div key={r._id || i} style={styles.reportItem}>
                      <p style={styles.reportText}>{r.report}</p>
                      <span style={styles.reportTime}>
                        {new Date(r.createdAt || r.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Tasks Grid Section */}
              <div style={styles.modalSection}>
                <h4 style={styles.sectionTitle}>
                  <Briefcase size={16} style={{ marginRight: '6px' }} />
                  <span>Tasks status today</span>
                </h4>
                {selectedUserDetail.tasks?.length === 0 ? (
                  <p style={styles.modalNoData}>No tasks assigned today.</p>
                ) : (
                  <div style={styles.modalTaskList}>
                    {selectedUserDetail.tasks?.map((t, i) => (
                      <div key={t._id || i} style={styles.modalTaskItem}>
                        <div style={styles.modalTaskHeader}>
                          <span style={styles.modalTaskName}>{t.taskName}</span>
                          <span style={{
                            ...styles.modalTaskStatus,
                            backgroundColor: t.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: t.status === 'completed' ? '#a7f3d0' : '#fde68a'
                          }}>
                            {t.status || 'pending'}
                          </span>
                        </div>
                        <p style={styles.modalTaskDesc}>{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  dashboardContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: '1.25rem',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  userRole: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  signOutBtn: {
    padding: '10px 18px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '30px',
    alignItems: 'start',
  },
  sidebar: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.925rem',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
    width: '100%',
  },
  navBtnActive: {
    background: 'var(--color-primary-glow)',
    color: '#fff',
    borderLeft: '3px solid var(--color-primary)',
    paddingLeft: '13px',
  },
  datePickerContainer: {
    paddingTop: '20px',
    borderTop: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  errorAlert: {
    padding: '15px 20px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    fontSize: '0.9rem',
    borderRadius: '12px',
  },
  successAlert: {
    padding: '15px 20px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#a7f3d0',
    fontSize: '0.9rem',
    borderRadius: '12px',
  },
  tabPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  panelCard: {
    padding: '30px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  noData: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  logsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logRow: {
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  empName: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  empEmail: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  timeBadgeBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  loginLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  loginTime: {
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  workHoursBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  hoursVal: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--color-primary)',
  },
  hoursLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  projectsContainer: {
    paddingTop: '12px',
    borderTop: '1px dotted var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  projBadges: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  projBadge: {
    fontSize: '0.8rem',
    padding: '4px 10px',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    color: '#c7d2fe',
  },
  noProj: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  detailBtn: {
    alignSelf: 'flex-start',
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  },
  modalContent: {
    width: '90%',
    maxWidth: '650px',
    padding: '30px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  modalSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '5px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '8px',
  },
  modalNoData: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  reportItem: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-glass)',
    borderRadius: '10px',
  },
  reportText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  reportTime: {
    display: 'block',
    marginTop: '8px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  modalTaskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalTaskItem: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-glass)',
    borderRadius: '10px',
  },
  modalTaskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  modalTaskName: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  modalTaskStatus: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  modalTaskDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  }
};
