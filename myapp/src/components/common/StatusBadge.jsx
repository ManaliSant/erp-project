import React from "react";
import { styles } from "../../utils/styles";
import { getBadgeStyle } from "../../utils/helpers";

export default function StatusBadge({ status, label }) {
  return (
    <span style={{ ...styles.badge, ...getBadgeStyle(status) }}>
      {label || status}
    </span>
  );
}