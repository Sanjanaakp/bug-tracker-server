import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (!token) return navigate("/");
    fetchProfile();
    fetchProjects();
    fetchUsers();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://bug-tracker-api-1uut.onrender.com/api/projects",
        { name, description, members: selectedMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      setSelectedMembers([]);
      setSearchTerm("");
      setShowDropdown(false);
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Delete this project?")) {
      try {
        await axios.delete(`https://bug-tracker-api-1uut.onrender.com/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProjects();
      } catch (err) { alert(err.response?.data?.message || "Error"); }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>Projects</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Logged in as: <b>{user.name}</b></p>
        </div>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </header>

      {/* CREATE PROJECT SECTION */}
      <section style={formCardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Create New Project</h3>
        <form onSubmit={createProject} style={formGrid}>
          <input
            placeholder="Project Name"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Project Description"
            style={inputStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {/* SEARCHABLE DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setShowDropdown(!showDropdown)} style={dropdownTrigger}>
              {selectedMembers.length > 0 
                ? `${selectedMembers.length} Members Selected` 
                : "Select Team Members"}
              <span>{showDropdown ? '▲' : '▼'}</span>
            </div>

            {showDropdown && (
              <div style={dropdownMenu}>
                <input 
                  placeholder="Search users..." 
                  style={searchInDropdown}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {filteredUsers.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => toggleMember(u._id)}
                      style={{
                        ...dropdownItem,
                        backgroundColor: selectedMembers.includes(u._id) ? '#f1f5f9' : '#fff'
                      }}
                    >
                      <input type="checkbox" readOnly checked={selectedMembers.includes(u._id)} style={{ marginRight: '10px' }} />
                      {u.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" style={primaryBtn}>Create Project</button>
        </form>
      </section>

      {/* PROJECT GRID */}
      <div style={gridStyle}>
        {projects.map(p => (
          <div key={p._id} style={projectCard}>
            <div onClick={() => navigate(`/projects/${p._id}`)} style={{ cursor: 'pointer' }}>
              <h3 style={{ color: '#2563eb', marginBottom: '8px', marginTop: 0 }}>{p.name}</h3>
              <p style={{ fontSize: '14px', color: '#475569', minHeight: '40px' }}>{p.description}</p>
            </div>
            <div style={cardFooter}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>👥 {p.members?.length} Members</span>
              {(p.owner?._id === user._id || p.owner === user._id) && (
                <button onClick={() => deleteProject(p._id)} style={deleteBtn}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- POLISHED STYLES ---
const containerStyle = { padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const formCardStyle = { background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", marginBottom: "40px", maxWidth: "800px" };
const formGrid = { display: "flex", flexDirection: "column", gap: "15px" };
const inputStyle = { padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" };
const primaryBtn = { background: "#2563eb", color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" };
const projectCard = { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" };
const cardFooter = { marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
const deleteBtn = { background: "#fee2e2", color: "#ef4444", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" };
const logoutBtn = { background: "#fff", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "500", color: "#475569" };

// Dropdown Specific
const dropdownTrigger = { padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", color: "#475569" };
const dropdownMenu = { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", marginTop: "5px", zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: '10px' };
const dropdownItem = { padding: "10px 15px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", borderRadius: '6px' };
const searchInDropdown = { width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #eee', fontSize: '13px', outline: 'none' };