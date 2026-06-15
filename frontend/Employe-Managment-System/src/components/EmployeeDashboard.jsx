import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Clock, ClipboardList, FileText, CheckCircle2, Calendar, LogOut, BookOpen, User } from 'lucide-react';

export default function EmployeeDashboard({ user, onSignOut }) {
  const [project, setProject] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [description, setDescription] = useState('');
  
  const [report, setReport] = useState('');

  const [timeLogs, setTimeLogs] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('time-tracker'); // 'time-tracker' | 'tasks' | 'reports'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes, tasksRes] = await Promise.allSettled([
        api.getUserTime(),
        api.getProjectSummary(),
        api.getMyTasks()
      ]);

      if (logsRes.status === 'fulfilled') setTimeLogs(logsRes.value.data || []);
      if (summaryRes.status === 'fulfilled') setSummaries(summaryRes.value.data || []);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data || []);
    } catch (err) {
      console.error('Failed to load dashboard logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTime = async (e) => {
    e.preventDefault();
    if (!project || !totalTime || !description) {
      setError('All time tracker fields are required');
      return;
    }
    setError('');
    setSuccess('');
    setTimeLoading(true);

    try {
      await api.saveTime(project, Number(totalTime), description);
      setSuccess('Time logged successfully!');
      setProject('');
      setTotalTime('');
      setDescription('');
      // Refresh time logs and summaries
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to save time.');
    } finally {
      setTimeLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!report.trim()) {
      setError('Report content cannot be empty');
      return;
    }
    setError('');
    setSuccess('');
    setReportLoading(true);

    try {
      await api.submitReport(report);
      setSuccess('Report submitted successfully!');
      setReport('');
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (task) => {
    try {
      // Cycle: pending -> in progress -> completed
      let nextStatus = 'pending';
      if (task.status === 'pending') nextStatus = 'in progress';
      else if (task.status === 'in progress') nextStatus = 'completed';

      await api.updateTask(
        task._id,
        task.taskName,
        task.description,
        task.assignedUserId,
        task.assignedUser,
        nextStatus
      );

      setSuccess(`Task moved to "${nextStatus}"`);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update task status: ' + (err.message || ''));
    }
  };

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Top Navigation Header */}
      <header className="glass-panel" style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <h1 style={styles.username}>{user.name}</h1>
            <p style={styles.userRole}>Employee Portal • {user.email}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="btn btn-secondary" style={styles.signOutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Grid Content */}
      <div style={styles.mainGrid}>
        
        {/* Navigation Sidebar / Tab buttons */}
        <div className="glass-panel" style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Portal Navigation</h3>
          <nav style={styles.navMenu}>
            <button 
              onClick={() => setActiveTab('time-tracker')} 
              style={{...styles.navBtn, ...(activeTab === 'time-tracker' && styles.navBtnActive)}}
            >
              <Clock size={18} />
              <span>Time Tracker</span>
            </button>
            <button 
              onClick={() => setActiveTab('tasks')} 
              style={{...styles.navBtn, ...(activeTab === 'tasks' && styles.navBtnActive)}}
            >
              <ClipboardList size={18} />
              <span>Assigned Tasks</span>
              {tasks.length > 0 && <span style={styles.badge}>{tasks.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              style={{...styles.navBtn, ...(activeTab === 'reports' && styles.navBtnActive)}}
            >
              <FileText size={18} />
              <span>Daily Reports</span>
            </button>
          </nav>

          {/* Quick Metrics */}
          <div style={styles.metricsBox}>
            <h4 style={styles.metricsTitle}>Recent Totals</h4>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Time Logs</span>
              <span style={styles.metricVal}>{timeLogs.length}</span>
            </div>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Active Projects</span>
              <span style={styles.metricVal}>{summaries.length}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Center Panel */}
        <div style={styles.centerContent}>
          {error && <div className="glass-panel" style={styles.errorAlert}>{error}</div>}
          {success && <div className="glass-panel" style={styles.successAlert}>{success}</div>}

          {activeTab === 'time-tracker' && (
            <div style={styles.tabPanel}>
              {/* Save Time Form */}
              <div className="glass-panel" style={styles.panelCard}>
                <h3 style={styles.cardTitle}>Log Hours</h3>
                <form onSubmit={handleSaveTime}>
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Website Redesign"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Hours Worked</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 4.5"
                      value={totalTime}
                      onChange={(e) => setTotalTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description of Tasks Done</label>
                    <textarea
                      rows="3"
                      className="form-textarea"
                      placeholder="Describe what you worked on..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={timeLoading} className="btn btn-primary" style={{ width: '100%' }}>
                    {timeLoading ? <div className="loader" /> : 'Log Hours & Update Admin'}
                  </button>
                </form>
              </div>

              {/* Time logs history */}
              <div className="glass-panel" style={styles.panelCard}>
                <h3 style={styles.cardTitle}>Recent Time Logs</h3>
                {timeLogs.length === 0 ? (
                  <p style={styles.noData}>No recent time logs found.</p>
                ) : (
                  <div style={styles.logsList}>
                    {timeLogs.map((log, idx) => (
                      <div key={log._id || idx} style={styles.logItem} className="glass-panel-hover">
                        <div style={styles.logMain}>
                          <span style={styles.logProject}>{log.project}</span>
                          <span style={styles.logHours}>{log.totalTime} hrs</span>
                        </div>
                        <p style={styles.logDesc}>{log.description}</p>
                        <div style={styles.logMeta}>
                          <Calendar size={12} />
                          <span>{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.cardTitle}>My Assigned Tasks</h3>
              {tasks.length === 0 ? (
                <p style={styles.noData}>No tasks currently assigned to you.</p>
              ) : (
                <div style={styles.tasksList}>
                  {tasks.map((task, idx) => (
                    <div key={task._id || idx} style={styles.taskItem}>
                      <div style={styles.taskHeader}>
                        <h4 style={styles.taskName}>{task.taskName}</h4>
                        <span style={{
                          ...styles.taskStatus,
                          backgroundColor: task.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: task.status === 'completed' ? '#a7f3d0' : '#fde68a'
                        }}>
                          {task.status || 'pending'}
                        </span>
                      </div>
                      <p style={styles.taskDesc}>{task.description}</p>
                      
                      {task.status !== 'completed' && (
                        <button 
                          onClick={() => handleUpdateTaskStatus(task)} 
                          className="btn btn-secondary" 
                          style={styles.taskActionBtn}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {task.status === 'pending' ? 'Start Task' : 'Mark Completed'}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.cardTitle}>Submit Daily Work Report</h3>
              <p style={styles.cardSubtitle}>Submit a report summarizing your activities for review by the admin team.</p>
              
              <form onSubmit={handleSubmitReport} style={styles.reportForm}>
                <div className="form-group">
                  <label className="form-label">Report Content</label>
                  <textarea
                    rows="8"
                    className="form-textarea"
                    placeholder="Enter your comprehensive report for today..."
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={reportLoading} className="btn btn-primary" style={{ width: '100%' }}>
                  {reportLoading ? <div className="loader" /> : 'Submit Report'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
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
    letterSpacing: '-0.3px',
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
    position: 'relative',
  },
  navBtnActive: {
    background: 'var(--color-primary-glow)',
    color: '#fff',
    borderLeft: '3px solid var(--color-primary)',
    paddingLeft: '13px',
  },
  badge: {
    position: 'absolute',
    right: '16px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  metricsBox: {
    marginTop: '10px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  metricsTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
  },
  metricLabel: {
    color: 'var(--text-muted)',
  },
  metricVal: {
    fontWeight: '700',
    color: 'var(--text-primary)',
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
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '20px',
  },
  cardSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '25px',
  },
  noData: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  logItem: {
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'var(--transition-smooth)',
  },
  logMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logProject: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  logHours: {
    fontWeight: '700',
    color: 'var(--color-primary)',
    fontSize: '0.95rem',
  },
  logDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  logMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  taskItem: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    fontSize: '1.05rem',
  },
  taskStatus: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
  },
  taskDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  taskActionBtn: {
    alignSelf: 'flex-start',
    padding: '8px 14px',
    fontSize: '0.85rem',
  },
  reportForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }
};
