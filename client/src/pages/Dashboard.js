import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      // Fetch User Profile for the header
      const profile = await axios.get("https://bug-tracker-api-1uut.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(profile.data);

      // Fetch Projects where user is a member
      const res = await axios.get("https://bug-tracker-api-1uut.onrender.com/api/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      
      {/* WORKSPACE HEADER WITH LOGOUT */}
      <div style={headerWrapper}>
        <div style={userInfo}>
          <h1 style={titleStyle}>Your Workspace</h1>
          <p style={subtitleStyle}>Welcome back, <b>{user.name}</b></p>
        </div>
        
        <div style={actionArea}>
          {/*<button onClick={() => navigate("/settings")} style={settingsBtn}>
            ⚙️ Settings
          </button>*/}
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* PROJECT GRID */}
      <div style={gridStyle}>
        {projects.map((proj) => (
          <div key={proj._id} style={projectCardStyle}>
            <div style={{ padding: "25px" }}>
              <span style={tagStyle}>Active Project</span>
              <h3 style={{ margin: "15px 0 10px 0", color: "#1e293b" }}>{proj.name}</h3>
              <p style={descStyle}>{proj.description || "Project management workspace"}</p>
            </div>
            
            <div style={footerStyle}>
               <button onClick={() => navigate(`/projects/${proj._id}`)} style={openBoardBtn}>
                 Open Board
               </button>
               <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                 👥 {proj.members?.length || 0} Members
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UPDATED STYLES ---
const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "40px",
  paddingBottom: "20px",
  borderBottom: "1px solid #e2e8f0"
};

const userInfo = { textAlign: "left" };
const titleStyle = { fontSize: "2.2rem", color: "#1a202c", margin: "0", fontWeight: "700" };
const subtitleStyle = { color: "#64748b", fontSize: "1rem", marginTop: "5px" };

const actionArea = { display: "flex", gap: "12px" };

const logoutBtn = {
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  padding: "10px 20px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s"
};

const settingsBtn = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  padding: "10px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  color: "#475569"
};

const gridStyle = {
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
  gap: "30px",
  maxWidth: "1200px"
};

const projectCardStyle = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid #f1f5f9"
};

const descStyle = { color: "#64748b", fontSize: "0.95rem", height: "45px", overflow: "hidden" };
const footerStyle = { padding: "20px 25px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" };
const tagStyle = { background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" };
const openBoardBtn = { background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };