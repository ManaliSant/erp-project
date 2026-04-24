import React, { useMemo, useState } from "react";

export default function ERPFrontendApp() {
  const initialEmployees = [
    {
      id: 1,
      employeeCode: "HR001",
      name: "Aisha Thomas",
      email: "aisha@company.com",
      role: "admin",
      department: "Human Resources",
      designation: "HR Manager",
      manager: "Director HR",
      joinDate: "2021-06-15",
      leavesRemaining: 14,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
    {
      id: 2,
      employeeCode: "EMP101",
      name: "Rahul Menon",
      email: "rahul@company.com",
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer",
      manager: "Priya Nair",
      joinDate: "2023-01-10",
      leavesRemaining: 9,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
    {
      id: 3,
      employeeCode: "EMP102",
      name: "Meera Nair",
      email: "meera@company.com",
      role: "employee",
      department: "Operations",
      designation: "Operations Executive",
      manager: "Anand Verma",
      joinDate: "2024-02-05",
      leavesRemaining: 11,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
  ];

  const initialApplications = [
    {
      id: "APP-1001",
      employeeId: 2,
      employeeName: "Rahul Menon",
      type: "Leave",
      title: "Annual Leave Request",
      description: "Need 3 days leave for family travel.",
      dateRange: "2026-03-25 to 2026-03-27",
      days: 3,
      status: "Pending",
      reviewedBy: "",
      reviewComment: "",
      createdAt: "2026-03-18 13:40",
    },
    {
      id: "APP-1002",
      employeeId: 3,
      employeeName: "Meera Nair",
      type: "Resignation",
      title: "Resignation Submission",
      description: "Submitting formal resignation.",
      dateRange: "Last working day: 2026-04-30",
      days: 0,
      status: "Pending",
      reviewedBy: "",
      reviewComment: "",
      createdAt: "2026-03-17 10:25",
    },
  ];

  const [employees, setEmployees] = useState(initialEmployees);
  const [applications, setApplications] = useState(initialApplications);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [form, setForm] = useState({
    type: "Leave",
    title: "",
    description: "",
    dateRange: "",
    days: "",
  });

  const currentUser = employees.find((e) => e.id === selectedUserId);
  const isAdmin = currentUser && currentUser.role === "admin";

  const myApplications = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return applications;
    return applications.filter((a) => a.employeeId === currentUser.id);
  }, [applications, currentUser, isAdmin]);

  function getDaysWithCompany(joinDate) {
    const start = new Date(joinDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function getCurrentDateTime() {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0")
    );
  }

  function handleSignIn() {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === currentUser.id
          ? { ...emp, signedIn: true, lastSignIn: getCurrentDateTime() }
          : emp
      )
    );
  }

  function handleSignOut() {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === currentUser.id
          ? { ...emp, signedIn: false, lastSignOut: getCurrentDateTime() }
          : emp
      )
    );
  }

  function handleSubmitApplication(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      alert("Title and description are required.");
      return;
    }

    const newApp = {
      id: "APP-" + Date.now(),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type: form.type,
      title: form.title,
      description: form.description,
      dateRange: form.dateRange || "N/A",
      days: Number(form.days || 0),
      status: "Pending",
      reviewedBy: "",
      reviewComment: "",
      createdAt: getCurrentDateTime(),
    };

    setApplications((prev) => [newApp, ...prev]);

    setForm({
      type: "Leave",
      title: "",
      description: "",
      dateRange: "",
      days: "",
    });

    alert("Application submitted.");
  }

  function handleApprove(appId) {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: "Approved",
              reviewedBy: currentUser.name,
              reviewComment: "Approved by HR.",
            }
          : app
      )
    );

    if (target.type === "Leave" && target.days > 0) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === target.employeeId
            ? {
                ...emp,
                leavesRemaining: Math.max(0, emp.leavesRemaining - target.days),
              }
            : emp
        )
      );
    }
  }

  function handleReject(appId) {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: "Rejected",
              reviewedBy: currentUser.name,
              reviewComment: "Rejected by HR.",
            }
          : app
      )
    );
  }

  function badgeStyle(status) {
    const styles = {
      Pending: { background: "#fff3cd", color: "#856404" },
      Approved: { background: "#d4edda", color: "#155724" },
      Rejected: { background: "#f8d7da", color: "#721c24" },
      Active: { background: "#d4edda", color: "#155724" },
      SignedIn: { background: "#d1ecf1", color: "#0c5460" },
      SignedOut: { background: "#e2e3e5", color: "#383d41" },
    };
    return styles[status] || { background: "#eee", color: "#333" };
  }

  function card(title, content) {
    return (
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{title}</h3>
        {content}
      </div>
    );
  }

  function renderDashboard() {
    const pendingCount = applications.filter((a) => a.status === "Pending").length;
    const approvedCount = applications.filter((a) => a.status === "Approved").length;
    const signedInCount = employees.filter((e) => e.signedIn).length;

    return (
      <div>
        <div style={styles.statsGrid}>
          {isAdmin ? (
            <>
              {statBox("Total Employees", employees.length)}
              {statBox("Pending Requests", pendingCount)}
              {statBox("Approved Requests", approvedCount)}
              {statBox("Signed In", signedInCount)}
            </>
          ) : (
            <>
              {statBox("Days with Company", getDaysWithCompany(currentUser.joinDate))}
              {statBox("Leaves Remaining", currentUser.leavesRemaining)}
              {statBox("My Requests", myApplications.length)}
              {statBox("Sign Status", currentUser.signedIn ? "Signed In" : "Signed Out")}
            </>
          )}
        </div>

        {card(
          isAdmin ? "Recent Applications" : "My Applications",
          <div>
            {myApplications.length === 0 ? (
              <p>No applications found.</p>
            ) : (
              myApplications.slice(0, 5).map((app) => (
                <div key={app.id} style={styles.listItem}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{app.title}</div>
                    <div style={{ fontSize: 13, color: "#555" }}>
                      {app.employeeName} | {app.type} | {app.createdAt}
                    </div>
                  </div>
                  <span style={{ ...styles.badge, ...badgeStyle(app.status) }}>{app.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  function renderProfile() {
    return card(
      "Employee Profile",
      <div style={styles.profileGrid}>
        {profileField("Employee Code", currentUser.employeeCode)}
        {profileField("Name", currentUser.name)}
        {profileField("Email", currentUser.email)}
        {profileField("Department", currentUser.department)}
        {profileField("Designation", currentUser.designation)}
        {profileField("Manager", currentUser.manager)}
        {profileField("Join Date", currentUser.joinDate)}
        {profileField("Days with Company", getDaysWithCompany(currentUser.joinDate))}
        {profileField("Leaves Remaining", currentUser.leavesRemaining)}
        {profileField("Last Sign In", currentUser.lastSignIn || "-")}
        {profileField("Last Sign Out", currentUser.lastSignOut || "-")}
        {profileField("Status", currentUser.status)}
      </div>
    );
  }

  function renderApplications() {
    return (
      <div>
        {!isAdmin && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Submit Application</h3>
            <form onSubmit={handleSubmitApplication}>
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
                </div>

                <div>
                  <label style={styles.label}>Date Range / Effective Date</label>
                  <input
                    style={styles.input}
                    value={form.dateRange}
                    onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
                  />
                </div>

                <div>
                  <label style={styles.label}>No. of Days</label>
                  <input
                    style={styles.input}
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                  />
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
              </div>

              <button type="submit" style={styles.primaryButton}>
                Submit Application
              </button>
            </form>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {isAdmin ? "All Applications / HR Review" : "My Applications"}
          </h3>

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
                      <span style={{ ...styles.badge, ...badgeStyle(app.status) }}>{app.status}</span>
                    </td>
                    <td style={styles.td}>
                      {isAdmin && app.status === "Pending" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleApprove(app.id)}
                            style={styles.successButton}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            style={styles.dangerButton}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {app.reviewedBy ? `${app.reviewedBy} - ${app.reviewComment}` : "-"}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderAttendance() {
    return card(
      "Attendance",
      <div>
        <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <button onClick={handleSignIn} style={styles.primaryButton}>
            Sign In
          </button>
          <button onClick={handleSignOut} style={styles.secondaryButton}>
            Sign Out
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Current Status</th>
              <th style={styles.th}>Last Sign In</th>
              <th style={styles.th}>Last Sign Out</th>
            </tr>
          </thead>
          <tbody>
            {(isAdmin ? employees : [currentUser]).map((emp) => (
              <tr key={emp.id}>
                <td style={styles.td}>{emp.name}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(emp.signedIn ? badgeStyle("SignedIn") : badgeStyle("SignedOut")),
                    }}
                  >
                    {emp.signedIn ? "Signed In" : "Signed Out"}
                  </span>
                </td>
                <td style={styles.td}>{emp.lastSignIn || "-"}</td>
                <td style={styles.td}>{emp.lastSignOut || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderEmployees() {
    if (!isAdmin) return null;

    return card(
      "Employees",
      <div style={styles.employeeGrid}>
        {employees.map((emp) => (
          <div key={emp.id} style={styles.employeeCard}>
            <div style={{ fontWeight: "bold", fontSize: 16 }}>{emp.name}</div>
            <div style={{ color: "#666", marginBottom: 10 }}>{emp.designation}</div>
            {profileField("Department", emp.department)}
            {profileField("Manager", emp.manager)}
            {profileField("Join Date", emp.joinDate)}
            {profileField("Days with Company", getDaysWithCompany(emp.joinDate))}
            {profileField("Leaves Remaining", emp.leavesRemaining)}
            {profileField("Role", emp.role)}
          </div>
        ))}
      </div>
    );
  }

  function statBox(label, value) {
    return (
      <div style={styles.statBox}>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
    );
  }

  function profileField(label, value) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={styles.fieldLabel}>{label}</div>
        <div style={styles.fieldValue}>{value}</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>HR ERP</div>

        <div style={styles.userBox}>
          <div style={{ fontWeight: "bold" }}>{currentUser.name}</div>
          <div style={{ fontSize: 13, color: "#555" }}>
            {isAdmin ? "HR Admin" : "Employee"}
          </div>
        </div>

        <button style={tabButton(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        <button style={tabButton(activeTab === "profile")} onClick={() => setActiveTab("profile")}>
          Employee Profile
        </button>
        <button
          style={tabButton(activeTab === "applications")}
          onClick={() => setActiveTab("applications")}
        >
          Applications
        </button>
        <button style={tabButton(activeTab === "attendance")} onClick={() => setActiveTab("attendance")}>
          Attendance
        </button>
        {isAdmin && (
          <button style={tabButton(activeTab === "employees")} onClick={() => setActiveTab("employees")}>
            Employees
          </button>
        )}
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>HR Planning ERP</div>
            <div style={{ color: "#666" }}>
              Leave, resignation, employee profile, hierarchy, attendance and approvals
            </div>
          </div>

          <div>
            <select
              style={styles.input}
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(Number(e.target.value));
                setActiveTab("dashboard");
              }}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "applications" && renderApplications()}
        {activeTab === "attendance" && renderAttendance()}
        {activeTab === "employees" && renderEmployees()}
      </div>
    </div>
  );
}

function tabButton(active) {
  return {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginBottom: 8,
    background: active ? "#111827" : "#ffffff",
    color: active ? "#ffffff" : "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 600,
  };
}

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
  },
  sidebar: {
    width: 250,
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: 20,
    boxSizing: "border-box",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userBox: {
    padding: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: 20,
  },
  main: {
    flex: 1,
    padding: 24,
    boxSizing: "border-box",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 20,
    flexWrap: "wrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 18,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 18,
    marginBottom: 20,
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
    display: "inline-block",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    resize: "vertical",
  },
  primaryButton: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 14,
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  successButton: {
    background: "#198754",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  dangerButton: {
    background: "#dc3545",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    color: "#6b7280",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top",
    fontSize: 14,
  },
  employeeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  employeeCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    background: "#f9fafb",
  },
};