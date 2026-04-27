import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";

import { setEmployees } from "../features/employees/employeeSlice";
import { selectIsAdmin } from "../features/auth/selectors";
import { fetchEmployees, createEmployee } from "../services/employeeService";

export default function Employees() {
  const dispatch = useDispatch();

  const employees = useSelector((state) => state.employees.list);
  const isAdmin = useSelector(selectIsAdmin);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    email: "",
    password: "emp123",
    role: "EMPLOYEE",
    department: "",
    designation: "",
    manager: "",
    joinDate: "",
    leavesRemaining: 10,
    status: "Active",
  });

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [employees]);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchEmployees();

      if (Array.isArray(data)) {
        dispatch(setEmployees(data));
      }
    } catch (err) {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!form.employeeCode.trim()) return "Employee code is required.";
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password.trim()) return "Password is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.department.trim()) return "Department is required.";
    if (!form.designation.trim()) return "Designation is required.";
    if (!form.manager.trim()) return "Manager is required.";
    return "";
  }

  async function handleCreateEmployee(e) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setCreating(true);
      setError("");

      const payload = {
        employeeCode: form.employeeCode.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        department: form.department,
        designation: form.designation,
        manager: form.manager,
        joinDate:
          form.joinDate || new Date().toISOString().split("T")[0],
        leavesRemaining: Number(form.leavesRemaining || 10),
        status: form.status || "Active",
      };

      await createEmployee(payload);

      setForm({
        employeeCode: "",
        name: "",
        email: "",
        password: "emp123",
        role: "EMPLOYEE",
        department: "",
        designation: "",
        manager: "",
        joinDate: "",
        leavesRemaining: 10,
        status: "Active",
      });

      await loadEmployees();

      alert("Employee created successfully.");
    } catch (err) {
      setError("Failed to create employee. Check duplicate email or employee code.");
    } finally {
      setCreating(false);
    }
  }

  if (!isAdmin) {
    return (
      <Card title="Access Denied">
        <p>You do not have permission to view employees.</p>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 13 }}>
          {error}
        </p>
      )}

      <Card title="Add Employee">
        <form onSubmit={handleCreateEmployee}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Employee Code</label>
              <input
                style={styles.input}
                value={form.employeeCode}
                placeholder="EMP999"
                onChange={(e) => updateField("employeeCode", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                value={form.name}
                placeholder="John Test"
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                value={form.email}
                placeholder="john.test@company.com"
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Default Password</label>
              <input
                style={styles.input}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Role</label>
              <select
                style={styles.input}
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Department</label>
              <input
                style={styles.input}
                value={form.department}
                placeholder="Engineering"
                onChange={(e) => updateField("department", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Designation</label>
              <input
                style={styles.input}
                value={form.designation}
                placeholder="Software Engineer"
                onChange={(e) => updateField("designation", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Manager</label>
              <input
                style={styles.input}
                value={form.manager}
                placeholder="Sneha Mehta"
                onChange={(e) => updateField("manager", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Join Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.joinDate}
                onChange={(e) => updateField("joinDate", e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Leaves Remaining</label>
              <input
                type="number"
                style={styles.input}
                value={form.leavesRemaining}
                onChange={(e) =>
                  updateField("leavesRemaining", e.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.label}>Status</label>
              <select
                style={styles.input}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.primaryButton, marginTop: 16 }}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Employee"}
          </button>
        </form>
      </Card>

      <Card title={`Employees (${sortedEmployees.length})`}>
        {loading && <p>Loading employees...</p>}

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Manager</th>
                <th style={styles.th}>Leaves</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td style={styles.td}>{employee.id}</td>
                  <td style={styles.td}>{employee.employeeCode}</td>
                  <td style={styles.td}>{employee.name}</td>
                  <td style={styles.td}>{employee.email}</td>
                  <td style={styles.td}>{employee.role}</td>
                  <td style={styles.td}>{employee.department}</td>
                  <td style={styles.td}>{employee.designation}</td>
                  <td style={styles.td}>{employee.manager}</td>
                  <td style={styles.td}>{employee.leavesRemaining}</td>
                  <td style={styles.td}>
                    <StatusBadge status={employee.status} />
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