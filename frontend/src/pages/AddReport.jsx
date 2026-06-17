import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddReport.css";

function AddReport() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [todayReportId, setTodayReportId] = useState(null);

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

      // await fetchTodayReport(user._id);

      setPageLoading(false);
    } catch (error) {
      console.error(error);
      setPageLoading(false);
    }
  };

  // const fetchTodayReport = async (userId) => {
  //   try {
  //     const token = localStorage.getItem("accessToken");

  //     const res = await axios.get(
  //       `https://employee-mangment-system-1.onrender.com/api/v1/reports/getUserReports/${userId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     // Find report matching today's date
  //     const reports = res.data.data || [];
  //     const todayReport = reports.find(
  //       (r) => new Date(r.created_at).toISOString().split("T")[0] === today
  //     );

  //     if (todayReport) {
  //       setReport(todayReport.report);
  //       setTodayReportId(todayReport._id);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      if (todayReportId) {
        await axios.put(
          `https://employee-mangment-system-1.onrender.com/api/v1/reports/updateReport/${todayReportId}`,
          {
            report: report,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Report Updated ✅");
      } else {
        await axios.post(
          "https://employee-mangment-system-1.onrender.com/api/v1/reports/addReport",
          {
            report: report,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Report Submitted ✅");
        
        // Refetch to populate the newly created report's ID
        // const userStr = localStorage.getItem("currentUser");
        // if (userStr) {
        //   const user = JSON.parse(userStr);
        //   await fetchTodayReport(user._id);
        // }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="report-container-rpt" style={{ padding: "30px" }}>
      <h2 className="report-title-rpt">
        Daily Work Report ({today})
      </h2>

      <textarea
        className="report-textarea-rpt"
        rows="8"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Today's work report..."
      />

      <br />
      <br />

      <button
        className="report-btn-rpt"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Submit Report"}
      </button>
    </div>
  );
}

export default AddReport;