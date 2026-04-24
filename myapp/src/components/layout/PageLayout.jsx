import React from "react";
import { styles } from "../../utils/styles";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PageLayout(props) {
  const { currentUser, isAdmin, children } = props;

  if (!currentUser) {
    return (
      <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        Loading user...
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <Sidebar currentUser={currentUser} isAdmin={isAdmin} />

      <div style={styles.main}>
        <Topbar currentUser={currentUser} />
        {children}
      </div>
    </div>
  );
}