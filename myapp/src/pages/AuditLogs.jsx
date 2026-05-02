import React, { useEffect, useState } from "react";

import Card from "../components/common/Card";
import { styles } from "../utils/styles";
import { fetchAuditLogs } from "../services/auditService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAuditLogs(targetPage = page) {
    try {
      setLoading(true);
      setError("");

      const response = await fetchAuditLogs({
        page: targetPage,
        size,
        search,
      });

      setLogs(Array.isArray(response.content) ? response.content : []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setNumberOfElements(response.numberOfElements || 0);
      setPage(response.number || targetPage);
    } catch (err) {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs(0);
  }, [size, search]);

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
      loadAuditLogs(page - 1);
    }
  }

  function goToNextPage() {
    if (page < totalPages - 1) {
      loadAuditLogs(page + 1);
    }
  }

  return (
    <div>
      {error && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 13 }}>
          {error}
        </p>
      )}

      <Card title="Audit Logs">
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
            style={{ ...styles.input, maxWidth: 340 }}
            value={searchInput}
            placeholder="Search by actor, action, or target"
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
          Showing <strong>{numberOfElements}</strong> logs on this page · Total
          logs: <strong>{totalElements}</strong>
          {search && (
            <>
              {" "}
              · Search: <strong>{search}</strong>
            </>
          )}
        </div>

        {loading && <p>Loading audit logs...</p>}

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Actor</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Target</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={styles.td}>{log.id}</td>
                  <td style={styles.td}>{log.actorEmail}</td>
                  <td style={styles.td}>{log.action}</td>
                  <td style={styles.td}>{log.target}</td>
                  <td style={styles.td}>{log.details}</td>
                  <td style={styles.td}>{log.timestamp}</td>
                </tr>
              ))}

              {!loading && logs.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={6}>
                    No audit logs found.
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