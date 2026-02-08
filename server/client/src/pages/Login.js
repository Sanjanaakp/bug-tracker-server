import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={pageContainer}>
      <div style={loginCard}>
        {/* Logo Section */}
        <div style={logoSection}>
          <span style={logoIcon}>🐞</span>
          <h1 style={logoText}>BugTracker</h1>
        </div>

        <h2 style={welcomeText}>Welcome Back</h2>
        <p style={subText}>Please enter your details to sign in.</p>

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={loginBtn}>
            Sign In
          </button>
        </form>

        <p style={footerText}>
          Don't have an account? <Link to="/register" style={linkStyle}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

// --- STYLES ---
const pageContainer = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc", // Light slate background
  fontFamily: "'Inter', sans-serif",
};

const loginCard = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
};

const logoSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginBottom: "20px",
};

const logoIcon = { fontSize: "32px" };

const logoText = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const welcomeText = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "8px",
};

const subText = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  textAlign: "left",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  backgroundColor: "#fcfcfc",
};

const loginBtn = {
  background: "#2563eb", // Primary blue
  color: "#ffffff",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "10px",
  transition: "background 0.2s",
};

const footerText = {
  marginTop: "24px",
  fontSize: "14px",
  color: "#64748b",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: "600",
};