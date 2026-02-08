import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Team() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching team:", err);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>Team Directory</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>
            Manage and view all members in your organization.
          </p>
        </div>
        <button onClick={() => navigate("/dashboard")} style={backBtn}>
          ← Back to Dashboard
        </button>
      </header>

      {/* SEARCH BAR */}
      <div style={searchContainer}>
        <input
          type="text"
          placeholder="Search by name or email..."
          style={searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading team members...</p>
      ) : (
        <div style={gridStyle}>
          {filteredUsers.map((u) => (
            <div key={u._id} style={userCard}>
              <div style={avatarStyle}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '18px' }}>{u.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{u.email}</p>
              </div>
              <div style={badgeContainer}>
                <span style={roleBadge}>Member</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          No team members found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

// --- POLISHED STYLES ---
const containerStyle = { padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const backBtn = { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "600", fontSize: "14px" };

const searchContainer = { marginBottom: "30px", maxWidth: "400px" };
const searchInput = { 
  width: "100%", 
  padding: "12px 16px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0", 
  fontSize: "14px", 
  outline: "none", 
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
};

const gridStyle = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
  gap: "25px" 
};

const userCard = { 
  background: "#fff", 
  padding: "30px 20px", 
  borderRadius: "20px", 
  border: "1px solid #e2e8f0", 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "center",
  transition: "transform 0.2s, boxShadow 0.2s",
  cursor: "default"
};

const avatarStyle = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "bold",
  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
};

const badgeContainer = { marginTop: "20px" };
const roleBadge = {
  background: "#f1f5f9",
  color: "#475569",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};