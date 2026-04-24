import React from "react";
import { styles } from "../../utils/styles";

export default function StatBox({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}