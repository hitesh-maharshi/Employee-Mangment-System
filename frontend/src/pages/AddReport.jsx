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
  <div className="report-container-rpt">
    <h2 className="report-title-rpt">
      {editingReportId
        ? "✏️ Edit Work Report"
        : `📝 Daily Work Report (${today})`}
    </h2>

    {/* Add / Edit Report */}
    <div className="report-form-rpt">
      <textarea
        className="report-textarea-rpt"
        rows="6"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Write today's work report..."
      />

      <div className="report-form-actions-rpt">
        <button
          className="submit-btn-rpt"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editingReportId
            ? "Update Report"
            : "Submit Report"}
        </button>

        {editingReportId && (
          <button className="cancel-btn-rpt" onClick={cancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>
    </div>

    {/* Report List */}
    <div className="report-list-rpt">
      <h3 className="report-list-title-rpt">My Previous Reports</h3>

      {reports.length === 0 ? (
        <p className="no-reports-rpt">No reports found.</p>
      ) : (
        <div className="report-cards-container">
          {reports.map((item) => {
            const d =
              item.date ||
              item.createdAt ||
              item.created_at;

            const dateStr = d
              ? new Date(d).toLocaleDateString()
              : "Unknown Date";

            return (
              <div className="report-card-rpt" key={item._id}>
                <div className="report-header-rpt">
                  <span className="report-date-rpt">
                    📅 {dateStr}
                  </span>

                  <div className="report-actions-rpt">
                    <button
                      className="update-btn-rpt"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn-rpt"
                      onClick={() =>
                        deleteReport(item._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="report-content-rpt">{item.report}</p>
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
