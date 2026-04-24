import React from "react";
import { useSelector } from "react-redux";
import { styles } from "../utils/styles";
import { getDaysWithCompany } from "../utils/helpers";
import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import StatBox from "../components/common/StatBox";
import { selectCurrentUser, selectIsAdmin } from "../features/auth/selectors";

export default function Dashboard() {
  const employees = useSelector((state) => state.employees.list);
  const applications = useSelector((state) => state.applications.list);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  const myApplications = isAdmin
    ? applications
    : applications.filter((a) => a.employeeId === currentUser.id);

  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const signedInCount = employees.filter((e) => e.signedIn).length;

  return (
    <div>
      <div style={styles.statsGrid}>
        {isAdmin ? (
          <>
            <StatBox label="Total Employees" value={employees.length} />
            <StatBox label="Pending Requests" value={pendingCount} />
            <StatBox label="Approved Requests" value={approvedCount} />
            <StatBox label="Signed In" value={signedInCount} />
          </>
        ) : (
          <>
            <StatBox label="Days with Company" value={getDaysWithCompany(currentUser.joinDate)} />
            <StatBox label="Leaves Remaining" value={currentUser.leavesRemaining} />
            <StatBox label="My Requests" value={myApplications.length} />
            <StatBox label="Sign Status" value={currentUser.signedIn ? "Signed In" : "Signed Out"} />
          </>
        )}
      </div>

      <Card title={isAdmin ? "Recent Applications" : "My Applications"}>
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
              <StatusBadge status={app.status} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}