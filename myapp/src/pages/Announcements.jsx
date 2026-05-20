import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
} from "../services/announcementService";
import { selectIsAdmin } from "../features/auth/selectors";
import { styles } from "../utils/styles";

export default function Announcements() {
  const isAdmin = useSelector(selectIsAdmin);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!form.content.trim()) {
      setFormError("Content is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const created = await createAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
      });
      setAnnouncements([created, ...announcements]);
      setForm({ title: "", content: "" });
      setShowForm(false);
    } catch {
      setFormError("Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete announcement.");
    }
  }

  async function handleExpand(announcement) {
    const id = announcement.id;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!announcement.read) {
      try {
        await markAnnouncementRead(id);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, read: true } : a))
        );
      } catch {
        // best effort
      }
    }
  }

  const unreadCount = announcements.filter((a) => !a.read).length;

  return (
    <div>
      <div style={styles.topbar}>
        <div>
          <h2 style={{ margin: 0 }}>
            Announcements
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  background: "#dc3545",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "2px 10px",
                  fontSize: 13,
                  fontWeight: "bold",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h2>
        </div>

        {isAdmin && (
          <button
            style={styles.primaryButton}
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
            }}
          >
            {showForm ? "Cancel" : "+ Post Announcement"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 14px 0" }}>New Announcement</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Content</label>
              <textarea
                style={{ ...styles.textarea, minHeight: 100 }}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the announcement content..."
              />
            </div>

            {formError && (
              <p style={{ color: "red", fontSize: 12, margin: "0 0 8px" }}>
                {formError}
              </p>
            )}

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <p style={{ color: "#555", fontSize: 13 }}>Loading announcements...</p>
      )}

      {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

      {!loading && announcements.length === 0 && (
        <div style={{ ...styles.card, color: "#555" }}>
          No announcements yet.
        </div>
      )}

      {announcements.map((a) => {
        const isExpanded = !!expanded[a.id];

        return (
          <div
            key={a.id}
            style={{
              ...styles.card,
              borderLeft: a.read ? "4px solid #e5e7eb" : "4px solid #111827",
              cursor: "pointer",
              marginBottom: 12,
            }}
            onClick={() => handleExpand(a)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: a.read ? "normal" : "bold",
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#111827",
                  }}
                >
                  {a.title}
                  {!a.read && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: "#111827",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "1px 8px",
                        fontSize: 11,
                        verticalAlign: "middle",
                      }}
                    >
                      New
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {a.createdByName} &middot; {a.createdAt}
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: "#374151",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.content}
                  </div>
                )}
              </div>

              <div
                style={{ display: "flex", gap: 8, alignItems: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {isExpanded ? "▲" : "▼"}
                </span>

                {isAdmin && (
                  <button
                    style={{
                      ...styles.dangerButton,
                      padding: "4px 10px",
                      fontSize: 12,
                    }}
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
