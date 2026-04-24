import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";
import {
  setApplications,
  addApplicationLocal,
  approveApplicationLocal,
  rejectApplicationLocal,
} from "../features/applications/applicationSlice";
import { reduceEmployeeLeaves } from "../features/employees/employeeSlice";
import { validateApplicationForm } from "../utils/validation";
import { selectCurrentUser, selectIsAdmin } from "../features/auth/selectors";
import {
  createApplication,
  fetchApplications,
  approveApplicationRequest,
  rejectApplicationRequest,
} from "../services/applicationService";

export default function Applications() {
  const dispatch = useDispatch();
  const applications = useSelector((state) => state.applications.list);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  const myApplications = useMemo(() => {
    if (isAdmin) return applications;
    return applications.filter((a) => a.employeeId === currentUser.id);
  }, [applications, currentUser, isAdmin]);

  const [form, setForm] = useState({
    type: "Leave",
    title: "",
    description: "",
    dateRange: "",
    days: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setPageLoading(true);
        setApiError("");

        const data = await fetchApplications();
        if (Array.isArray(data)) {
          dispatch(setApplications(data));
        }
      } catch (error) {
        setApiError("Failed to load applications from backend. Showing local data if available.");
      } finally {
        setPageLoading(false);
      }
    }

    loadApplications();
  }, [dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateApplicationForm(form, currentUser);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type: form.type,
      title: form.title,
      description: form.description,
      dateRange: form.dateRange || "N/A",
      days: Number(form.days || 0),
    };

    try {
      setLoading(true);
      setApiError("");

      const created = await createApplication(payload);

      dispatch(addApplicationLocal(created || payload));

      setForm({
        type: "Leave",
        title: "",
        description: "",
        dateRange: "",
        days: "",
      });

      setErrors({});
      alert("Application submitted successfully.");
    } catch (error) {
      setApiError("API failed. Backend is not connected or request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(app) {
    try {
      setActionLoadingId(app.id);
      setApiError("");

      await approveApplicationRequest(app.id, {
        reviewedBy: currentUser.name,
        reviewComment: "Approved by HR.",
      });

      dispatch(approveApplicationLocal({ appId: app.id, reviewer: currentUser.name }));

      if (app.type === "Leave" && app.days > 0) {
        dispatch(reduceEmployeeLeaves({ employeeId: app.employeeId, days: app.days }));
      }
    } catch (error) {
      setApiError("Failed to approve application.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(app) {
    try {
      setActionLoadingId(app.id);
      setApiError("");

      await rejectApplicationRequest(app.id, {
        reviewedBy: currentUser.name,
        reviewComment: "Rejected by HR.",
      });

      dispatch(rejectApplicationLocal({ appId: app.id, reviewer: currentUser.name }));
    } catch (error) {
      setApiError("Failed to reject application.");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div>
      {pageLoading && (
        <p style={{ marginBottom: 12, color: "#555" }}>Loading applications...</p>
      )}

      {apiError && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 12 }}>{apiError}</p>
      )}

      {!isAdmin && (
        <Card title="Submit Application">
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Application Type</label>
                <select
                  style={styles.input}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Leave</option>
                  <option>Resignation</option>
                  <option>Reference Letter</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p style={{ color: "red", fontSize: 12 }}>{errors.title}</p>}
              </div>

              <div>
                <label style={styles.label}>Date Range / Effective Date</label>
                <input
                  style={styles.input}
                  value={form.dateRange}
                  onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
                />
                {errors.dateRange && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.dateRange}</p>
                )}
              </div>

              <div>
                <label style={styles.label}>No. of Days</label>
                <input
                  style={styles.input}
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                />
                {errors.days && <p style={{ color: "red", fontSize: 12 }}>{errors.days}</p>}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {errors.description && (
                <p style={{ color: "red", fontSize: 12 }}>{errors.description}</p>
              )}
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </Card>
      )}

      <Card title={isAdmin ? "All Applications / HR Review" : "My Applications"}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Application</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myApplications.map((app) => (
                <tr key={app.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold" }}>{app.title}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{app.description}</div>
                  </td>
                  <td style={styles.td}>{app.employeeName}</td>
                  <td style={styles.td}>{app.type}</td>
                  <td style={styles.td}>{app.createdAt}</td>
                  <td style={styles.td}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={styles.td}>
                    {isAdmin && app.status === "Pending" ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleApprove(app)}
                          style={styles.successButton}
                          disabled={actionLoadingId === app.id}
                        >
                          {actionLoadingId === app.id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(app)}
                          style={styles.dangerButton}
                          disabled={actionLoadingId === app.id}
                        >
                          {actionLoadingId === app.id ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <div>{app.reviewedBy ? `${app.reviewedBy} - ${app.reviewComment}` : "-"}</div>
                        {app.status === "Approved" && (
                          <button
                            type="button"
                            style={{ ...styles.secondaryButton, marginTop: 8, padding: "6px 10px" }}
                            disabled
                          >
                            Download PDF
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}