import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Projects", path: "/projects", icon: "📁" },
    { name: "Team", path: "/team", icon: "👥" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={layoutWrapper}>
      {/* SIDEBAR - Fixed on the left */}
      <aside style={sidebarStyle}>
        <div style={logoSection}>
          <span style={{ fontSize: "24px" }}>🐞</span>
          <h2 style={logoText}>BugTracker</h2>
        </div>

        <nav style={navLinksContainer}>
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...navItem,
                backgroundColor: location.pathname === item.path ? "#3182ce" : "transparent",
                color: location.pathname === item.path ? "#fff" : "#cbd5e1",
              }}
            >
              <span style={{ marginRight: "12px" }}>{item.icon}</span>
              {item.name}
            </div>
          ))}
        </nav>

        <button onClick={handleLogout} style={sidebarLogoutBtn}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={mainContentStyle}>
        {/* ❌ THE HEADER BLOCK THAT WAS CAUSING THE DOUBLE HEADER HAS BEEN REMOVED FROM HERE */}

        {/* PAGE CONTENT - This renders Dashboard, Projects, etc. */}
        <div style={contentInnerWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
}

// --- UPDATED STYLES FOR THE CLEAN LAYOUT ---
const layoutWrapper = { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" };

const sidebarStyle = {
  width: "260px",
  backgroundColor: "#0f172a",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "30px 20px",
  position: "fixed",
  height: "100vh",
};

const logoSection = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "50px", paddingLeft: "10px" };
const logoText = { margin: 0, fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" };

const navLinksContainer = { flex: 1 };
const navItem = {
  display: "flex",
  alignItems: "center",
  padding: "12px 15px",
  borderRadius: "10px",
  marginBottom: "8px",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: "15px",
  fontWeight: "500",
};

const sidebarLogoutBtn = {
  marginTop: "auto",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "transparent",
  color: "#f8fafc",
  cursor: "pointer",
  fontWeight: "600",
};

const mainContentStyle = { 
  flex: 1, 
  marginLeft: "260px", // Pushes content to the right of the sidebar
  display: "flex", 
  flexDirection: "column" 
};

const contentInnerWrapper = { 
  padding: "40px" // Spacing around your workspace content
};