export function getDaysWithCompany(joinDate) {
  const start = new Date(joinDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getCurrentDateTime() {
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

export function getBadgeStyle(status) {
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