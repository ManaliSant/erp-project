import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";
import { useToast } from "../components/toast/ToastContext";

import {
  setApplications,
  addApplicationLocal,
  rejectApplicationLocal,
} from "../features/applications/applicationSlice";

import { validateApplicationForm } from "../utils/validation";

import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsManager,
  selectIsEmployee,
} from "../features/auth/selectors";

import {
  createApplication,
  fetchApplications,
  managerApproveApplicationRequest,
  adminApproveApplicationRequest,
  rejectApplicationRequest,
  downloadLeaveApprovalPdf,
  downloadReferenceLetterPdf,
} from "../services/applicationService";

export default function Applications() {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const applications = useSelector((state) => state.applications.list);
  const currentUser = useSelector(selectCurrentUser);

  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);
  const isEmployee = useSelector(selectIsEmployee);

  const visibleApplications = useMemo(() => {
    if (isAdmin || isManager) return applications;
    return applications.filter((a) => a.employeeId === currentUser?.id);
  }, [applications, currentUser, isAdmin, isManager]);

  const [form, setForm] = useState({
    type: "Leave",
    title: "",
    description: "",
    dateRange: "",
    days: "",
  });

  const [referenceTextMap, setReferenceTextMap] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setPageLoading(true);

        const data = await fetchApplications();

        if (Array.isArray(data)) {
          dispatch(setApplications(data));
        }
      } catch (error) {
        showToast("Failed to load applications from backend.", "error");
      } finally {
        setPageLoading(false);
      }
    }

    loadApplications();
  }, [dispatch]);

  async function reloadApplications() {
    const data = await fetchApplications();
    if (Array.isArray(data)) {
      dispatch(setApplications(data));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateApplicationForm(form, currentUser);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast("Please fix the highlighted form errors.", "warning");
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

      const created = await createApplication(payload);
      dispatch(addApplicationLocal(created));

      setForm({
        type: "Leave",
        title: "",
        description: "",
        dateRange: "",
        days: "",
      });

      setErrors({});
      showToast("Application submitted successfully.", "success");
    } catch (error) {
      showToast("Failed to submit application.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleManagerApprove(app) {
    try {
      setActionLoadingId(app.id);

      await managerApproveApplicationRequest(app.id, {
        reviewedBy: currentUser.name,
        reviewComment: "Approved by manager.",
        referenceText: "",
      });

      showToast("Manager approved application.", "success");
      await reloadApplications();
    } catch (error) {
      showToast("Failed to manager-approve application.", "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleAdminApprove(app) {
    try {
      setActionLoadingId(app.id);

      const referenceText = referenceTextMap[app.id] || "";

      if (app.type === "Reference Letter" && !referenceText.trim()) {
        showToast(
          "Reference letter content is required before final approval.",
          "warning"
        );
        setActionLoadingId(null);
        return;
      }

      await adminApproveApplicationRequest(app.id, {
        reviewedBy: currentUser.name,
        reviewComment: "Final approval by admin.",
        referenceText: app.type === "Reference Letter" ? referenceText : "",
      });

      showToast("Application approved successfully.", "success");
      await reloadApplications();
    } catch (error) {
      showToast("Failed to final-approve application.", "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(app) {
    try {
      setActionLoadingId(app.id);

      await rejectApplicationRequest(app.id, {
        reviewedBy: currentUser.name,
        reviewComment: "Rejected.",
        referenceText: "",
      });

      dispatch(
        rejectApplicationLocal({ appId: app.id, reviewer: currentUser.name })
      );

      showToast("Application rejected.", "success");
      await reloadApplications();
    } catch (error) {
      showToast("Failed to reject application.", "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDownloadLeavePdf(app) {
    try {
      setPdfLoadingId(app.id);

      await downloadLeaveApprovalPdf(app.id);
      showToast("Leave approval PDF download started.", "success");
    } catch (error) {
      showToast("Failed to download leave approval PDF.", "error");
    } finally {
      setPdfLoadingId(null);
    }
  }

  async function handleDownloadReferenceLetter(app) {
    try {
      setPdfLoadingId(app.id);

      await downloadReferenceLetterPdf(app.id);
      showToast("Reference letter download started.", "success");
    } catch (error) {
      showToast("Failed to download reference letter PDF.", "error");
    } finally {
      setPdfLoadingId(null);
    }
  }

  function canDownloadLeavePdf(app) {
    return (
      app.type === "Leave" &&
      app.status === "Approved" &&
      app.pdfGenerated === true
    );
  }

  function canDownloadReferenceLetterPdf(app) {
    return (
      app.type === "Reference Letter" &&
      app.status === "Approved" &&
      app.pdfGenerated === true
    );
  }

  return (
    <div>
      {pageLoading && (
        <p style={{ marginBottom: 12, color: "#555" }}>
          Loading applications...
        </p>
      )}

      {isEmployee && (
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
                {errors.title && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.title}</p>
                )}
              </div>

              <div>
                <label style={styles.label}>Date Range / Effective Date</label>
                <input
                  style={styles.input}
                  value={form.dateRange}
                  onChange={(e) =>
                    setForm({ ...form, dateRange: e.target.value })
                  }
                />
                {errors.dateRange && (
                  <p style={{ color: "red", fontSize: 12 }}>
                    {errors.dateRange}
                  </p>
                )}
              </div>

              <div>
                <label style={styles.label}>No. of Days</label>
                <input
                  style={styles.input}
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                />
                {errors.days && (
                  <p style={{ color: "red", fontSize: 12 }}>{errors.days}</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <p style={{ color: "red", fontSize: 12 }}>
                  {errors.description}
                </p>
              )}
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </Card>
      )}

      <Card
        title={
          isAdmin
            ? "All Applications / Admin Final Review"
            : isManager
            ? "Team Applications / Manager Review"
            : "My Applications"
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Application</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Overall</th>
                <th style={styles.th}>Manager</th>
                <th style={styles.th}>Admin</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {visibleApplications.map((app) => (
                <tr key={app.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold" }}>{app.title}</div>

                    <div style={{ fontSize: 12, color: "#666" }}>
                      {app.description}
                    </div>

                    {canDownloadLeavePdf(app) && (
                      <button
                        type="button"
                        style={{
                          ...styles.secondaryButton,
                          marginTop: 8,
                          padding: "6px 10px",
                          display: "block",
                        }}
                        onClick={() => handleDownloadLeavePdf(app)}
                        disabled={pdfLoadingId === app.id}
                      >
                        {pdfLoadingId === app.id
                          ? "Downloading..."
                          : "Download Leave PDF"}
                      </button>
                    )}

                    {canDownloadReferenceLetterPdf(app) && (
                      <button
                        type="button"
                        style={{
                          ...styles.secondaryButton,
                          marginTop: 8,
                          padding: "6px 10px",
                          display: "block",
                        }}
                        onClick={() => handleDownloadReferenceLetter(app)}
                        disabled={pdfLoadingId === app.id}
                      >
                        {pdfLoadingId === app.id
                          ? "Downloading..."
                          : "Download Reference Letter"}
                      </button>
                    )}
                  </td>

                  <td style={styles.td}>{app.employeeName}</td>
                  <td style={styles.td}>{app.type}</td>
                  <td style={styles.td}>{app.createdAt}</td>

                  <td style={styles.td}>
                    <StatusBadge status={app.status} />
                  </td>

                  <td style={styles.td}>
                    <StatusBadge status={app.managerStatus || "Pending"} />
                  </td>

                  <td style={styles.td}>
                    <StatusBadge status={app.adminStatus || "Pending"} />
                  </td>

                  <td style={styles.td}>
                    {isManager && app.managerStatus === "Pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleManagerApprove(app)}
                          style={styles.successButton}
                          disabled={actionLoadingId === app.id}
                        >
                          {actionLoadingId === app.id
                            ? "Processing..."
                            : "Manager Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(app)}
                          style={styles.dangerButton}
                          disabled={actionLoadingId === app.id}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {isAdmin &&
                      app.managerStatus === "Approved" &&
                      app.adminStatus === "Pending" && (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexDirection: "column",
                          }}
                        >
                          {app.type === "Reference Letter" && (
                            <textarea
                              style={{
                                ...styles.textarea,
                                minWidth: 280,
                                marginBottom: 8,
                              }}
                              rows={4}
                              placeholder="Write official reference letter content here..."
                              value={referenceTextMap[app.id] || ""}
                              onChange={(e) =>
                                setReferenceTextMap((prev) => ({
                                  ...prev,
                                  [app.id]: e.target.value,
                                }))
                              }
                            />
                          )}

                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleAdminApprove(app)}
                              style={styles.successButton}
                              disabled={actionLoadingId === app.id}
                            >
                              {actionLoadingId === app.id
                                ? "Processing..."
                                : "Final Approve"}
                            </button>

                            <button
                              onClick={() => handleReject(app)}
                              style={styles.dangerButton}
                              disabled={actionLoadingId === app.id}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                    {!(
                      (isManager && app.managerStatus === "Pending") ||
                      (isAdmin &&
                        app.managerStatus === "Approved" &&
                        app.adminStatus === "Pending")
                    ) && (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {app.reviewedBy
                          ? `${app.reviewedBy} - ${app.reviewComment}`
                          : "-"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {visibleApplications.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={8}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}