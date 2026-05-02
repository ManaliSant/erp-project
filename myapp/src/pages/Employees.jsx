import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";

import { selectIsAdmin } from "../features/auth/selectors";

import {
  fetchEmployeesPage,
  createEmployee,
  resetEmployeePassword,
} from "../services/employeeService";

export default function Employees() {
  const isAdmin = useSelector(selectIsAdmin);

  const [employees, setEmployees] = useState([]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  async function loadEmployees(targetPage = page) {
    try {
      setLoading(true);
      setError("");

      const response = await fetchEmployeesPage({
        page: targetPage,
        size,
        search,
      });

      setEmployees(Array.isArray(response.content) ? response.content : []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setNumberOfElements(response.numberOfElements || 0);
      setPage(response.number || targetPage);
    } catch (err) {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadEmployees(0);
    }
  }, [isAdmin, size, search]);

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
      setSuccess("");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const payload = {
        employeeCode: form.employeeCode.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        department: form.department.trim(),
        designation: form.designation.trim(),
        manager: form.manager.trim(),
        joinDate: form.joinDate || new Date().toISOString().split("T")[0],
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

      setSuccess("Employee created successfully.");
      await loadEmployees(0);
    } catch (err) {
      setError("Failed to create employee. Check duplicate email or employee code.");
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(employee) {
    const newPassword = window.prompt(
      `Enter new password for ${employee.name}:`,
      "emp123"
    );

    if (!newPassword) return;

    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      setSuccess("");
      return;
    }

    try {
      setResettingId(employee.id);
      setError("");
      setSuccess("");

      await resetEmployeePassword(employee.id, {
        newPassword: newPassword.trim(),
      });

      setSuccess(`Password reset successfully for ${employee.name}.`);
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setResettingId(null);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(0);
  }

  function goToPreviousPage() {
    if (page > 0) {
      loadEmployees(page - 1);
    }
  }

  function goToNextPage() {
    if (page < totalPages - 1) {
      loadEmployees(page + 1);
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

      {success && (
        <p style={{ marginBottom: 12, color: "green", fontSize: 13 }}>
          {success}
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
                onChange={(e) => updateField("leavesRemaining", e.target.value)}
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

      <Card title="Employees">
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            style={{ ...styles.input, maxWidth: 320 }}
            value={searchInput}
            placeholder="Search by name, email, or department"
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <button type="submit" style={styles.primaryButton}>
            Search
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={handleClearSearch}
          >
            Clear
          </button>

          <select
            style={{ ...styles.input, maxWidth: 120 }}
            value={size}
            onChange={(e) => {
              setPage(0);
              setSize(Number(e.target.value));
            }}
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </form>

        <div style={{ marginBottom: 12, fontSize: 13, color: "#555" }}>
          Showing <strong>{numberOfElements}</strong> records on this page · Total
          employees: <strong>{totalElements}</strong>
          {search && (
            <>
              {" "}
              · Search: <strong>{search}</strong>
            </>
          )}
        </div>

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
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
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
                  <td style={styles.td}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={resettingId === employee.id}
                      onClick={() => handleResetPassword(employee)}
                    >
                      {resettingId === employee.id
                        ? "Resetting..."
                        : "Reset Password"}
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && employees.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={11}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={page === 0 || loading}
            onClick={goToPreviousPage}
          >
            Previous
          </button>

          <div style={{ fontSize: 13 }}>
            Page <strong>{totalPages === 0 ? 0 : page + 1}</strong> of{" "}
            <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            disabled={page >= totalPages - 1 || loading}
            onClick={goToNextPage}
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
}