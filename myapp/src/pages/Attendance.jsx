import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import StatBox from "../components/common/StatBox";
import { styles } from "../utils/styles";

import { restoreSession } from "../features/auth/authSlice";

import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsManager,
} from "../features/auth/selectors";

import { fetchMyProfile } from "../services/employeeService";

import {
  signIn,
  signOut,
  fetchMyAttendance,
  fetchTeamAttendance,
  fetchAllAttendance,
  fetchAttendanceByDate,
  fetchAttendanceByRange,
} from "../services/attendanceService";

export default function Attendance() {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  const [myAttendance, setMyAttendance] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [rangeStartDate, setRangeStartDate] = useState("");
  const [rangeEndDate, setRangeEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignedIn = currentUser?.signedIn === true;

  const todayRecord = myAttendance.find(
    (record) => record.attendanceDate === new Date().toISOString().split("T")[0]
  );

  async function refreshCurrentUser() {
    const user = await fetchMyProfile();
    dispatch(restoreSession(user));
  }

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const myData = await fetchMyAttendance();
      setMyAttendance(Array.isArray(myData) ? myData : []);

      if (isManager) {
        const teamData = await fetchTeamAttendance();
        setTeamAttendance(Array.isArray(teamData) ? teamData : []);
      }

      if (isAdmin) {
        const allData = await fetchAllAttendance();
        setAllAttendance(Array.isArray(allData) ? allData : []);
      }
    } catch (err) {
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshEverything() {
    await refreshCurrentUser();
    await loadAttendance();
  }

  useEffect(() => {
    loadAttendance();
  }, [isAdmin, isManager]);

  async function handleSignIn() {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await signIn();
      await refreshEverything();

      setSuccess("Signed in successfully.");
    } catch (err) {
      setError("Sign in failed. You may already be signed in today.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await signOut();
      await refreshEverything();

      setSuccess("Signed out successfully.");
    } catch (err) {
      setError("Sign out failed. You may need to sign in first or already signed out.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFilterByDate(e) {
    e.preventDefault();

    if (!filterDate) {
      setError("Select a date first.");
      setSuccess("");
      return;
    }

    try {
      setFilterLoading(true);
      setError("");
      setSuccess("");

      const data = await fetchAttendanceByDate(filterDate);
      setAllAttendance(Array.isArray(data) ? data : []);

      setSuccess(`Showing attendance for ${filterDate}.`);
    } catch (err) {
      setError("Failed to filter attendance by date.");
    } finally {
      setFilterLoading(false);
    }
  }

  async function handleFilterByRange(e) {
    e.preventDefault();

    if (!rangeStartDate || !rangeEndDate) {
      setError("Select start date and end date.");
      setSuccess("");
      return;
    }

    try {
      setFilterLoading(true);
      setError("");
      setSuccess("");

      const data = await fetchAttendanceByRange(rangeStartDate, rangeEndDate);
      setAllAttendance(Array.isArray(data) ? data : []);

      setSuccess(`Showing attendance from ${rangeStartDate} to ${rangeEndDate}.`);
    } catch (err) {
      setError("Failed to filter attendance by range.");
    } finally {
      setFilterLoading(false);
    }
  }

  async function handleClearFilters() {
    setFilterDate("");
    setRangeStartDate("");
    setRangeEndDate("");
    setSuccess("");
    await loadAttendance();
  }

  function getTotalWorkedMinutes(records) {
    return records.reduce((total, record) => total + Number(record.workedMinutes || 0), 0);
  }

  function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function renderAttendanceTable(records) {
    if (!records || records.length === 0) {
      return <p style={{ color: "#666" }}>No attendance records found.</p>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Manager</th>
              <th style={styles.th}>Sign In</th>
              <th style={styles.th}>Sign Out</th>
              <th style={styles.th}>Worked Hours</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td style={styles.td}>{record.attendanceDate}</td>
                <td style={styles.td}>{record.employeeName}</td>
                <td style={styles.td}>{record.employeeEmail}</td>
                <td style={styles.td}>{record.role}</td>
                <td style={styles.td}>{record.department}</td>
                <td style={styles.td}>{record.manager}</td>
                <td style={styles.td}>{record.signInTime || "-"}</td>
                <td style={styles.td}>{record.signOutTime || "-"}</td>
                <td style={styles.td}>{record.workedHours || "0h 0m"}</td>
                <td style={styles.td}>
                  <StatusBadge status={record.status || "-"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card title="Attendance">
        <p>Loading user...</p>
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

      <div style={styles.statsGrid}>
        <StatBox
          label="Current Status"
          value={isSignedIn ? "Signed In" : "Signed Out"}
        />
        <StatBox
          label="Today's Worked Time"
          value={todayRecord?.workedHours || "0h 0m"}
        />
        <StatBox
          label="My Attendance Records"
          value={myAttendance.length}
        />
        <StatBox
          label="Total Worked Time"
          value={formatMinutes(getTotalWorkedMinutes(myAttendance))}
        />
      </div>

      <Card title="My Attendance">
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px 0" }}>
            <strong>{currentUser.name}</strong>
          </p>

          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            {currentUser.role} · {currentUser.department || "No department"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button
            type="button"
            style={styles.successButton}
            disabled={actionLoading || isSignedIn}
            onClick={handleSignIn}
          >
            {actionLoading ? "Processing..." : "Sign In"}
          </button>

          <button
            type="button"
            style={styles.dangerButton}
            disabled={actionLoading || !isSignedIn}
            onClick={handleSignOut}
          >
            {actionLoading ? "Processing..." : "Sign Out"}
          </button>
        </div>

        {loading ? (
          <p>Loading attendance...</p>
        ) : (
          renderAttendanceTable(myAttendance)
        )}
      </Card>

      {isManager && (
        <Card title="Team Attendance">
          {loading ? (
            <p>Loading team attendance...</p>
          ) : (
            renderAttendanceTable(teamAttendance)
          )}
        </Card>
      )}

      {isAdmin && (
        <Card title="Admin Attendance Filters">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <form
              onSubmit={handleFilterByDate}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="date"
                style={styles.input}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={filterLoading}
              >
                Filter Date
              </button>
            </form>

            <form
              onSubmit={handleFilterByRange}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="date"
                style={styles.input}
                value={rangeStartDate}
                onChange={(e) => setRangeStartDate(e.target.value)}
              />

              <input
                type="date"
                style={styles.input}
                value={rangeEndDate}
                onChange={(e) => setRangeEndDate(e.target.value)}
              />

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={filterLoading}
              >
                Filter Range
              </button>
            </form>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleClearFilters}
              disabled={filterLoading}
            >
              Clear Filters
            </button>
          </div>
        </Card>
      )}

      {isAdmin && (
        <Card title="All Attendance">
          <div style={{ marginBottom: 12, fontSize: 13, color: "#555" }}>
            Records: <strong>{allAttendance.length}</strong> · Total Worked Time:{" "}
            <strong>{formatMinutes(getTotalWorkedMinutes(allAttendance))}</strong>
          </div>

          {loading || filterLoading ? (
            <p>Loading all attendance...</p>
          ) : (
            renderAttendanceTable(allAttendance)
          )}
        </Card>
      )}
    </div>
  );
}