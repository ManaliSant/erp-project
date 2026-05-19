import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import StatBox from "../components/common/StatBox";

import { getDaysWithCompany } from "../utils/helpers";
import { styles } from "../utils/styles";
import { fetchDashboardStats } from "../services/dashboardService";

import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsManager,
} from "../features/auth/selectors";

export default function Dashboard() {
  const employees = useSelector((state) => state.employees.list);
  const applications = useSelector((state) => state.applications.list);

  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoadingStats(true);
        setStatsError("");

        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        setStatsError("Failed to load dashboard stats.");
      } finally {
        setLoadingStats(false);
      }
    }

    loadDashboardStats();
  }, []);

  const visibleApplications = useMemo(() => {
    if (isAdmin || isManager) {
      return applications;
    }

    return applications.filter((app) => app.employeeId === currentUser?.id);
  }, [applications, currentUser, isAdmin, isManager]);

  const myApplications = useMemo(() => {
    return applications.filter((app) => app.employeeId === currentUser?.id);
  }, [applications, currentUser]);

  const signedInCountFromRedux = employees.filter((e) => e.signedIn).length;
  const pendingCountFromRedux = applications.filter((a) => a.status === "Pending").length;
  const approvedCountFromRedux = applications.filter((a) => a.status === "Approved").length;
  const rejectedCountFromRedux = applications.filter((a) => a.status === "Rejected").length;

  const totalEmployees = stats?.totalEmployees ?? employees.length;
  const signedInEmployees = stats?.signedInEmployees ?? signedInCountFromRedux;
  const pendingApplications = stats?.pendingApplications ?? pendingCountFromRedux;
  const approvedApplications = stats?.approvedApplications ?? approvedCountFromRedux;
  const rejectedApplications = stats?.rejectedApplications ?? rejectedCountFromRedux;
  const generatedPdfs = stats?.generatedPdfs ?? 0;
  const totalAuditLogs = stats?.totalAuditLogs ?? 0;

  return (
    <div>
      {loadingStats && (
        <p style={{ marginBottom: 12, color: "#555", fontSize: 13 }}>
          Loading dashboard analytics...
        </p>
      )}

      {statsError && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 13 }}>
          {statsError}
        </p>
      )}

      <div style={styles.statsGrid}>
        {isAdmin ? (
          <>
            <StatBox label="Total Employees" value={totalEmployees} />
            <StatBox label="Admins" value={stats?.totalAdmins ?? "-"} />
            <StatBox label="Managers" value={stats?.totalManagers ?? "-"} />
            <StatBox label="Employees" value={stats?.totalRegularEmployees ?? "-"} />
            <StatBox label="Signed In Now" value={signedInEmployees} />
            <StatBox label="Today Attendance" value={stats?.todayAttendanceCount ?? 0} />
            <StatBox label="Active Sessions" value={stats?.activeAttendanceSessions ?? 0} />
            <StatBox label="Attendance Records" value={stats?.totalAttendanceRecords ?? 0} />
            <StatBox label="Total Worked Hours" value={stats?.totalWorkedHours ?? "0h 0m"} />
            <StatBox label="Pending Requests" value={pendingApplications} />
            <StatBox label="Approved Requests" value={approvedApplications} />
            <StatBox label="Rejected Requests" value={rejectedApplications} />
            <StatBox label="Generated PDFs" value={generatedPdfs} />
            <StatBox label="Audit Logs" value={totalAuditLogs} />
          </>
        ) : (
          <>
            <StatBox
              label="Days with Company"
              value={getDaysWithCompany(currentUser?.joinDate)}
            />
            <StatBox
              label="Leaves Remaining"
              value={currentUser?.leavesRemaining ?? "-"}
            />
            <StatBox label="My Requests" value={myApplications.length} />
            <StatBox
              label="Sign Status"
              value={currentUser?.signedIn ? "Signed In" : "Signed Out"}
            />
            {isManager && (
              <>
                <StatBox label="Team Requests" value={visibleApplications.length} />
                <StatBox label="Pending Requests" value={pendingApplications} />
              </>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <Card title="System Overview">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div style={styles.listItem}>
              <div>
                <div style={{ fontWeight: "bold" }}>PDF Documents</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Generated approval/reference documents
                </div>
              </div>
              <strong>{generatedPdfs}</strong>
            </div>

            <div style={styles.listItem}>
              <div>
                <div style={{ fontWeight: "bold" }}>Attendance Hours</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Total completed working time
                </div>
              </div>
              <strong>{stats?.totalWorkedHours ?? "0h 0m"}</strong>
            </div>

            <div style={styles.listItem}>
              <div>
                <div style={{ fontWeight: "bold" }}>Today Attendance</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Attendance records created today
                </div>
              </div>
              <strong>{stats?.todayAttendanceCount ?? 0}</strong>
            </div>

            <div style={styles.listItem}>
              <div>
                <div style={{ fontWeight: "bold" }}>Audit Events</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Logged system actions
                </div>
              </div>
              <strong>{totalAuditLogs}</strong>
            </div>
          </div>
        </Card>
      )}

      <Card title={isAdmin ? "Recent Applications" : isManager ? "Team Applications" : "My Applications"}>
        {visibleApplications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          visibleApplications.slice(0, 5).map((app) => (
            <div key={app.id} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: "bold" }}>{app.title}</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {app.employeeName} | {app.type} | {app.createdAt}
                </div>
                {app.pdfGenerated && (
                  <div style={{ fontSize: 12, color: "#047857", marginTop: 4 }}>
                    PDF generated
                  </div>
                )}
              </div>

              <StatusBadge status={app.status} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}