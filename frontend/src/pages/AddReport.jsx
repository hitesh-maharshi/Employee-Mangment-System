import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddReport.css";

function AddReport() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [editingReportId, setEditingReportId] = useState(null);
  const [reports, setReports] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) {
        setPageLoading(false);
        return;
      }
      const user = JSON.parse(userStr);

      await fetchReports(user._id || user.id);

      setPageLoading(false);
    } catch (error) {
      console.error(error);
      setPageLoading(false);
    }
  };

  const fetchReports = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `https://employee-mangment-system-1.onrender.com/api/v1/reports/getUserReports/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedReports = res.data.data || [];
      fetchedReports.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || a.created_at || 0);
        const dateB = new Date(b.date || b.createdAt || b.created_at || 0);
        return dateB - dateA;
      });
      setReports(fetchedReports);

      // Find today's report
      const todayReport = fetchedReports.find((r) => {
        const d = r.date || r.createdAt || r.created_at;
        if (!d) return false;
        return new Date(d).toISOString().split("T")[0] === today;
      });

      if (todayReport && !editingReportId) {
        setReport(todayReport.report);
        setEditingReportId(todayReport._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("currentUser");
      const user = userStr ? JSON.parse(userStr) : null;

      if (editingReportId) {
        await axios.put(
          `https://employee-mangment-system-1.onrender.com/api/v1/reports/updateReport/${editingReportId}`,
          { report: report },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Report Updated ✅");
      } else {
        await axios.post(
          "https://employee-mangment-system-1.onrender.com/api/v1/reports/addReport",
          { report: report },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Report Submitted ✅");
      }

      if (user) {
        await fetchReports(user._id || user.id);
      }

      if (!editingReportId) {
        setReport("");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    const confirm = window.confirm("Delete this report?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(
        `https://employee-mangment-system-1.onrender.com/api/v1/reports/deleteReport/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Report deleted successfully");

      if (editingReportId === reportId) {
        setReport("");
        setEditingReportId(null);
      }

      // Remove deleted report from UI
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete report");
    }
  };

  const handleEdit = (reportItem) => {
    setReport(reportItem.report);
    setEditingReportId(reportItem._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setReport("");
    setEditingReportId(null);
  };

  if (pageLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="report-container-rpt" style={{ padding: "30px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <h2 className="report-title-rpt" style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        {editingReportId ? "✏️ Edit Work Report" : `📝 Daily Work Report (${today})`}
      </h2>

      {/* Add / Edit New Report */}
      <div className="report-form-rpt" style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
        <textarea
          className="report-textarea-rpt"
          rows="6"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Write today's work report..."
          style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px" }}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button
            className="submit-btn-rpt"
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
          >
            {loading ? "Saving..." : (editingReportId ? "Update Report" : "Submit Report")}
          </button>
          
          {editingReportId && (
            <button
              onClick={cancelEdit}
              style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Report List */}
      <div className="report-list-rpt">
        <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>🗂️ My Previous Reports</h3>

        {reports.length === 0 ? (
          <p>No reports found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
            {reports.map((item) => {
              const d = item.date || item.createdAt || item.created_at;
              const dateStr = d ? new Date(d).toLocaleDateString() : "Unknown Date";

              return (
                <div className="report-card-rpt" key={item._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
                  <div className="report-header-rpt" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "bold", color: "#333" }}>
                      📅 {dateStr}
                    </span>
                    <div className="report-actions-rpt" style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="update-btn-rpt"
                        onClick={() => handleEdit(item)}
                        style={{ padding: "5px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn-rpt"
                        onClick={() => deleteReport(item._id)}
                        style={{ padding: "5px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="report-content-rpt" style={{ margin: "0", whiteSpace: "pre-wrap", color: "#555", lineHeight: "1.5" }}>
                    {item.report}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddReport;
