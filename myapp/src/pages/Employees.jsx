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

export default function Employees() {
  const employees = useSelector((state) => state.employees.list);

  return (
    <Card title="Employees">
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
    </Card>
  );
}