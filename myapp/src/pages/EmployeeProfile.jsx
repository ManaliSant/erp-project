// export default function Dashboard() {
//   return <div>Dashboard</div>;
// }

import React from "react";
import { useSelector } from "react-redux";
import Card from "../components/common/Card";
import { styles } from "../utils/styles";
import { getDaysWithCompany } from "../utils/helpers";

function profileField(label, value) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.fieldValue}>{value}</div>
    </div>
  );
}

export default function EmployeeProfile() {
  const employees = useSelector((state) => state.employees.list);
  const selectedUserId = useSelector((state) => state.auth.selectedUserId);
  const currentUser = employees.find((e) => e.id === selectedUserId);

  return (
    <Card title="Employee Profile">
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
    </Card>
  );
}